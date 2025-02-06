import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotions, setEmotions] = useState({});
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [frameCount, setFrameCount] = useState(0);
  const accumulatedEmotions = useRef({
    angry: 0, fear: 0, happy: 0, sad: 0, surprise: 0
  });

  // 웹캠 초기화
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };
    initWebcam();
  }, []);

  // 분석 시작/종료 핸들러
  const toggleAnalysis = async () => {
    if (!isAnalyzing) {
      startRecording();
      accumulatedEmotions.current = { angry: 0, fear: 0, happy: 0, sad: 0, surprise: 0 };
      setFrameCount(0);
      setIsAnalyzing(true);
      analyzeFrame();
    } else {
      stopRecording();
      setIsAnalyzing(false);
      showFinalResults();
    }
  };

  // 프레임 분석 함수
  const analyzeFrame = async () => {
    if (!isAnalyzing) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      try {
        const formData = new FormData();
        formData.append('image', blob, 'frame.jpg');

        const response = await fetch('http://localhost:5000/analyze', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!data.error) {
          accumulatedEmotions.current = Object.keys(data).reduce((acc, emo) => {
            acc[emo] += data[emo];
            return acc;
          }, {...accumulatedEmotions.current});

          setFrameCount(prev => prev + 1);
          setEmotions(data);
        }
      } catch (err) {
        console.error('Analysis error:', err);
      }
      requestAnimationFrame(analyzeFrame);
    }, 'image/jpeg');
  };

  // 녹화 관련 함수
  const startRecording = () => {
    const stream = videoRef.current.srcObject;
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
  };

  const handleDataAvailable = (e) => {
    if (e.data.size > 0) {
      setRecordedChunks(prev => [...prev, e.data]);
    }
  };

  // 최종 결과 표시
  const showFinalResults = () => {
    if (frameCount === 0) return;

    const averaged = Object.keys(accumulatedEmotions.current).reduce((acc, emo) => {
      acc[emo] = (accumulatedEmotions.current[emo] / frameCount).toFixed(2);
      return acc;
    }, {});

    console.log('Final Results:', averaged);
  };

  // 녹화 다운로드
  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <h1>Real-time Emotion Analysis</h1>
      <video ref={videoRef} autoPlay muted className="video-preview" />

      <div className="controls">
        <button onClick={toggleAnalysis}>
          {isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
        </button>

        {recordedChunks.length > 0 && (
          <button onClick={downloadRecording}>
            Download Recording
          </button>
        )}
      </div>

      <div className="results">
        <h2>Emotion Analysis Results</h2>
        {Object.entries(emotions).map(([emotion, value]) => (
          <div key={emotion}>
            {emotion}: {value.toFixed(2)}%
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;