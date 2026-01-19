from pydantic import BaseModel, Field


class BarcodeProduct(BaseModel):
    """Produit trouvé via code-barres OpenFoodFacts."""
    barcode: str
    name: str
    brand: str | None = None
    image_url: str | None = None
    calories: int | None = None  # per 100g
    protein: float | None = None  # per 100g
    carbs: float | None = None  # per 100g
    fat: float | None = None  # per 100g
    fiber: float | None = None  # per 100g
    quantity: str | None = None  # "400g", "1L", etc.
    source: str = "openfoodfacts"


class BarcodeSearchResponse(BaseModel):
    """Réponse de recherche par code-barres."""
    success: bool
    product: BarcodeProduct | None = None
    error: str | None = None
