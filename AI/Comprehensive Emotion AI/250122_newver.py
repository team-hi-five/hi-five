import cv2
from deepface import DeepFace
import time

# 우리가 원하는 감정 리스트
target_emotions = ['angry', 'fear', 'happy', 'sad', 'surprise']

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    #time.sleep(0.1)

    try:
        result = DeepFace.analyze(
            img_path=frame,
            actions=['emotion'],
            enforce_detection=False,
            detector_backend='mtcnn'  # 필요 시 변경 가능
        )

        # DeepFace가 하나 이상의 얼굴을 감지하면 list로, 단일 얼굴만 감지하면 dict로 반환하기도 함
        # 보통은 list 형태가 많으므로 아래와 같이 처리
        if isinstance(result, list) and len(result) > 0:
            data = result[0]
        else:
            data = result

        if 'emotion' in data:
            raw_emotions = data['emotion']
            # 예: {'angry':0.0, 'disgust':0.0, 'fear':12.31, 'happy':76.92, 'sad':10.77, 'surprise':0.0, 'neutral':0.0}

            # 1) 우리가 원하는 5가지 감정만 추출
            extracted = {emo: raw_emotions.get(emo, 0) for emo in target_emotions}

            # 2) 5개 감정값의 합 구하기
            total = sum(extracted.values())

            # 3) 합이 거의 0인 경우(얼굴 인식 불확실) 처리
            if total < 1e-6:  # 혹시 모를 0 나눗셈 방지
                # 그냥 0%로 표시하거나, 스킵 처리
                text = "No face / no confidence"
            else:
                # 4) 100%가 되도록 재정규화
                for emo in extracted:
                    extracted[emo] = (extracted[emo] / total) * 100

                # 5) 표시할 문자열 만들기
                # 예: "angry: 3.1%  fear: 12.2%  happy: 60.0%  sad: 10.5%  surprise: 14.2%"
                text = "  ".join([f"{emo}: {extracted[emo]:.1f}%" for emo in target_emotions])

            print(text)

            # 6) 화면에 표시
            cv2.putText(
                frame,
                text,
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

    except Exception as e:
        print(e)

    cv2.imshow("Emotion Analysis", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
