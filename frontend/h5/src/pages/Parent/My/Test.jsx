import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const EmotionAnalyzer = () => {
  const webcamRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotionData, setEmotionData] = useState({});

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    };
    loadModels();
  }, []);

  const analyzeEmotion = async () => {
    if (!webcamRef.current || !isAnalyzing) return;

    const video = webcamRef.current.video;
    if (!video) return;

    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections) {
      setEmotionData(detections.expressions);
    }
  };

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(analyzeEmotion, 1000);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  return (
    <div>
      <h2>Emotion Analysis</h2>
      <Webcam ref={webcamRef} width="640" height="480" />
      <button onClick={() => setIsAnalyzing(!isAnalyzing)}>
        {isAnalyzing ? "감정 분석 중지" : "감정 분석 시작"}
      </button>
      {isAnalyzing && (
        <div>
          {Object.entries(emotionData).map(([emotion, value]) => (
            <p key={emotion}>
              {emotion}: {(value * 100).toFixed(2)}%
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmotionAnalyzer;
