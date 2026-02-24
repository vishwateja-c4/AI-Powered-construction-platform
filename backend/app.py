from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from api.routes import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Rules
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

import asyncio
import random
import socketio

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

has_bg_task = False

async def background_task():
    while True:
        await asyncio.sleep(random.randint(15, 30))
        messages = [
            {"type": "info", "title": "System Update", "message": "Weather forecast updated for next week. No delays expected."},
            {"type": "warning", "title": "Material Alert", "message": "Lumber prices have increased by 2% in your region."},
            {"type": "success", "title": "Permit Approved", "message": "City inspector approved the Foundation phase!"},
            {"type": "info", "title": "Team Activity", "message": "Sarah assigned 'Electrical Rough-in' to Subcontractor Team C."},
        ]
        await sio.emit('notification', random.choice(messages))

@sio.event
async def connect(sid, environ):
    global has_bg_task
    print("Socket.io Client connected:", sid)
    if not has_bg_task:
        sio.start_background_task(background_task)
        has_bg_task = True

@sio.event
async def disconnect(sid):
    print("Socket.io Client disconnected:", sid)

app = socketio.ASGIApp(sio, other_asgi_app=app)
