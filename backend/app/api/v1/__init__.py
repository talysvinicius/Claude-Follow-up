from fastapi import APIRouter
from app.api.v1 import auth, leads, cadences, lessons, stripe_routes, pipedrive_routes

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(leads.router)
api_router.include_router(cadences.router)
api_router.include_router(lessons.router)
api_router.include_router(stripe_routes.router)
api_router.include_router(pipedrive_routes.router)
