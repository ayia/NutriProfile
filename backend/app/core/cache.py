"""
Cache system with Redis backend and graceful fallback.
Provides simple caching for frequently accessed data with TTL support.
"""
import logging
import json
import hashlib
from typing import Any, Optional, Callable
from functools import wraps
from datetime import timedelta

logger = logging.getLogger(__name__)

# Try to import Redis, fallback to None if not available
try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    logger.warning("redis not installed, using in-memory fallback cache")
    REDIS_AVAILABLE = False
    redis = None

from app.config import get_settings

settings = get_settings()


class CacheBackend:
    """Abstract cache backend interface."""

    async def get(self, key: str) -> Optional[str]:
        """Get value from cache."""
        raise NotImplementedError

    async def set(self, key: str, value: str, ttl: int = 300) -> bool:
        """Set value in cache with TTL in seconds."""
        raise NotImplementedError

    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        raise NotImplementedError

    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern. Returns count of deleted keys."""
        raise NotImplementedError


class RedisCache(CacheBackend):
    """Redis-based cache backend."""

    def __init__(self, redis_url: str):
        """Initialize Redis connection."""
        self.redis_url = redis_url
        self._client = None

    async def _get_client(self):
        """Lazy connection to Redis."""
        if self._client is None:
            try:
                self._client = await redis.from_url(
                    self.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
                # Test connection
                await self._client.ping()
                logger.info("Redis cache connected successfully")
            except Exception as e:
                logger.error(f"Redis connection failed: {e}")
                self._client = None
                raise

        return self._client

    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis."""
        try:
            client = await self._get_client()
            value = await client.get(key)
            return value
        except Exception as e:
            logger.warning(f"Redis GET error: {e}")
            return None

    async def set(self, key: str, value: str, ttl: int = 300) -> bool:
        """Set value in Redis with TTL."""
        try:
            client = await self._get_client()
            await client.setex(key, ttl, value)
            return True
        except Exception as e:
            logger.warning(f"Redis SET error: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from Redis."""
        try:
            client = await self._get_client()
            await client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Redis DELETE error: {e}")
            return False

    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern."""
        try:
            client = await self._get_client()
            keys = await client.keys(pattern)
            if keys:
                deleted = await client.delete(*keys)
                return deleted
            return 0
        except Exception as e:
            logger.warning(f"Redis CLEAR_PATTERN error: {e}")
            return 0


class MemoryCache(CacheBackend):
    """In-memory fallback cache (not shared across workers)."""

    def __init__(self):
        """Initialize in-memory cache."""
        self._cache: dict[str, tuple[str, float]] = {}
        logger.info("Using in-memory cache (single-worker only)")

    async def get(self, key: str) -> Optional[str]:
        """Get value from memory cache."""
        import time

        if key in self._cache:
            value, expires_at = self._cache[key]
            if time.time() < expires_at:
                return value
            else:
                # Expired, delete
                del self._cache[key]

        return None

    async def set(self, key: str, value: str, ttl: int = 300) -> bool:
        """Set value in memory cache with TTL."""
        import time

        expires_at = time.time() + ttl
        self._cache[key] = (value, expires_at)
        return True

    async def delete(self, key: str) -> bool:
        """Delete key from memory cache."""
        if key in self._cache:
            del self._cache[key]
            return True
        return False

    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern (simple startswith for memory)."""
        # Simple pattern matching: replace * with prefix match
        prefix = pattern.replace("*", "")
        keys_to_delete = [k for k in self._cache.keys() if k.startswith(prefix)]
        for key in keys_to_delete:
            del self._cache[key]
        return len(keys_to_delete)


class Cache:
    """
    Main cache interface with automatic fallback.
    Uses Redis if available, otherwise in-memory cache.
    """

    def __init__(self):
        """Initialize cache with appropriate backend."""
        self.backend: CacheBackend

        # Try to use Redis if available and configured
        if REDIS_AVAILABLE and hasattr(settings, 'REDIS_URL') and settings.REDIS_URL:
            try:
                self.backend = RedisCache(settings.REDIS_URL)
                logger.info("Cache: Redis backend initialized")
            except Exception as e:
                logger.warning(f"Redis init failed, using memory cache: {e}")
                self.backend = MemoryCache()
        else:
            self.backend = MemoryCache()

    async def get(self, key: str, default: Any = None) -> Any:
        """
        Get value from cache with JSON deserialization.

        Args:
            key: Cache key
            default: Default value if key not found

        Returns:
            Cached value or default
        """
        try:
            value = await self.backend.get(key)
            if value is not None:
                return json.loads(value)
        except (json.JSONDecodeError, Exception) as e:
            logger.warning(f"Cache GET error for key {key}: {e}")

        return default

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """
        Set value in cache with JSON serialization.

        Args:
            key: Cache key
            value: Value to cache (must be JSON-serializable)
            ttl: Time to live in seconds (default 5 minutes)

        Returns:
            True if successful, False otherwise
        """
        try:
            serialized = json.dumps(value)
            return await self.backend.set(key, serialized, ttl)
        except (TypeError, Exception) as e:
            logger.warning(f"Cache SET error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """
        Delete key from cache.

        Args:
            key: Cache key

        Returns:
            True if successful, False otherwise
        """
        return await self.backend.delete(key)

    async def clear_pattern(self, pattern: str) -> int:
        """
        Clear all keys matching pattern.

        Args:
            pattern: Pattern to match (supports * wildcard)

        Returns:
            Number of keys deleted
        """
        return await self.backend.clear_pattern(pattern)

    @staticmethod
    def make_key(*parts: str) -> str:
        """
        Create a cache key from parts.

        Args:
            *parts: Key parts to join

        Returns:
            Cache key string
        """
        return ":".join(str(p) for p in parts)

    @staticmethod
    def hash_key(data: str) -> str:
        """
        Create a hash from data for cache keys.

        Args:
            data: Data to hash

        Returns:
            SHA256 hash (hex)
        """
        return hashlib.sha256(data.encode()).hexdigest()[:16]


# Global cache instance
_cache_instance: Optional[Cache] = None


def get_cache() -> Cache:
    """Get global cache instance (singleton)."""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = Cache()
    return _cache_instance


def cached(
    ttl: int = 300,
    key_prefix: str = "",
    key_func: Optional[Callable] = None
):
    """
    Decorator to cache function results.

    Args:
        ttl: Time to live in seconds (default 5 minutes)
        key_prefix: Prefix for cache key
        key_func: Custom function to generate cache key from args

    Example:
        @cached(ttl=600, key_prefix="user_tier")
        async def get_effective_tier(user_id: int) -> str:
            # expensive operation
            return "premium"
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache = get_cache()

            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default: use function name + args hash
                args_str = json.dumps([args, kwargs], sort_keys=True, default=str)
                args_hash = Cache.hash_key(args_str)
                cache_key = Cache.make_key(key_prefix or func.__name__, args_hash)

            # Try to get from cache
            cached_value = await cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache HIT: {cache_key}")
                return cached_value

            # Cache miss, execute function
            logger.debug(f"Cache MISS: {cache_key}")
            result = await func(*args, **kwargs)

            # Store in cache
            await cache.set(cache_key, result, ttl)

            return result

        return wrapper
    return decorator


# Invalidation helpers

async def invalidate_user_tier_cache(user_id: int) -> None:
    """Invalidate tier cache for a user (after subscription change)."""
    cache = get_cache()
    pattern = f"user_tier:{user_id}:*"
    deleted = await cache.clear_pattern(pattern)
    logger.info(f"Invalidated {deleted} tier cache entries for user {user_id}")


async def invalidate_pricing_cache() -> None:
    """Invalidate pricing cache (after plan changes)."""
    cache = get_cache()
    await cache.delete("pricing:plans")
    logger.info("Invalidated pricing cache")


# Predefined cache keys

def tier_cache_key(user_id: int) -> str:
    """Generate cache key for user tier."""
    return Cache.make_key("user_tier", str(user_id))


def pricing_cache_key() -> str:
    """Generate cache key for pricing plans."""
    return "pricing:plans"
