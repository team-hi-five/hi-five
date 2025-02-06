# video_ai.py

import os
import cv2
import time
import datetime
import tensorflow as tf
from deepface import DeepFace
import csv

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')

target_emotions = ['angry', 'fear', 'happy', 'sad', 'surprise']

# 전역 제어 변수 (FastAPI 백엔드와 공유)
analysis_running = False
result_callback = None  # 분석 결과를 전달받을 콜백 함수 (예: WebSocket 전송)
out = None  # cv2.VideoWriter 객체 (영상 녹화용)

def run_analysis():
    global analysis_running, result_callback, out

    #cap = cv2.VideoCapture(0)
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    fps = 15.0  # 실제 시간과 동일한 FPS로 설정
    ret_init, frame_init = cap.read()
    if ret_init:
        height, width = frame_init.shape[:2]
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
    else:
        height, width = 480, 640

    # 영상 녹화를 위한 VideoWriter 생성
    os.makedirs("save_videos", exist_ok=True)
    now_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    video_filename = f"save_videos/{now_str}.avi"
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(video_filename, fourcc, fps, (width, height))
    print(f"녹화 파일: {video_filename}")

    # CSV 파일에 각 프레임의 감정 분석 결과 기록
    os.makedirs("emotion_logs", exist_ok=True)
    csv_filename = f"emotion_logs/{now_str}_emotions.csv"
    csv_file = open(csv_filename, mode="w", newline="", encoding="utf-8")
    csv_writer = csv.writer(csv_file)
    header = ["timestamp", "frame_count"] + target_emotions
    csv_writer.writerow(header)

    accumulated_emotions = {emo: 0.0 for emo in target_emotions}
    frame_count = 0

    while analysis_running:
        ret, frame = cap.read()
        if not ret:
            break

        # 영상 녹화: 현재 프레임을 파일에 기록
        if out is not None:
            out.write(frame)

        try:
            result = DeepFace.analyze(
                img_path=frame,
                actions=['emotion'],
                enforce_detection=False,
                detector_backend='opencv',
            )
            # 결과 정리: 결과가 리스트인지 아닌지 처리
            if isinstance(result, list) and len(result) > 0:
                data = result[0]
            else:
                data = result

            if 'emotion' in data:
                raw_emotions = data['emotion']
                extracted = {emo: raw_emotions.get(emo, 0) for emo in target_emotions}
                total = sum(extracted.values())
                if total < 1e-6:
                    text = "No face / no confidence"
                else:
                    # 정규화: 각 감정 퍼센트 계산
                    for emo in extracted:
                        extracted[emo] = (extracted[emo] / total) * 100

                    # 누적 및 프레임 수 증가
                    for emo in target_emotions:
                        accumulated_emotions[emo] += extracted[emo]
                    frame_count += 1

                    # 현재 프레임 결과 문자열 생성
                    text = "  ".join([f"{emo}: {extracted[emo]:.1f}%" for emo in target_emotions])

                print(text)
                # CSV 파일에 현재 프레임 결과 기록
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                row = [timestamp, frame_count] + [f"{extracted[emo]:.1f}" for emo in target_emotions]
                csv_writer.writerow(row)
                csv_file.flush()

                # 콜백 함수 호출하여 외부(예: WebSocket)로 결과 전송
                if result_callback:
                    result_callback(text)

        except Exception as e:
            print("Error in analysis:", e)

        time.sleep(1.0 / fps)

    cap.release()
    if out is not None:
        out.release()
        out = None
    csv_file.close()

    # 최종 분석 결과 요약(평균 감정값 계산)
    if frame_count > 0:
        averaged_emotions = {emo: accumulated_emotions[emo] / frame_count for emo in target_emotions}
        summary = "Recorded Emotion Summary: " + " ".join([f"{emo}: {averaged_emotions[emo]:.2f}%" for emo in target_emotions])
    else:
        summary = "분석된 프레임이 없습니다."
    if result_callback:
        result_callback(summary)
