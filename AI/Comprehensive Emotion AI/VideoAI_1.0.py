import os
import cv2
import time
import tensorflow as tf
from deepface import DeepFace

# TensorFlow 로그 최소화
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')

# 원하는 감정 리스트
target_emotions = ['angry', 'fear', 'happy', 'sad', 'surprise']

cap = cv2.VideoCapture(0)

# 일시정지 / 감정분석 상태
is_paused = False
is_analyzing = False

# 화면 표시를 위해 "마지막 읽어온 프레임"을 저장할 변수
last_frame = None

# 감정 누적값 및 분석된 프레임 수
accumulated_emotions = {emo: 0.0 for emo in target_emotions}
frame_count = 0

while True:
    # 화면이 '일시정지' 상태가 아니라면, 새 프레임을 읽어온다.
    if not is_paused:
        ret, frame = cap.read()
        if not ret:
            break
        # 새로 읽은 프레임을 last_frame에 보관 (화면 표시용)
        last_frame = frame.copy()

        # 감정분석 상태라면, DeepFace.analyze 수행
        if is_analyzing:
            try:
                result = DeepFace.analyze(
                    img_path=last_frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    detector_backend='opencv',  # 필요시 mediapipe 등
                )

                # DeepFace 결과(list/dict)에 대응
                if isinstance(result, list) and len(result) > 0:
                    data = result[0]
                else:
                    data = result

                # 감정 분석 결과가 있으면 누적
                if 'emotion' in data:
                    raw_emotions = data['emotion']
                    extracted = {emo: raw_emotions.get(emo, 0) for emo in target_emotions}
                    total = sum(extracted.values())

                    # 감정값 합이 거의 0이면 (검출 실패 등)
                    if total < 1e-6:
                        text = "No face / no confidence"
                    else:
                        # 100%가 되도록 정규화
                        for emo in extracted:
                            extracted[emo] = (extracted[emo] / total) * 100

                        # 누적
                        for emo in target_emotions:
                            accumulated_emotions[emo] += extracted[emo]
                        frame_count += 1

                        # 이번 프레임의 감정 결과 문자열
                        text = "  ".join([f"{emo}: {extracted[emo]:.1f}%" for emo in target_emotions])

                    print(text)  # 콘솔 출력

                    # 화면에 표시
                    cv2.putText(
                        last_frame,  # last_frame에 표시
                        text,
                        (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        (255, 255, 255),
                        2
                    )

            except Exception as e:
                print(e)

    # 일시정지 상태라면, 새 프레임을 읽지 않고
    # 마지막 프레임(last_frame)만 계속 보여준다.
    # (감정 분석도 수행하지 않음)

    # last_frame이 None이 아닐 때만 화면에 표시
    if last_frame is not None:
        cv2.imshow("Emotion Analysis", last_frame)

    # 키 입력 처리
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        # q 버튼 -> 종료
        break

    elif key == ord(' '):
        # 스페이스바 -> 일시정지/재개 토글
        is_paused = not is_paused
        if is_paused:
            print("=== 일시정지 ===")
        else:
            print("=== 재개 ===")

    elif key == ord('t'):
        # T 버튼 -> 감정분석 시작/종료 토글
        if not is_analyzing:
            # 분석 시작
            print(">>> 감정 분석 시작!")
            is_analyzing = True

            # 누적값, 프레임수 초기화
            accumulated_emotions = {emo: 0.0 for emo in target_emotions}
            frame_count = 0

        else:
            # 분석 종료
            is_analyzing = False
            print(">>> 감정 분석 종료")

            # 누적값 기반 최종 평균 계산
            if frame_count > 0:
                averaged_emotions = {}
                for emo in target_emotions:
                    averaged_emotions[emo] = accumulated_emotions[emo] / frame_count

                # 출력용 문자열
                text_final = "Recorded Emotion Summary:"
                for emo in target_emotions:
                    text_final += f" {emo}: {averaged_emotions[emo]:.2f}%"
            else:
                text_final = "분석된 프레임이 없습니다."

            print(text_final)

cap.release()
cv2.destroyAllWindows()
