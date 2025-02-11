import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
// src 밖 serve.js 확인하기

function App() {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [emotionData, setEmotionData] = useState([]);

  // 모델 로드 (컴포넌트 마운트 시)
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
    };
    loadModels();
  }, []);

  // 웹캠 스트림 시작
  const startVideo = () => {
    navigator.getUserMedia(
      { video: {} },
      (stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      },
      (err) => console.error(err)
    );
  };

  // 7가지 감정의 평균값을 계산하는 함수
  const computeAverageEmotion = (data) => {
    // 7가지 감정에 대한 합계를 저장할 객체 초기화
    let sum = {
      neutral: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
    };
    let count = 0;
    data.forEach((item) => {
      item.emotions.forEach((emotionObj) => {
        Object.keys(sum).forEach((key) => {
          sum[key] += emotionObj[key] || 0;
        });
        count++;
      });
    });
    if (count === 0) return null;
    let avg = {};
    Object.keys(sum).forEach((key) => {
      avg[key] = sum[key] / count;
    });
    return avg;
  };

  // 감정 데이터 수집: 100ms마다 얼굴 및 감정 인식 수행
  const handleVideoPlay = () => {
    intervalRef.current = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length > 0) {
        const emotions = detections.map((det) => det.expressions);
        setEmotionData((prevData) => [
          ...prevData,
          { timestamp: new Date().toISOString(), emotions },
        ]);
      }
    }, 100);
  };

  // 비디오 스트림과 인터벌 종료 후 평균값 계산 및 백엔드 전송
  const stopVideo = async () => {
    // 비디오 스트림 종료
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    // 감정 데이터 수집 인터벌 종료
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);

    // 평균값 계산
    const avgEmotion = computeAverageEmotion(emotionData);
    if (!avgEmotion) {
      console.error("수집된 감정 데이터가 없습니다.");
      return;
    }

    // 다섯 감정 후보 목록
    const candidates = ["happy", "sad", "angry", "fearful", "surprised"];
    // 각 후보의 평균값을 추출하여 객체 배열 생성
    const candidateAverages = candidates.map((emotion) => ({
      emotion,
      value: avgEmotion[emotion] || 0,
    }));
    // 내림차순 정렬하여 가장 높은 두 감정 선택
    candidateAverages.sort((a, b) => b.value - a.value);
    const first_emotion = candidateAverages[0].emotion;
    const second_emotion = candidateAverages[1].emotion;

    // JSON payload 생성 (출력 예시와 동일한 형식)
    const payload = {
      timestamp: new Date().toISOString(),
      emotions: [avgEmotion],
      first_emotion,
      second_emotion,
    };

    // 백엔드로 JSON 전송 (엔드포인트 URL은 상황에 맞게 수정)
    try {
      const response = await fetch("/api/save-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("데이터 전송 실패");
      }
      console.log("백엔드로 데이터 전송 성공:", payload);
    } catch (error) {
      console.error("데이터 전송 중 에러:", error);
    }
  };

  // 시작/정지 토글 버튼 핸들러
  const handleToggle = () => {
    if (!running) {
      // 실행 시: 기존 데이터 초기화 후 비디오 시작
      setEmotionData([]);
      startVideo();
      setRunning(true);
    } else {
      // 정지 시: 데이터 수집 종료 후 백엔드 전송
      stopVideo();
    }
  };

  // running 상태일 때 비디오 재생 이벤트 연결
  useEffect(() => {
    if (running && videoRef.current) {
      videoRef.current.onplaying = handleVideoPlay;
    }
  }, [running]);

  return (
    <div>
      <video ref={videoRef} width="720" height="560" autoPlay muted />
      <button onClick={handleToggle}>{running ? "정지" : "시작"}</button>
    </div>
  );
}

export default App;
