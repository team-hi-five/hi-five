from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from deepface import DeepFace

app = Flask(__name__)
CORS(app)

target_emotions = ['angry', 'fear', 'happy', 'sad', 'surprise']


@app.route('/analyze', methods=['POST'])
def analyze_frame():
    try:
        file = request.files['image']
        img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)

        result = DeepFace.analyze(
            img_path=img,
            actions=['emotion'],
            enforce_detection=False,
            detector_backend='opencv',
        )

        if isinstance(result, list):
            data = result[0]['emotion']
        else:
            data = result['emotion']

        response = {emo: data.get(emo, 0) for emo in target_emotions}
        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run(port=5000)