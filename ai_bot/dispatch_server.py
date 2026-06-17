"""
dispatch_server.py — Python Worker HTTP API

FastAPI server that accepts room-dispatch requests from NestJS.
Each dispatch spawns bot.py as a subprocess, passing the room token
via environment variables (not CLI args, which livekit-agents doesn't support).

Endpoints:
  POST /api/dispatch  { room_name, token }  → spawn bot subprocess
  POST /api/recall    { room_name }         → terminate bot subprocess
  GET  /health                              → status + active rooms

Run alongside the bot:
  uvicorn dispatch_server:app --host 0.0.0.0 --port 8080
"""
import os
import subprocess
import sys
from typing import Dict

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="NeuroMeet AI Worker Dispatch API", version="1.0")

# roomId → subprocess.Popen handle
active_bots: Dict[str, subprocess.Popen] = {}


class DispatchRequest(BaseModel):
    room_name: str
    token: str


class RecallRequest(BaseModel):
    room_name: str


@app.post("/api/dispatch")
def dispatch(req: DispatchRequest):
    if req.room_name in active_bots:
        proc = active_bots[req.room_name]
        if proc.poll() is None:
            return {"status": "already_running", "room": req.room_name}
        # Process died — clean up and respawn
        del active_bots[req.room_name]

    # Pass token & room via environment variables — livekit-agents reads these
    bot_env = {
        **os.environ,
        "LIVEKIT_TOKEN": req.token,
        "LIVEKIT_ROOM": req.room_name,
        # Ensure the model path is forwarded
        "MODEL_PATH": os.environ.get("MODEL_PATH", "/models/best_model.pth"),
    }

    proc = subprocess.Popen(
        [
            sys.executable,
            "-u",
            "bot.py",
        ],
        env=bot_env,
        cwd=os.path.dirname(os.path.abspath(__file__)),
        stdout=sys.stdout,
        stderr=sys.stderr,
    )
    active_bots[req.room_name] = proc
    return {"status": "dispatched", "room": req.room_name, "pid": proc.pid}


@app.post("/api/recall")
def recall(req: RecallRequest):
    proc = active_bots.pop(req.room_name, None)
    if proc and proc.poll() is None:
        proc.terminate()
        return {"status": "recalled", "room": req.room_name}
    return {"status": "not_found", "room": req.room_name}


@app.get("/health")
def health():
    # Filter out dead processes
    alive = {
        room: proc
        for room, proc in active_bots.items()
        if proc.poll() is None
    }
    active_bots.clear()
    active_bots.update(alive)
    return {
        "status": "ok",
        "device": "see bot logs",
        "active_rooms": list(active_bots.keys()),
        "active_count": len(active_bots),
    }
