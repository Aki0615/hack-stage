from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import plans

app = FastAPI()

#フロント(localhost:3000)から呼べるようにする
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://lpcalhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],

)

app.include_router(plans.router)