from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import plans, stops, routes, notice

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plans.router)
app.include_router(stops.router)
app.include_router(routes.router)
app.include_router(notice.router)
