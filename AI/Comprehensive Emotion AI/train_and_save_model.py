import os
import tensorflow as tf
from deepface import DeepFace

# TensorFlow 로그 레벨 조정 (불필요한 로그 숨김)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')

# DeepFace의 감정 모델 로드 ("Emotion" 모델)
model = DeepFace.build_model("Emotion")

# 모델 저장 (저장 경로에 디렉토리가 없으면 미리 생성)
save_dir = "saved_models"
os.makedirs(save_dir, exist_ok=True)
model_path = os.path.join(save_dir, "emotion_model.h5")
model.save(model_path)
print(f"Emotion model saved to {model_path}")


# -----------------------------------------------------------------------------------
# 참고: 저장된 모델을 TensorFlow.js에서 사용하기 위해서는 아래와 같이 변환합니다.
# 커맨드 라인에서 다음 명령 실행 (tensorflowjs_converter가 설치되어 있어야 함)
#
# tensorflowjs_converter --input_format=keras saved_models/emotion_model.h5 public/models/emotion_model
#
# 그러면 'public/models/emotion_model' 폴더 내에 model.json 파일과 가중치 파일들이 생성됩니다.
# -----------------------------------------------------------------------------------
