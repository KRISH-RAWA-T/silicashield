# SilicaShield

SilicaShield is an AI-powered mine worker dust exposure prevention system built for Nexora'26, a Rajasthan state-level AI hackathon.

## Problem

Silicosis is a fatal lung disease caused by inhaling crystalline silica dust. In many mining areas of Rajasthan, existing systems detect the disease only after many years of lung damage. SilicaShield focuses on prevention by identifying unsafe exposure risk early.

## Solution

SilicaShield helps mine supervisors monitor dust exposure risk across different mine zones.  
It combines 5 risk signals into a single composite risk score from 0 to 100 and sends early alerts before workers cross unsafe exposure limits.

## Risk Signals

1. Equipment activity — 30%
2. Ventilation status — 25%
3. Worker time-in-zone — 25%
4. PPE compliance — 15%
5. Environmental conditions — 5%

## Features

- Zone-wise dust exposure risk scoring
- Worker exposure tracking
- PPE violation alerts
- Worker rotation warnings
- Mobile app dashboard for supervisors
- Dark industrial UI for field use

## Tech Stack

### Backend
- Python
- FastAPI
- JSON / CSV mock data

### AI / Computer Vision
- YOLOv8
- Pre-recorded PPE detection videos

### Frontend
- React Native
- Expo

### External API
- Open-Meteo Weather API

## Project Structure

```text
silicashield/
├── backend/
└── mobile-app/
```

## How to Run

### Backend

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Mobile App

```bash
cd mobile-app
npm install
npm start
```

## Hackathon Goal

Build a practical prototype that can help reduce long-term silicosis risk by giving supervisors early warnings and simple decision support.

## Author

Krish
Swwastik
Anant
Divay