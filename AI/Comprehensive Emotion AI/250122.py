import cv2
from deepface import DeepFace
import time

# 웹캠 열기
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    time.sleep(0.1)

    # DeepFace를 이용해 얼굴 영역을 감정 분석
    # enforce_detection=False로 하면 얼굴 감지 안 되어도 에러가 나지 않게 함 (얼굴 없으면 분석 불가)
    try:
        result = DeepFace.analyze(
            img_path = frame,
            actions = ['emotion'],  # 감정 분석만 수행
            enforce_detection=False
        )

        print(result)

        # 추론된 감정 결과(딕셔너리 형태)
        # 예) {'emotion': {'angry': 0.0, 'disgust': 0.0, 'fear': 12.31, 'happy': 76.92, ...}, 'dominant_emotion': 'happy'}
        if 'emotion' in result:
            emotions = result['emotion']

            # 콘솔 출력
            print(emotions)

            # 화면에 표시할 문자열 만들기
            text = ""
            for (emo, score) in emotions.items():
                text += f"{emo}: {score:.1f}%  "

            # 감정 정보 프레임 상단에 표시
            cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)
    except Exception as e:
        print(e)

    cv2.imshow("Emotion Analysis", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()