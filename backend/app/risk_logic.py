import json
from pathlib import Path
from typing import List

import pandas as pd
import requests

from .models import ZoneRisk, WorkerExposure, Alert

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "mock_data"


def load_zones_df() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "zones.csv")


def load_workers_df() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "workers.csv")


def load_equipment_events() -> list:
    with (DATA_DIR / "equipment_events.json").open("r", encoding="utf-8") as f:
        return json.load(f)


def load_ppe_summary() -> list:
    with (DATA_DIR / "ppe_summary.json").open("r", encoding="utf-8") as f:
        return json.load(f)


def get_weather_factor() -> float:
    url = (
        "https://api.open-meteo.com/v1/forecast"
        "?latitude=26.9&longitude=75.8"
        "&hourly=temperature_2m,relativehumidity_2m"
    )
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        temp = data["hourly"]["temperature_2m"][0]
        humidity = data["hourly"]["relativehumidity_2m"][0]
        if temp > 40 and humidity < 30:
            return 1.0
        return 0.3
    except Exception:
        return 0.5


def score_equipment(drills_on: int, saws_on: int) -> float:
    score = 0.0
    if drills_on == 1:
        score += 60.0
    if saws_on == 1:
        score += 40.0
    return min(score, 100.0)


def score_ventilation(fan_on: int, airflow_level: float) -> float:
    score = 100.0
    if fan_on == 1:
        score -= 40.0
    score -= airflow_level * 40.0
    return max(0.0, min(score, 100.0))


def score_exposure(time_in_minutes: int) -> float:
    if time_in_minutes <= 0:
        return 0.0
    if time_in_minutes <= 60:
        return (time_in_minutes / 60.0) * 60.0
    if time_in_minutes <= 180:
        return 60.0 + ((time_in_minutes - 60) / 120.0) * 40.0
    return 100.0


def score_ppe(ppe_compliance: float) -> float:
    return max(0.0, min((1.0 - ppe_compliance) * 100.0, 100.0))


def score_environment(env_factor: float) -> float:
    return max(0.0, min(env_factor * 100.0, 100.0))


def combine_scores(
    equipment_score: float,
    ventilation_score: float,
    exposure_score: float,
    ppe_score: float,
    environment_score: float,
) -> float:
    total = (
        equipment_score * 0.30
        + ventilation_score * 0.25
        + exposure_score * 0.25
        + ppe_score * 0.15
        + environment_score * 0.05
    )
    return round(total, 1)


def classify_risk_level(score: float) -> str:
    if score >= 70.0:
        return "HIGH"
    if score >= 40.0:
        return "MEDIUM"
    return "LOW"


def get_zone_risks() -> List[ZoneRisk]:
    zones_df = load_zones_df()
    workers_df = load_workers_df()
    equipment_data = load_equipment_events()
    ppe_data = load_ppe_summary()

    equipment_by_zone = {item["zone_id"]: item for item in equipment_data}
    ppe_by_zone = {item["zone_id"]: item for item in ppe_data}

    env_factor = get_weather_factor()
    env_score = score_environment(env_factor)

    zone_risks: List[ZoneRisk] = []

    for _, row in zones_df.iterrows():
        zone_id = row["zone_id"]
        zone_name = row["zone_name"]
        fan_on = int(row["fan_on"])
        airflow = float(row["airflow_level"])

        eq_info = equipment_by_zone.get(zone_id, {"drills_on": 0, "saws_on": 0})
        drills_on = int(eq_info.get("drills_on", 0))
        saws_on = int(eq_info.get("saws_on", 0))

        ppe_info = ppe_by_zone.get(zone_id, {"ppe_compliance": 0.5})
        ppe_compliance = float(ppe_info.get("ppe_compliance", 0.5))

        zone_workers = workers_df[workers_df["zone_id"] == zone_id]
        avg_time = float(zone_workers["time_in_zone_minutes"].mean()) if not zone_workers.empty else 0.0

        equipment_score = score_equipment(drills_on, saws_on)
        ventilation_score = score_ventilation(fan_on, airflow)
        exposure_score = score_exposure(int(avg_time))
        ppe_score = score_ppe(ppe_compliance)

        final_score = combine_scores(
            equipment_score,
            ventilation_score,
            exposure_score,
            ppe_score,
            env_score,
        )

        zone_risks.append(
            ZoneRisk(
                zone_id=zone_id,
                zone_name=zone_name,
                risk_score=final_score,
                risk_level=classify_risk_level(final_score),
                equipment_score=equipment_score,
                ventilation_score=ventilation_score,
                exposure_score=exposure_score,
                ppe_score=ppe_score,
                environment_score=env_score,
            )
        )

    return zone_risks


def get_alerts() -> List[Alert]:
    zone_risks = get_zone_risks()
    alerts: List[Alert] = []
    counter = 1

    for zr in zone_risks:
        if zr.risk_score >= 80.0:
            alerts.append(
                Alert(
                    alert_id=f"A{counter}",
                    zone_id=zr.zone_id,
                    severity="CRITICAL",
                    message=f"{zr.zone_name} has extremely high dust exposure risk. Immediate action required.",
                    type="COMPOSITE",
                )
            )
            counter += 1

        if zr.ppe_score >= 60.0:
            alerts.append(
                Alert(
                    alert_id=f"A{counter}",
                    zone_id=zr.zone_id,
                    severity="WARNING",
                    message=f"PPE compliance is critically low in {zr.zone_name}. Workers exposed without protection.",
                    type="PPE",
                )
            )
            counter += 1

        if zr.ventilation_score >= 75.0:
            alerts.append(
                Alert(
                    alert_id=f"A{counter}",
                    zone_id=zr.zone_id,
                    severity="WARNING",
                    message=f"Poor ventilation detected in {zr.zone_name}. Dust is not dispersing safely.",
                    type="VENTILATION",
                )
            )
            counter += 1

    return alerts


def get_workers() -> List[WorkerExposure]:
    """
    Load all workers from CSV and compute exposure score for each.
    """
    workers_df = load_workers_df()
    result: List[WorkerExposure] = []

    for _, row in workers_df.iterrows():
        time_mins = int(row["time_in_zone_minutes"])
        exposure = score_exposure(time_mins)
        result.append(
            WorkerExposure(
                worker_id=str(row["worker_id"]),
                worker_name=str(row["worker_name"]),
                zone_id=str(row["zone_id"]),
                time_in_zone_minutes=time_mins,
                exposure_score=round(exposure, 1),
            )
        )

    return result