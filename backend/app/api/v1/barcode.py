import httpx
from fastapi import APIRouter, HTTPException, status
from app.schemas.barcode import BarcodeSearchResponse, BarcodeProduct

router = APIRouter()

OPENFOODFACTS_API = "https://world.openfoodfacts.org/api/v0/product/{barcode}.json"


@router.get("/{barcode}", response_model=BarcodeSearchResponse)
async def search_by_barcode(barcode: str):
    """
    Recherche un produit par code-barres via OpenFoodFacts API.

    - **barcode**: Code-barres du produit (8-13 chiffres)

    Retourne les informations nutritionnelles du produit si trouvé.
    """
    # Valider le code-barres (8-13 chiffres)
    if not barcode.isdigit() or len(barcode) < 8 or len(barcode) > 13:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid barcode format. Must be 8-13 digits."
        )

    # Appeler OpenFoodFacts API
    url = OPENFOODFACTS_API.format(barcode=barcode)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
    except httpx.TimeoutException:
        return BarcodeSearchResponse(
            success=False,
            error="Request timeout. Please try again."
        )
    except httpx.HTTPError as e:
        return BarcodeSearchResponse(
            success=False,
            error=f"Error fetching product: {str(e)}"
        )

    # Vérifier si le produit existe
    if data.get("status") != 1 or "product" not in data:
        return BarcodeSearchResponse(
            success=False,
            error="Product not found in OpenFoodFacts database."
        )

    product_data = data["product"]

    # Extraire les données nutritionnelles (par 100g)
    nutriments = product_data.get("nutriments", {})

    # OpenFoodFacts utilise différentes clés selon la présence des données
    # Essayer plusieurs variantes pour chaque nutriment
    calories = (
        nutriments.get("energy-kcal_100g") or
        nutriments.get("energy-kcal") or
        (nutriments.get("energy_100g", 0) / 4.184) or  # Convert kJ to kcal if needed
        None
    )

    protein = (
        nutriments.get("proteins_100g") or
        nutriments.get("proteins") or
        None
    )

    carbs = (
        nutriments.get("carbohydrates_100g") or
        nutriments.get("carbohydrates") or
        None
    )

    fat = (
        nutriments.get("fat_100g") or
        nutriments.get("fat") or
        None
    )

    fiber = (
        nutriments.get("fiber_100g") or
        nutriments.get("fiber") or
        None
    )

    # Construire le produit
    product = BarcodeProduct(
        barcode=barcode,
        name=product_data.get("product_name") or product_data.get("product_name_en") or "Unknown Product",
        brand=product_data.get("brands") or None,
        image_url=product_data.get("image_url") or product_data.get("image_front_url") or None,
        calories=int(calories) if calories else None,
        protein=float(protein) if protein else None,
        carbs=float(carbs) if carbs else None,
        fat=float(fat) if fat else None,
        fiber=float(fiber) if fiber else None,
        quantity=product_data.get("quantity") or None,
        source="openfoodfacts",
    )

    return BarcodeSearchResponse(
        success=True,
        product=product
    )
