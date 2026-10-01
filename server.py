import os
import json
import asyncio
import re
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("audit.server")

DATA_FILE = Path("site_data.json")
SYNC_SECRET = os.getenv("SYNC_SECRET", "audit_lolita_secret_2026")
SESSION_STRING = os.getenv("TELEGRAM_SESSION_STRING")
API_ID = int(os.getenv("TELEGRAM_API_ID", "2040"))
API_HASH = os.getenv("TELEGRAM_API_HASH", "b18441a1ff607e10a989891a5462e627")
TARGET_CHAT_ID = int(os.getenv("TARGET_CHAT_ID", "226583258"))

EXPORT_CUTOFF_UTC = datetime(2026, 9, 30, 23, 21, 5, tzinfo=timezone.utc)

EMOJI_REGEX = re.compile(
    r'[\U0001F1E0-\U0001F1FF\U0001F300-\U0001F5FF\U0001F600-\U0001F64F\U0001F680-\U0001F6FF\U0001F700-\U0001F77F\U0001F780-\U0001F7FF\U0001F800-\U0001F8FF\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF\U00002702-\U000027B0\U000024C2-\U0001F251\u2764\ufe0f]'
)

EMOJI_CATALOG = {
    "😭": ("«Плачу от смеха / жизненного кринжа»", "Ультра-топ"),
    "😂": ("«Классический ор выше гор»", "Реакция"),
    "💀": ("«Умер от происходящего»", "Фатализм"),
    "😅": ("«Нервный смешок в 3 часа ночи»", "Бессонница"),
    "🔥": ("«Огонь вайб кружочков»", "Одобрение"),
    "🙏": ("«Молитва за смену на WB»", "Смирение"),
    "❤": ("«Сердечко и признание»", "Любовь"),
    "❤️": ("«Сердечко и признание»", "Любовь"),
    "👍": ("«Одобрено и база»", "Нормалды"),
    "✨": ("«Оценка крутого вайба»", "Вайб-чек"),
    "🤨": ("«Скепсис и подозрение»", "Вопросик"),
    "😥": ("«Усталость и тяжелый вздох»", "Грустинка")
}

current_data = None
telegram_client = None

def load_data_from_file():
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (OSError, json.JSONDecodeError) as err:
            logger.error("Failed to load %s: %s", DATA_FILE, err)
    return None

def save_data_to_file(data):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except OSError as err:
        logger.error("Failed to persist %s: %s", DATA_FILE, err)

def process_single_message(data, msg, is_live=True):
    is_evgeniy = msg.out
    user_key = "evgeniy" if is_evgeniy else "lolita"
    user_name = "Женя" if is_evgeniy else "Лолита"

    msg_dt = msg.date
    if msg_dt.tzinfo is None:
        msg_dt = msg_dt.replace(tzinfo=timezone.utc)
    local_dt = msg_dt.astimezone(timezone(timedelta(hours=3)))

    hour = local_dt.hour
    today_str = local_dt.strftime("%Y-%m-%d")
    today_display = local_dt.strftime("%d.%m")
    time_display = local_dt.strftime("%H:%M")

    summary_node = data.setdefault("summary", {})
    summary_node["total_messages"] = summary_node.get("total_messages", 0) + 1

    users_node = data.setdefault("users", {})
    user_node = users_node.setdefault(user_key, {})
    user_node["messages"] = user_node.get("messages", 0) + 1

    text = msg.raw_text or ""
    char_count = len(text)
    if char_count > 0:
        summary_node["total_chars"] = summary_node.get("total_chars", 0) + char_count
        user_node["chars"] = user_node.get("chars", 0) + char_count

    total_msgs = summary_node["total_messages"]
    for u in ["evgeniy", "lolita"]:
        u_dict = users_node.setdefault(u, {})
        u_msgs = max(1, u_dict.get("messages", 0))
        u_chars = u_dict.get("chars", 0)
        u_dict["avg_chars"] = round(u_chars / u_msgs, 1)

    ev_dict = users_node.setdefault("evgeniy", {})
    lo_dict = users_node.setdefault("lolita", {})
    ev_dict["percent"] = round(ev_dict.get("messages", 0) / total_msgs * 100, 1)
    lo_dict["percent"] = round(lo_dict.get("messages", 0) / total_msgs * 100, 1)

    msg_type = f"💬 ТЕКСТ ({char_count} знаков)"
    if getattr(msg, "voice", None):
        user_node["voice"] = user_node.get("voice", 0) + 1
        msg_type = "🎙️ ГОЛОСОВОЕ"
    elif getattr(msg, "video", None):
        user_node["video"] = user_node.get("video", 0) + 1
        msg_type = "🎥 КРУЖОЧЕК/ВИДЕО"
    elif getattr(msg, "photo", None):
        msg_type = "📸 ФОТО"

    if 0 <= hour < 6:
        night_node = summary_node.setdefault("night_stats", {})
        night_node["total"] = night_node.get("total", 0) + 1
        night_node[user_key] = night_node.get(user_key, 0) + 1
        night_node["percent"] = round(night_node["total"] / total_msgs * 100, 1)

    if "hours_chart" in data and 0 <= hour < 24:
        data["hours_chart"][hour]["total"] = data["hours_chart"][hour].get("total", 0) + 1
        data["hours_chart"][hour][user_name] = data["hours_chart"][hour].get(user_name, 0) + 1

    if "dates_chart" in data:
        found_day = False
        for day_entry in data["dates_chart"]:
            if day_entry.get("date") in (today_str, today_display):
                day_entry["total"] = day_entry.get("total", 0) + 1
                day_entry[user_name] = day_entry.get(user_name, 0) + 1
                found_day = True
                break
        if not found_day:
            data["dates_chart"].append({
                "date": today_str,
                "total": 1,
                "Женя": 1 if is_evgeniy else 0,
                "Лолита": 0 if is_evgeniy else 1
            })

    if "emojis" in data and text:
        found_emojis = EMOJI_REGEX.findall(text)
        if found_emojis:
            emoji_map = {item["emoji"]: item for item in data["emojis"]}
            for em in found_emojis:
                if em == "❤️":
                    em = "❤"
                if em == "\ufe0f":
                    continue
                if em in emoji_map:
                    emoji_map[em]["count"] += 1
                elif em in EMOJI_CATALOG:
                    desc, tag = EMOJI_CATALOG[em]
                    new_item = {"emoji": em, "count": 1, "desc": desc, "tag": tag}
                    data["emojis"].append(new_item)
                    emoji_map[em] = new_item
                else:
                    new_item = {"emoji": em, "count": 1, "desc": "«Живая реакция из чата»", "tag": "Реакция"}
                    data["emojis"].append(new_item)
                    emoji_map[em] = new_item
            data["emojis"].sort(key=lambda x: x["count"], reverse=True)

    summary_node["last_synced_id"] = max(summary_node.get("last_synced_id", 0), msg.id)
    tag = "🟢 [CLOUD LIVE]" if is_live else "📥 [CLOUD BACKFILL]"
    preview = (text[:45] + "...") if len(text) > 45 else (text or msg_type)
    logger.info("%s [%s] %s: %s | Всего: %s", tag, time_display, user_name, preview, total_msgs)

async def backfill_missed_messages(client, target_dialog, data):
    logger.info("🔄 [CLOUD SYNC] Checking for missed Telegram messages...")
    summary_sec = data.get("summary")
    last_id = summary_sec.get("last_synced_id") if isinstance(summary_sec, dict) else None

    messages = []
    async for m in client.iter_messages(target_dialog, limit=500):
        m_dt = m.date
        if m_dt.tzinfo is None:
            m_dt = m_dt.replace(tzinfo=timezone.utc)

        if last_id:
            if m.id <= last_id:
                break
            messages.append(m)
        else:
            if m_dt <= EXPORT_CUTOFF_UTC:
                break
            messages.append(m)

    if messages:
        messages.reverse()
        logger.info("📥 [CLOUD SYNC] Processing %d missed messages...", len(messages))
        for m in messages:
            process_single_message(data, m, is_live=False)
        save_data_to_file(data)
        logger.info("✅ [CLOUD SYNC] Backfill complete!")
    else:
        logger.info("✅ [CLOUD SYNC] All messages up to date.")

async def run_cloud_telegram_sync():
    global telegram_client, current_data
    if not SESSION_STRING:
        logger.info("ℹ️ TELEGRAM_SESSION_STRING not set. Running in passive server mode.")
        return

    try:
        from telethon import TelegramClient, events
        from telethon.sessions import StringSession

        telegram_client = TelegramClient(StringSession(SESSION_STRING), API_ID, API_HASH)
        await telegram_client.start()
        me = await telegram_client.get_me()
        logger.info("✨ [CLOUD SYNC] Authorized in Telegram as: %s (@%s)", me.first_name, me.username or me.phone)

        target_entity = await telegram_client.get_entity(TARGET_CHAT_ID)
        dialog_name = getattr(target_entity, 'first_name', str(TARGET_CHAT_ID))
        logger.info("🎯 [CLOUD SYNC] Target dialogue: %s (ID: %s)", dialog_name, TARGET_CHAT_ID)

        if current_data is not None:
            await backfill_missed_messages(telegram_client, target_entity, current_data)

        @telegram_client.on(events.NewMessage(chats=target_entity))
        async def on_new_message(event):
            global current_data
            if current_data is not None:
                process_single_message(current_data, event.message, is_live=True)
                save_data_to_file(current_data)

        logger.info("🚀 [CLOUD SYNC] Autonomous cloud live-sync running on Render 24/7!")
        await telegram_client.run_until_disconnected()
    except Exception as err:
        logger.error("⚠️ [CLOUD SYNC] Telethon loop error: %s", err)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global current_data
    current_data = load_data_from_file()
    sync_task = None
    if SESSION_STRING:
        sync_task = asyncio.create_task(run_cloud_telegram_sync())
    yield
    if sync_task and not sync_task.done():
        sync_task.cancel()
    if telegram_client and telegram_client.is_connected():
        await telegram_client.disconnect()

app = FastAPI(title="AUDIT.IO Live Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    is_tg_active = telegram_client is not None and telegram_client.is_connected()
    return {"status": "ok", "service": "audit-live", "cloud_sync": is_tg_active}

@app.get("/api/data")
def get_data():
    global current_data
    if current_data is None:
        current_data = load_data_from_file()
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
    save_data_to_file(payload)

    summary_section = payload.get("summary")
    total = summary_section.get("total_messages", 0) if isinstance(summary_section, dict) else 0
    return {"status": "success", "total_messages": total}

@app.get("/")
def read_root():
    return FileResponse("index.html")

@app.get("/ChatExport_2026-10-01/photos/{filename}")
def legacy_photo_redirect(filename: str):
    file_path = Path("evidence") / filename
    if file_path.exists():
        return FileResponse(file_path)
    if "_thumb" in filename:
        full_name = filename.replace("_thumb", "")
        fallback_path = Path("evidence") / full_name
        if fallback_path.exists():
            return FileResponse(fallback_path)
    raise HTTPException(status_code=404, detail="Photo not found")

app.mount("/", StaticFiles(directory=".", html=True), name="static")
