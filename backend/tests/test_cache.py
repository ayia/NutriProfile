"""Tests for the cache system."""
import pytest
from unittest.mock import AsyncMock, patch
from app.core.cache import Cache, MemoryCache, get_cache, tier_cache_key, pricing_cache_key


class TestMemoryCache:
    """Test in-memory cache backend."""

    @pytest.mark.asyncio
    async def test_set_and_get(self):
        """Test setting and getting values."""
        cache = MemoryCache()

        # Set value
        result = await cache.set("test_key", "test_value", ttl=300)
        assert result is True

        # Get value
        value = await cache.get("test_key")
        assert value == "test_value"

    @pytest.mark.asyncio
    async def test_get_nonexistent(self):
        """Test getting non-existent key."""
        cache = MemoryCache()
        value = await cache.get("nonexistent_key")
        assert value is None

    @pytest.mark.asyncio
    async def test_delete(self):
        """Test deleting a key."""
        cache = MemoryCache()

        # Set and verify
        await cache.set("test_key", "test_value")
        assert await cache.get("test_key") == "test_value"

        # Delete and verify
        result = await cache.delete("test_key")
        assert result is True
        assert await cache.get("test_key") is None

    @pytest.mark.asyncio
    async def test_ttl_expiration(self):
        """Test TTL expiration (simulated)."""
        import time

        cache = MemoryCache()

        # Set with very short TTL
        await cache.set("test_key", "test_value", ttl=1)

        # Value should exist immediately
        assert await cache.get("test_key") == "test_value"

        # Wait for expiration
        time.sleep(1.1)

        # Value should be expired
        assert await cache.get("test_key") is None

    @pytest.mark.asyncio
    async def test_clear_pattern(self):
        """Test clearing keys by pattern."""
        cache = MemoryCache()

        # Set multiple keys
        await cache.set("user_tier:1", "premium")
        await cache.set("user_tier:2", "free")
        await cache.set("other_key", "value")

        # Clear pattern
        deleted = await cache.clear_pattern("user_tier:*")
        assert deleted == 2

        # Verify cleared
        assert await cache.get("user_tier:1") is None
        assert await cache.get("user_tier:2") is None

        # Verify not cleared
        assert await cache.get("other_key") == "value"


class TestCache:
    """Test main cache interface."""

    @pytest.mark.asyncio
    async def test_json_serialization(self):
        """Test automatic JSON serialization."""
        cache = Cache()

        # Set complex object
        data = {"tier": "premium", "features": ["vision", "recipes"]}
        result = await cache.set("test_key", data, ttl=300)
        assert result is True

        # Get and verify deserialization
        retrieved = await cache.get("test_key")
        assert retrieved == data
        assert retrieved["tier"] == "premium"
        assert "vision" in retrieved["features"]

    @pytest.mark.asyncio
    async def test_get_with_default(self):
        """Test get with default value."""
        cache = Cache()

        # Non-existent key should return default
        value = await cache.get("nonexistent", default={"tier": "free"})
        assert value == {"tier": "free"}

    @pytest.mark.asyncio
    async def test_make_key(self):
        """Test cache key generation."""
        key = Cache.make_key("user_tier", "123")
        assert key == "user_tier:123"

        key = Cache.make_key("pricing", "plans", "v1")
        assert key == "pricing:plans:v1"

    @pytest.mark.asyncio
    async def test_hash_key(self):
        """Test key hashing."""
        hash1 = Cache.hash_key("some long data string")
        hash2 = Cache.hash_key("some long data string")
        hash3 = Cache.hash_key("different data")

        # Same data should produce same hash
        assert hash1 == hash2

        # Different data should produce different hash
        assert hash1 != hash3

        # Hash should be 16 chars (truncated SHA256)
        assert len(hash1) == 16


class TestCacheHelpers:
    """Test cache helper functions."""

    def test_tier_cache_key(self):
        """Test tier cache key generation."""
        key = tier_cache_key(123)
        assert key == "user_tier:123"

    def test_pricing_cache_key(self):
        """Test pricing cache key generation."""
        key = pricing_cache_key()
        assert key == "pricing:plans"

    @pytest.mark.asyncio
    async def test_get_cache_singleton(self):
        """Test get_cache returns same instance."""
        cache1 = get_cache()
        cache2 = get_cache()
        assert cache1 is cache2


class TestCacheDecorator:
    """Test @cached decorator."""

    @pytest.mark.asyncio
    async def test_cached_decorator_basic(self):
        """Test basic cached decorator functionality."""
        from app.core.cache import cached

        call_count = 0

        @cached(ttl=300, key_prefix="test_func")
        async def expensive_function(param: str) -> dict:
            nonlocal call_count
            call_count += 1
            return {"result": f"computed_{param}"}

        # First call should execute function
        result1 = await expensive_function("input1")
        assert result1 == {"result": "computed_input1"}
        assert call_count == 1

        # Second call with same params should use cache
        result2 = await expensive_function("input1")
        assert result2 == {"result": "computed_input1"}
        assert call_count == 1  # Not incremented

        # Different params should execute function again
        result3 = await expensive_function("input2")
        assert result3 == {"result": "computed_input2"}
        assert call_count == 2


class TestCacheIntegration:
    """Integration tests with subscription service."""

    @pytest.mark.asyncio
    async def test_tier_caching_in_service(self):
        """Test tier caching in SubscriptionService."""
        # This would require mocking database, but demonstrates expected flow
        pass  # TODO: Implement with proper DB mocking


# Run with: pytest backend/tests/test_cache.py -v
