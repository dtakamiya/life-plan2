from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import LifePlan, SimulationResult
from .calculations import simulate_life_plan, calculate_inheritance_tax

app = FastAPI(title="FP一級ライフプランニングAPI", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/api/life-plan/simulate", response_model=SimulationResult)
async def simulate(life_plan: LifePlan):
    """
    ライフプランをシミュレーション
    """
    try:
        result = simulate_life_plan(life_plan)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from pydantic import BaseModel

class InheritanceTaxRequest(BaseModel):
    assets: int
    heirs: int = 1

@app.post("/api/tax/inheritance")
async def calculate_inheritance_tax_endpoint(request: InheritanceTaxRequest):
    """
    相続税を計算
    """
    try:
        tax = calculate_inheritance_tax(request.assets, request.heirs)
        return {"assets": request.assets, "heirs": request.heirs, "tax": tax}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
