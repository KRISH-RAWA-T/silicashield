from pydantic import BaseModel
from typing import List


class ZoneRisk(BaseModel):
    zone_id: str
    zone_name: str
    risk_score: float
    risk_level: str
    equipment_score: float
    ventilation_score: float
    exposure_score: float
    ppe_score: float
    environment_score: float


class WorkerExposure(BaseModel):
    worker_id: str
    worker_name: str
    zone_id: str
    time_in_zone_minutes: int
    exposure_score: float


class Alert(BaseModel):
    alert_id: str
    zone_id: str
    severity: str
    message: str
    type: str


class ZonesResponse(BaseModel):
    zones: List[ZoneRisk]


class AlertsResponse(BaseModel):
    alerts: List[Alert]


class WorkersResponse(BaseModel):
    workers: List[WorkerExposure]