import os
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AUDIT.IO Live Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = Path("site_data.json")
SYNC_SECRET = os.getenv("SYNC_SECRET", "audit_lolita_secret_2026")

current_data = None
if DATA_FILE.exists():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        current_data = json.load(f)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "audit-live"}

@app.get("/api/data")
def get_data():
    global current_data
    if current_data is None and DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            current_data = json.load(f)
    if current_data is None:
        raise HTTPException(status_code=404, detail="Data not found")
    return JSONResponse(
        content=current_data,
        headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"}
    )

@app.post("/api/update")
async def update_data(payload: dict, x_sync_token: str = Header(None)):
    global current_data
    if x_sync_token and x_sync_token != SYNC_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")
    if not payload or "summary" not in payload:
        raise HTTPException(status_code=400, detail="Invalid payload")

    current_data = payload
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
    except OSError as err:
        sys.stderr.write(f"Failed to persist {DATA_FILE}: {err}\n")

    summary_section = payload.get("summary")
    total = summary_section.get("total_messages", 0) if isinstance(summary_section, dict) else 0
    return {"status": "success", "total_messages": total}

# Serve index.html explicitly
@app.get("/")
def read_root():
    return FileResponse("index.html")

# Static files
app.mount("/", StaticFiles(directory=".", html=True), name="static")
