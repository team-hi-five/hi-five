import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const targetEmotions = ['angry', 'fear', 'happy', 'sad', 'surprise'];
const FPS = 15;

const EmotionAnalysis = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState('');
  const [model, setModel] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const accumulatedEmotions = useRef(targetEmotions.reduce((acc, emo) => ({...acc, [emo]: 0}), {}));
  const frameCount = useRef(0);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // 모델 로드
  useEffect(() => {
    tf.loadLayersModel('/path/to/emotion_model/model.json').then(loadedModel => {
      setModel(loadedModel);
    });
  }, []);

  // 키 이벤트 핸들러
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.key) {
        case ' ':
          setIsPaused(prev => !prev);
          break;
        case 't':
          toggleAnalysis();
          break;
        case 'q':
          stopWebcam();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 웹캠 정지
  const stopWebcam = () => {
    const stream = webcamRef.current?.video?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // 분석 토글
  const toggleAnalysis = async () => {
    if (!isAnalyzing) {
      startRecording();
      accumulatedEmotions.current = targetEmotions.reduce((acc, emo) => ({...acc, [emo]: 0}), {});
      frameCount.current = 0;
      setIsAnalyzing(true);
    } else {
      stopRecording();
      calculateSummary();
      setIsAnalyzing(false);
    }
  };

  // 녹화 시작
  const startRecording = () => {
    const stream = webcamRef.current?.video?.srcObject;
    if (stream) {
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = handleDataAvailable;
      recorder.start();
      setMediaRecorder(recorder);
    }
  };

  // 녹화 중지
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  // 녹화 데이터 처리
  const handleDataAvailable = (e) => {
    if (e.data.size > 0) {
      setRecordedChunks(prev => [...prev, e.data]);
    }
  };

  // 요약 계산
  const calculateSummary = () => {
    if (frameCount.current === 0) {
      setSummary('No frames analyzed');
      return;
    }

    const averages = targetEmotions.map(emo =>
      (accumulatedEmotions.current[emo] / frameCount.current).toFixed(2)
    );

    setSummary(targetEmotions
      .map((emo, i) => `${emo}: ${averages[i]}%`)
      .join('  ')
    );
  };

  // 프레임 처리
  const processFrame = async () => {
    if (!webcamRef.current || !model || isPaused) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 캔버스에 프레임 그리기
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (isAnalyzing) {
      // 텐서 변환 및 전처리
      const tensor = tf.browser.fromPixels(canvas)
        .resizeNearestNeighbor([48, 48])
        .mean(2)
        .expandDims(0)
        .expandDims(-1)
        .toFloat()
        .div(255);

      // 예측 실행
      const prediction = await model.predict(tensor).data();

      // 감정 결과 계산
      const emotionValues = targetEmotions.reduce((acc, emo, i) => {
        acc[emo] = prediction[i] * 100;
        return acc;
      }, {});

      // 결과 누적
      targetEmotions.forEach(emo => {
        accumulatedEmotions.current[emo] += emotionValues[emo];
      });
      frameCount.current++;
    }

    requestAnimationFrame(processFrame);
  };

  // 프레임 처리 시작
  useEffect(() => {
    if (webcamRef.current && canvasRef.current) {
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;
      requestAnimationFrame(processFrame);
    }
  }, [webcamRef.current, canvasRef.current]);

  return (
    <div>
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: 'user' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div>Status: {isPaused ? 'Paused' : 'Running'}</div>
      <div>Analysis: {isAnalyzing ? 'ON' : 'OFF'}</div>
      {summary && <div>Summary: {summary}</div>}
    </div>
  );
};

export default EmotionAnalysis;