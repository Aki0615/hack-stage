from fastapi import APIRouter, UploadFile, File
from app.mock import load_mock

router = APIRouter()


@router.post("/Plans")
def create_plan():
    return load_mock("plan")


@router.post("/plans/{plan_id}/csv")
def import_csv(plan_id: str, file: UploadFile = File(...)):
    return load_mock("import")

@router.post("/plans/{plan_id}/stops/generate")
def generate_stops(plan_id:str):
    return load_mock("stops")

@router.post("/plans/{plan_id}/routes/generate")
def generate_routes(plan_id: str):
    return load_mock("routes")

@router.post("/plans/{plan_id}/notice")
def generate_notice(plan_id:str):
    return load_mock("notice")