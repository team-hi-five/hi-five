# main.py

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import threading

# video_ai 모듈에서 필요한 변수와 함수를 import
from video_ai import run_analysis, analysis_running, result_callback

# 전역 변수: 분석 스레드와 WebSocket 연결 관리
analysis_thread = None
websocket_connections = set()

def broadcast_result(message: str):
    import asyncio
    for ws in list(websocket_connections):
        try:
            asyncio.create_task(ws.send_text(message))
        except Exception as e:
            print("WebSocket send error:", e)

def analysis_callback_local(message: str):
    print("분석 결과:", message)
    broadcast_result(message)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global analysis_thread
    # 서버 시작 시: video_ai 모듈의 result_callback을 로컬 콜백으로 설정하고, 분석 스레드 시작
    from video_ai import analysis_running, result_callback
    if not analysis_running:
        result_callback = analysis_callback_local
        analysis_thread = threading.Thread(target=run_analysis, daemon=True)
        analysis_thread.start()
    yield
    # 서버 종료 시: 분석 중지
    from video_ai import analysis_running
    analysis_running = False
    if analysis_thread is not None:
        analysis_thread.join()

app = FastAPI(lifespan=lifespan, docs_url="/docs", openapi_url="/open-api-docs")

# CORS 설정: 프론트엔드와 백엔드가 다른 도메인/포트인 경우 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Video Emotion Analysis is running!"}

@app.post("/start_analysis")
async def start_analysis():
    # 별도 제어 API: analysis_running이 False일 경우 분석 재시작
    from video_ai import analysis_running, result_callback, run_analysis
    if not analysis_running:
        # result_callback는 이미 lifespan에서 설정되어 있음
        import video_ai
        video_ai.analysis_running = True
        global analysis_thread
        analysis_thread = threading.Thread(target=run_analysis, daemon=True)
        analysis_thread.start()
        return {"status": "analysis started"}
    return {"status": "analysis already running"}

@app.post("/stop_analysis")
async def stop_analysis():
    from video_ai import analysis_running
    analysis_running = False
    return {"status": "analysis stopped"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.add(websocket)
    try:
        while True:
            # 클라이언트로부터 오는 메시지는 별도 처리하지 않고 대기
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_connections.remove(websocket)
