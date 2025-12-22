"""Test complet de toutes les API NutriProfile."""
import asyncio
import httpx
from datetime import datetime

BASE_URL = 'http://localhost:8000/api/v1'

# Résultats des tests
results = {}

async def test_all_apis():
    async with httpx.AsyncClient(timeout=120.0) as client:

        # ============== 1. AUTH API ==============
        print('=' * 60)
        print('1. TESTING AUTH API')
        print('=' * 60)

        # 1.1 Register
        email = f'fulltest_{datetime.now().strftime("%H%M%S")}@test.com'
        register_resp = await client.post(
            f'{BASE_URL}/auth/register',
            json={'email': email, 'password': 'Test123!', 'name': 'Full Test User'}
        )
        results['auth_register'] = register_resp.status_code == 201
        print(f'  Register: {register_resp.status_code} - {"OK" if results["auth_register"] else "FAIL"}')

        # 1.2 Login
        login_resp = await client.post(
            f'{BASE_URL}/auth/login',
            data={'username': email, 'password': 'Test123!'}
        )
        results['auth_login'] = login_resp.status_code == 200
        print(f'  Login: {login_resp.status_code} - {"OK" if results["auth_login"] else "FAIL"}')

        if not results['auth_login']:
            print('  FATAL: Cannot continue without login')
            return results

        token = login_resp.json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}

        # 1.3 Get current user
        me_resp = await client.get(f'{BASE_URL}/users/me', headers=headers)
        results['auth_me'] = me_resp.status_code == 200
        print(f'  Get Me: {me_resp.status_code} - {"OK" if results["auth_me"] else "FAIL"}')

        # ============== 2. PROFILE API ==============
        print()
        print('=' * 60)
        print('2. TESTING PROFILE API')
        print('=' * 60)

        # 2.1 Create profile
        profile_data = {
            'age': 30,
            'gender': 'male',
            'height_cm': 175,
            'weight_kg': 75,
            'activity_level': 'moderate',
            'goal': 'maintain',
            'diet_type': 'omnivore',
            'allergies': ['gluten'],
            'excluded_foods': ['shellfish']
        }
        profile_resp = await client.post(
            f'{BASE_URL}/profiles/',
            headers=headers,
            json=profile_data
        )
        results['profile_create'] = profile_resp.status_code in [200, 201]
        print(f'  Create Profile: {profile_resp.status_code} - {"OK" if results["profile_create"] else "FAIL"}')
        if profile_resp.status_code >= 400:
            print(f'    Error: {profile_resp.text[:200]}')

        # 2.2 Get profile
        get_profile_resp = await client.get(f'{BASE_URL}/profiles/me', headers=headers)
        results['profile_get'] = get_profile_resp.status_code == 200
        print(f'  Get Profile: {get_profile_resp.status_code} - {"OK" if results["profile_get"] else "FAIL"}')

        # 2.3 Update profile
        update_data = {'weight_kg': 74}
        update_resp = await client.put(
            f'{BASE_URL}/profiles/me',
            headers=headers,
            json=update_data
        )
        results['profile_update'] = update_resp.status_code == 200
        print(f'  Update Profile: {update_resp.status_code} - {"OK" if results["profile_update"] else "FAIL"}')

        # ============== 3. VISION API ==============
        print()
        print('=' * 60)
        print('3. TESTING VISION API')
        print('=' * 60)

        # Image test (1x1 pixel PNG)
        test_image_base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

        # 3.1 Analyze image
        vision_data = {
            'image_base64': test_image_base64,
            'meal_type': 'lunch'
        }
        print('  Analyzing image (this may take a moment)...')
        vision_resp = await client.post(
            f'{BASE_URL}/vision/analyze',
            headers=headers,
            json=vision_data,
            timeout=120.0
        )
        results['vision_analyze'] = vision_resp.status_code == 200
        print(f'  Analyze Image: {vision_resp.status_code} - {"OK" if results["vision_analyze"] else "FAIL"}')
        if vision_resp.status_code >= 400:
            print(f'    Error: {vision_resp.text[:300]}')

        # 3.2 Get food logs
        logs_resp = await client.get(f'{BASE_URL}/vision/logs', headers=headers)
        results['vision_logs'] = logs_resp.status_code == 200
        print(f'  Get Food Logs: {logs_resp.status_code} - {"OK" if results["vision_logs"] else "FAIL"}')

        # ============== 4. RECIPE API ==============
        print()
        print('=' * 60)
        print('4. TESTING RECIPE API')
        print('=' * 60)

        # 4.1 Generate recipe
        recipe_data = {
            'ingredients': ['chicken', 'rice', 'tomatoes'],
            'meal_type': 'dinner',
            'max_prep_time': 30,
            'servings': 2
        }
        print('  Generating recipe (this may take a moment)...')
        recipe_resp = await client.post(
            f'{BASE_URL}/recipes/generate',
            headers=headers,
            json=recipe_data,
            timeout=120.0
        )
        results['recipe_generate'] = recipe_resp.status_code == 200
        print(f'  Generate Recipe: {recipe_resp.status_code} - {"OK" if results["recipe_generate"] else "FAIL"}')

        recipe_id = None
        if recipe_resp.status_code >= 400:
            print(f'    Error: {recipe_resp.text[:300]}')
        else:
            data = recipe_resp.json()
            print(f'    Title: {data["recipe"]["title"]}')
            print(f'    Model: {data["model_used"]}')
            recipe_id = data['recipe']['id']

        # 4.2 Get history
        history_resp = await client.get(f'{BASE_URL}/recipes/history', headers=headers)
        results['recipe_history'] = history_resp.status_code == 200
        print(f'  Get History: {history_resp.status_code} - {"OK" if results["recipe_history"] else "FAIL"}')

        # 4.3 Add to favorites
        if recipe_id:
            fav_resp = await client.post(
                f'{BASE_URL}/recipes/favorites',
                headers=headers,
                json={'recipe_id': recipe_id, 'notes': 'Test favorite', 'rating': 5}
            )
            results['recipe_favorite_add'] = fav_resp.status_code == 201
            print(f'  Add Favorite: {fav_resp.status_code} - {"OK" if results["recipe_favorite_add"] else "FAIL"}')

        # 4.4 Get favorites
        favs_resp = await client.get(f'{BASE_URL}/recipes/favorites/', headers=headers)
        results['recipe_favorites_get'] = favs_resp.status_code == 200
        print(f'  Get Favorites: {favs_resp.status_code} - {"OK" if results["recipe_favorites_get"] else "FAIL"}')

        # ============== 5. DASHBOARD API ==============
        print()
        print('=' * 60)
        print('5. TESTING DASHBOARD API')
        print('=' * 60)

        # 5.1 Get dashboard
        dash_resp = await client.get(f'{BASE_URL}/dashboard/', headers=headers)
        results['dashboard_get'] = dash_resp.status_code == 200
        print(f'  Get Dashboard: {dash_resp.status_code} - {"OK" if results["dashboard_get"] else "FAIL"}')
        if dash_resp.status_code >= 400:
            print(f'    Error: {dash_resp.text[:300]}')

        # 5.2 Get achievements
        achiev_resp = await client.get(f'{BASE_URL}/dashboard/achievements', headers=headers)
        results['dashboard_achievements'] = achiev_resp.status_code == 200
        print(f'  Get Achievements: {achiev_resp.status_code} - {"OK" if results["dashboard_achievements"] else "FAIL"}')

        # 5.3 Get streaks
        streaks_resp = await client.get(f'{BASE_URL}/dashboard/streaks', headers=headers)
        results['dashboard_streaks'] = streaks_resp.status_code == 200
        print(f'  Get Streaks: {streaks_resp.status_code} - {"OK" if results["dashboard_streaks"] else "FAIL"}')

        # ============== 6. COACHING API ==============
        print()
        print('=' * 60)
        print('6. TESTING COACHING API')
        print('=' * 60)

        # 6.1 Get tips
        tips_resp = await client.get(f'{BASE_URL}/coaching/tips', headers=headers)
        results['coaching_tips'] = tips_resp.status_code == 200
        print(f'  Get Tips: {tips_resp.status_code} - {"OK" if results["coaching_tips"] else "FAIL"}')

        # 6.2 Get weekly summary
        summary_resp = await client.get(f'{BASE_URL}/coaching/weekly-summary', headers=headers)
        results['coaching_summary'] = summary_resp.status_code == 200
        print(f'  Weekly Summary: {summary_resp.status_code} - {"OK" if results["coaching_summary"] else "FAIL"}')

        # 6.3 Get challenges
        challenges_resp = await client.get(f'{BASE_URL}/coaching/challenges', headers=headers)
        results['coaching_challenges'] = challenges_resp.status_code == 200
        print(f'  Get Challenges: {challenges_resp.status_code} - {"OK" if results["coaching_challenges"] else "FAIL"}')

        return results

if __name__ == '__main__':
    # Run tests
    results = asyncio.run(test_all_apis())

    # Summary
    print()
    print('=' * 60)
    print('SUMMARY')
    print('=' * 60)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f'Passed: {passed}/{total}')
    print()
    failed = [k for k, v in results.items() if not v]
    if failed:
        print('FAILED TESTS:')
        for f in failed:
            print(f'  - {f}')
    else:
        print('ALL TESTS PASSED!')
