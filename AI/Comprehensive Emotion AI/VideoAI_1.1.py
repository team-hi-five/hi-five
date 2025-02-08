import os
import cv2
import time
import datetime
import tensorflow as tf
from deepface import DeepFace

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')

target_emotions = ['angry', 'fear', 'happy', 'sad', 'surprise']

cap = cv2.VideoCapture(0)

# 일시정지 / 감정분석(녹화) 상태
is_paused = False
is_analyzing = False

# 화면에 보여줄 마지막 프레임
last_frame = None

# 감정 누적값 / 카운트
accumulated_emotions = {emo: 0.0 for emo in target_emotions}
frame_count = 0

# 비디오 파일 기록용 객체 (None이면 녹화 중이 아님)
out = None

# FPS / 해상도 설정 (필요 시 맞춰 변경)
fps = 15.0 # 15로 설정해야 실제 시간과 동일하게 적용됨. 직접 실험함(한승우)

# 첫 프레임 읽어서 해상도 확인 (일시정지 상관 없이 초기화 목적)
ret_init, frame_init = cap.read()
if ret_init:
    height, width = frame_init.shape[:2]
    # 다시 스트림 위치를 처음으로 맞추거나(웹캠의 경우 크게 의미는 없음)
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
else:
    # 웹캠이 아예 안 켜진 경우 등 처리
    height, width = 480, 640  # 기본값

while True:
    # 일시정지 상태가 아니면 새 프레임 읽어오기
    if not is_paused:
        ret, frame = cap.read()
        if not ret:
            break
        last_frame = frame.copy()

        # 감정분석 중이면 DeepFace 분석 + 비디오 기록
        if is_analyzing:
            try:
                result = DeepFace.analyze(
                    img_path=last_frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    detector_backend='opencv',
                )

                # DeepFace 결과 정리
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
                        # 정규화
                        for emo in extracted:
                            extracted[emo] = (extracted[emo] / total) * 100

                        # 누적
                        for emo in target_emotions:
                            accumulated_emotions[emo] += extracted[emo]
                        frame_count += 1

                        # 현재 프레임 결과
                        text = "  ".join([f"{emo}: {extracted[emo]:.1f}%" for emo in target_emotions])

                    print(text)

            except Exception as e:
                print(e)

            # 지금 프레임을 녹화 파일에 기록
            if out is not None:
                out.write(last_frame)

    # 일시정지 상태라면 새 프레임 읽지 않고 last_frame만 표시 (감정분석, 녹화도 중단)

    # 화면 표시
    if last_frame is not None:
        cv2.imshow("Emotion Analysis", last_frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):
        # 종료
        break

    elif key == ord(' '):
        # 스페이스바 -> 일시정지/재개
        is_paused = not is_paused
        if is_paused:
            print("=== 일시정지 ===")
        else:
            print("=== 재개 ===")

    elif key == ord('t'):
        # 감정분석 + 녹화 토글
        if not is_analyzing:
            # 분석 & 녹화 시작
            print(">>> 감정 분석 시작!")
            is_analyzing = True

            # 누적값 초기화
            accumulated_emotions = {emo: 0.0 for emo in target_emotions}
            frame_count = 0

            # 현재 날짜-시간을 파일명에 사용
            now_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"save_videos/{now_str}.avi"
            print(f"녹화 파일: {filename}")

            # VideoWriter 생성 (XVID 코덱 예시)
            fourcc = cv2.VideoWriter_fourcc(*'XVID')
            out = cv2.VideoWriter(filename, fourcc, fps, (width, height))

        else:
            # 분석 & 녹화 종료
            is_analyzing = False
            print(">>> 감정 분석 종료")

            # out release
            if out is not None:
                out.release()
                out = None

            # 최종 평균 감정 계산
            if frame_count > 0:
                averaged_emotions = {}
                for emo in target_emotions:
                    averaged_emotions[emo] = accumulated_emotions[emo] / frame_count

                text_final = "Recorded Emotion Summary:"
                for emo in target_emotions:
                    text_final += f" {emo}: {averaged_emotions[emo]:.2f}%"
            else:
                text_final = "분석된 프레임이 없습니다."

            print(text_final)

cap.release()
if out is not None:
    out.release()
cv2.destroyAllWindows()
