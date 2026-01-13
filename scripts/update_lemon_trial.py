"""Script to update Lemon Squeezy variants trial period from 14 to 7 days."""
import requests

API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiI2NGJjNmY4YzA2ZjhkMmUyZjFjOGIzZmNkNzdmYTM0MDA2YjRjZWJlNjJmOTRkZjE4N2EwNjdmMjhkNmNiZTgyZGE3YjI1MTA4MDM2OTkxNiIsImlhdCI6MTc2NzY0NjAwNi45MjU5MTEsIm5iZiI6MTc2NzY0NjAwNi45MjU5MTQsImV4cCI6MTc4MzIwOTYwMC4wMzQzNTYsInN1YiI6IjYyNDk3MTciLCJzY29wZXMiOltdfQ.RhGIePMh6ltin9z_dT_a9qOQCtBNVdu1fYpRTkh9azUWDAXRKFWd2MLCMxk7P6SVh5KARHR-j2-xbUPFiPtafm_oFS5DFAwS6mLfeCnt6KngPc39b5bF7cFySc8YQX4FvPDi9rBVolLm76gwFSHSH1rGg9TGBzLdsXif7aLnR9rwTauIfWI3E4kxraiH-_VGCOt41dlMTTA-LXL6Gxbktx_Rzcw75rLbjBeij4KcKD_PixpVYlewVi_ODq4hAt2A7gIh3DSLJ0be0tMO388WEe95VNtNUw-XN0VpcD9D6erPv1x6loascgcvONEVuQW-viV1lXyPsZKmgmByq5mgOgJF2U973o3ijOyy6r9PNyVdTjPwW9a6201YY8zGNFTcQNUDMC6oDI-peoBRqizGPsV1ziCv4TCpZnmfnlnNP41dDrTQy5VUwlXWSN-KtAleMXQZIRiC8hv0uUzldt0coB4Z5hDLHT8RyApFTj-Eo8Wu63dXUyAke8qwRHYCldb6HI0Bbtup7EWeHONhD7XooBEqkMONdT31eLjeef0jRJehoy6iyyFaMPGVV_J8bvXd0oeSEAvgfVXPgWAv8WeQ4Pegcg7dl5zWBS1SmcJcnuFOrUhsdwTZZO6eTaIaO7NqWEMNJI9rrFPitlRhspqVBUpIlfum0Qnl00luzYrt8dw"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json"
}

def get_variants():
    """Get all variants."""
    response = requests.get(
        "https://api.lemonsqueezy.com/v1/variants",
        headers=HEADERS
    )
    print(f"GET variants status: {response.status_code}")
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.text}")
        return None

def update_variant_trial(variant_id: str, trial_days: int = 7):
    """Update a variant's trial period."""
    payload = {
        "data": {
            "type": "variants",
            "id": str(variant_id),
            "attributes": {
                "trial_interval_count": trial_days,
                "trial_interval": "day"
            }
        }
    }

    response = requests.patch(
        f"https://api.lemonsqueezy.com/v1/variants/{variant_id}",
        headers=HEADERS,
        json=payload
    )
    print(f"PATCH variant {variant_id} status: {response.status_code}")
    if response.status_code != 200:
        print(f"Error: {response.text}")
    return response.status_code == 200

if __name__ == "__main__":
    print("=== Fetching Lemon Squeezy variants ===\n")

    data = get_variants()
    if data:
        variants = data.get("data", [])
        print(f"Found {len(variants)} variants:\n")

        for v in variants:
            vid = v["id"]
            attrs = v["attributes"]
            name = attrs.get("name", "Unknown")
            trial_count = attrs.get("trial_interval_count", 0)
            trial_interval = attrs.get("trial_interval", "day")
            price = attrs.get("price", 0) / 100  # Convert cents to dollars

            print(f"  ID: {vid}")
            print(f"  Name: {name}")
            print(f"  Price: {price}")
            print(f"  Trial: {trial_count} {trial_interval}(s)")
            print()

            # Update trial to 7 days if not already 7
            if trial_count != 7:
                print(f"  -> Updating trial from {trial_count} to 7 days...")
                if update_variant_trial(vid, 7):
                    print(f"  -> SUCCESS: Trial updated to 7 days!")
                else:
                    print(f"  -> FAILED to update trial")
                print()
    else:
        print("Failed to fetch variants")
