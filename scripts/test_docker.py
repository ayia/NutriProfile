#!/usr/bin/env python3
"""
Script de test pour vérifier le déploiement Docker local.
Usage: python scripts/test_docker.py
"""

import httpx
import sys
import time
import os
from datetime import datetime

# Force UTF-8 output on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

# Couleurs pour le terminal (désactivées sur Windows sans support)
if os.name == 'nt' and not os.environ.get('WT_SESSION'):
    GREEN = ""
    RED = ""
    YELLOW = ""
    RESET = ""
    BOLD = ""
else:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    RESET = "\033[0m"
    BOLD = "\033[1m"


def print_result(test_name: str, success: bool, details: str = ""):
    """Affiche le résultat d'un test."""
    icon = f"{GREEN}✓{RESET}" if success else f"{RED}✗{RESET}"
    print(f"  {icon} {test_name}")
    if details and not success:
        print(f"      {YELLOW}{details}{RESET}")


def test_health_check() -> bool:
    """Test du health check backend."""
    try:
        response = httpx.get(f"{BASE_URL}/health", timeout=10)
        success = response.status_code == 200
        data = response.json()
        print_result(
            "Health Check",
            success,
            f"Status: {response.status_code}, Version: {data.get('version', 'N/A')}"
        )
        return success
    except Exception as e:
        print_result("Health Check", False, str(e))
        return False


def test_api_health() -> bool:
    """Test du health check API v1."""
    try:
        response = httpx.get(f"{BASE_URL}/api/v1/health", timeout=10)
        success = response.status_code == 200
        print_result("API Health (/api/v1/health)", success)
        return success
    except Exception as e:
        print_result("API Health", False, str(e))
        return False


def test_cors_headers() -> bool:
    """Test des headers CORS."""
    try:
        response = httpx.options(
            f"{BASE_URL}/api/v1/auth/login",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST"
            },
            timeout=10
        )
        cors_origin = response.headers.get("access-control-allow-origin", "")
        success = "localhost:5173" in cors_origin or cors_origin == "*"
        print_result("CORS Headers", success, f"Allow-Origin: {cors_origin}")
        return success
    except Exception as e:
        print_result("CORS Headers", False, str(e))
        return False


def test_rate_limiting() -> bool:
    """Test du rate limiting (ne devrait pas bloquer en dev)."""
    try:
        # Faire plusieurs requêtes rapides
        for i in range(3):
            response = httpx.post(
                f"{BASE_URL}/api/v1/auth/login",
                json={"username": "test@test.com", "password": "wrong"},
                timeout=10
            )

        # Vérifier les headers de rate limit
        rate_limit_header = response.headers.get("x-ratelimit-limit", "")
        success = rate_limit_header != "" or response.status_code in [401, 422, 429]
        print_result(
            "Rate Limiting Headers",
            success,
            f"X-RateLimit-Limit: {rate_limit_header or 'Not found'}"
        )
        return success
    except Exception as e:
        print_result("Rate Limiting", False, str(e))
        return False


def test_security_headers() -> bool:
    """Test des headers de sécurité."""
    try:
        response = httpx.get(f"{BASE_URL}/health", timeout=10)
        headers = response.headers

        checks = {
            "X-Frame-Options": headers.get("x-frame-options") == "DENY",
            "X-Content-Type-Options": headers.get("x-content-type-options") == "nosniff",
            "X-XSS-Protection": "1" in headers.get("x-xss-protection", ""),
        }

        all_passed = all(checks.values())
        missing = [k for k, v in checks.items() if not v]

        print_result(
            "Security Headers",
            all_passed,
            f"Missing: {', '.join(missing)}" if missing else ""
        )
        return all_passed
    except Exception as e:
        print_result("Security Headers", False, str(e))
        return False


def test_register_endpoint() -> tuple[bool, str | None]:
    """Test de l'endpoint register (créer un utilisateur de test) et login pour obtenir token."""
    try:
        timestamp = int(time.time())
        test_email = f"test_{timestamp}@example.com"
        test_password = "TestPassword123!"

        # 1. Register
        response = httpx.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={
                "email": test_email,
                "password": test_password,
                "name": "Test User"
            },
            timeout=15
        )

        success = response.status_code == 201
        token = None

        if success:
            # 2. Login pour obtenir le token
            login_response = httpx.post(
                f"{BASE_URL}/api/v1/auth/login",
                data={
                    "username": test_email,
                    "password": test_password
                },
                timeout=10
            )
            if login_response.status_code == 200:
                login_data = login_response.json()
                token = login_data.get("access_token")

        print_result(
            "Register Endpoint",
            success,
            f"Status: {response.status_code}" + (f", Token: {token[:20]}..." if token else "")
        )
        return success, token
    except Exception as e:
        print_result("Register Endpoint", False, str(e))
        return False, None


def test_login_endpoint() -> bool:
    """Test de l'endpoint login avec mauvais credentials."""
    try:
        response = httpx.post(
            f"{BASE_URL}/api/v1/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "wrongpassword"
            },
            timeout=10
        )

        # On attend un 401 pour des credentials incorrects
        success = response.status_code == 401
        print_result(
            "Login Endpoint (bad creds → 401)",
            success,
            f"Status: {response.status_code}"
        )
        return success
    except Exception as e:
        print_result("Login Endpoint", False, str(e))
        return False


def test_protected_endpoint(token: str | None) -> bool:
    """Test d'un endpoint protégé avec token."""
    if not token:
        print_result("Protected Endpoint", False, "No token available")
        return False

    try:
        response = httpx.get(
            f"{BASE_URL}/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )

        success = response.status_code == 200
        print_result(
            "Protected Endpoint (/users/me)",
            success,
            f"Status: {response.status_code}"
        )
        return success
    except Exception as e:
        print_result("Protected Endpoint", False, str(e))
        return False


def test_subscription_status(token: str | None) -> bool:
    """Test du status subscription (trial)."""
    if not token:
        print_result("Subscription Status", False, "No token available")
        return False

    try:
        response = httpx.get(
            f"{BASE_URL}/api/v1/subscriptions/status",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )

        success = response.status_code == 200
        if success:
            data = response.json()
            is_trial = data.get("is_trial", False)
            tier = data.get("tier", "unknown")
            print_result(
                f"Subscription Status (tier={tier}, trial={is_trial})",
                True
            )
        else:
            print_result("Subscription Status", False, f"Status: {response.status_code}")

        return success
    except Exception as e:
        print_result("Subscription Status", False, str(e))
        return False


def test_frontend() -> bool:
    """Test que le frontend répond."""
    try:
        response = httpx.get(FRONTEND_URL, timeout=10)
        success = response.status_code == 200
        print_result(
            "Frontend (localhost:5173)",
            success,
            f"Status: {response.status_code}"
        )
        return success
    except Exception as e:
        print_result("Frontend", False, str(e))
        return False


def main():
    """Exécute tous les tests."""
    print(f"\n{BOLD}═══════════════════════════════════════════════════════════{RESET}")
    print(f"{BOLD}       NutriProfile - Tests de Déploiement Docker{RESET}")
    print(f"{BOLD}═══════════════════════════════════════════════════════════{RESET}")
    print(f"  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Backend: {BASE_URL}")
    print(f"  Frontend: {FRONTEND_URL}")
    print(f"{BOLD}───────────────────────────────────────────────────────────{RESET}\n")

    results = []
    token = None

    # Tests Backend
    print(f"{BOLD}[Backend Tests]{RESET}")
    results.append(("Health Check", test_health_check()))
    results.append(("API Health", test_api_health()))
    results.append(("CORS Headers", test_cors_headers()))
    results.append(("Security Headers", test_security_headers()))
    results.append(("Rate Limiting", test_rate_limiting()))

    # Tests Auth
    print(f"\n{BOLD}[Auth Tests]{RESET}")
    reg_success, token = test_register_endpoint()
    results.append(("Register", reg_success))
    results.append(("Login (bad creds)", test_login_endpoint()))
    results.append(("Protected Endpoint", test_protected_endpoint(token)))

    # Tests Subscription/Trial
    print(f"\n{BOLD}[Subscription Tests]{RESET}")
    results.append(("Subscription Status", test_subscription_status(token)))

    # Tests Frontend
    print(f"\n{BOLD}[Frontend Tests]{RESET}")
    results.append(("Frontend", test_frontend()))

    # Résumé
    print(f"\n{BOLD}═══════════════════════════════════════════════════════════{RESET}")
    passed = sum(1 for _, r in results if r)
    total = len(results)

    if passed == total:
        print(f"{GREEN}{BOLD}  ✓ TOUS LES TESTS PASSÉS ({passed}/{total}){RESET}")
    else:
        print(f"{YELLOW}{BOLD}  ⚠ TESTS: {passed}/{total} passés{RESET}")
        failed = [name for name, r in results if not r]
        print(f"  {RED}Échecs: {', '.join(failed)}{RESET}")

    print(f"{BOLD}═══════════════════════════════════════════════════════════{RESET}\n")

    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
