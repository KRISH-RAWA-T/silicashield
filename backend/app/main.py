from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import ZonesResponse, AlertsResponse, WorkersResponse
from .risk_logic import get_zone_risks, get_alerts, get_workers


app = FastAPI(
    title="SilicaShield API",
    description="Mine dust exposure risk scoring backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SilicaShield API"}


@app.get("/zones", response_model=ZonesResponse)
def read_zones():
    zones = get_zone_risks()
    return ZonesResponse(zones=zones)


@app.get("/alerts", response_model=AlertsResponse)
def read_alerts():
    alerts = get_alerts()
    return AlertsResponse(alerts=alerts)


@app.get("/workers", response_model=WorkersResponse)
def read_workers():
    workers = get_workers()
    return WorkersResponse(workers=workers)