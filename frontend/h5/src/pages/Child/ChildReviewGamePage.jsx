import "./ChildCss/ChildReviewGamePage.css";
import { Card } from "primereact/card";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { reviewGame } from "/src/api/childGameContent";

function ChildReviewGamePage() {
  // 동영상 재생용 ref
  const videoRef = useRef(null);
  // 웹캠 분석용 video ref
  const webcamRef = useRef(null);
  // 분석 인터벌 id 저장용 ref
  const analysisIntervalRef = useRef(null);
  // 분석 데이터를 동기적으로 저장하기 위한 ref
  const analysisDataRef = useRef([]);

  // 동영상 데이터 (API 호출 결과)
  const [gameInfo1, setGameInfo1] = useState(null);
  const [gameInfo2, setGameInfo2] = useState(null);
  const [gameInfo3, setGameInfo3] = useState(null);
  const [gameInfo4, setGameInfo4] = useState(null);
  const [gameInfo5, setGameInfo5] = useState(null);

  // 추가 상태: 모드, 현재 동영상 인덱스, 분석 결과
  const [mode, setMode] = useState("playing"); // "playing" | "analyzing" | "result"
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);

  // 여러 게임 정보를 배열에 담기 (모든 API 호출 완료 후에 사용)
  const gameInfos = [gameInfo1, gameInfo2, gameInfo3, gameInfo4, gameInfo5];

  // --- 1. face-api 모델 로드 ---
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      console.log("face-api 모델 로드 완료");
    };
    loadModels();
  }, []);

  // --- 2. API를 통해 동영상 데이터 로드 ---
  useEffect(() => {
    const chapter = 1;
    async function loadGameData() {
      try {
        const data1 = await reviewGame(chapter, 1);
        const data2 = await reviewGame(chapter, 2);
        const data3 = await reviewGame(chapter, 3);
        const data4 = await reviewGame(chapter, 4);
        const data5 = await reviewGame(chapter, 5);

        setGameInfo1(data1);
        setGameInfo2(data2);
        setGameInfo3(data3);
        setGameInfo4(data4);
        setGameInfo5(data5);

        console.log("게임 데이터 불러오기 성공", { data1, data2, data3, data4, data5 });
      } catch (error) {
        console.error("게임 데이터 로드 실패", error);
      }
    }
    loadGameData();
  }, []);

  // --- 3. 동영상 자동 재생 (mode가 playing일 때) ---
  useEffect(() => {
    if (mode === "playing" && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("비디오 재생 오류:", error);
      });
    }
  }, [mode, currentVideoIndex]);

  // --- 4. 동영상 재생 종료 시 분석 모드로 전환 ---
  const handleVideoEnded = () => {
    if (mode === "playing") {
      setMode("analyzing");
    }
  };

  // 추가: 컴포넌트 마운트 시 웹캠 스트림 시작 (항상 켜짐)
useEffect(() => {
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.play();
      }
    } catch (err) {
      console.error("웹캠 시작 실패:", err);
    }
  };
  startWebcam();
}, []);


  // --- 5. 분석 모드 시작: 웹캠 스트림 요청 및 감정 분석 ---
  useEffect(() => {
    if (mode === "analyzing") {
      startAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // 감정 데이터의 평균값을 계산하는 함수
  const computeAverageEmotion = (data) => {
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
      // item.emotions는 배열 형태입니다.
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

  // 분석 시작 함수
  const startAnalysis = async () => {
    // 분석 데이터 초기화 (ref와 state 모두 초기화)
    analysisDataRef.current = [];

    // 100ms 간격으로 얼굴 및 감정 인식
    const intervalId = setInterval(async () => {
      if (webcamRef.current) {
        const detections = await faceapi
          .detectAllFaces(
            webcamRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        // 디버깅: detections 값을 출력
        console.log("face-api detections:", detections);

        if (detections.length > 0) {
          const emotions = detections.map((det) => det.expressions);
          // ref에 바로 데이터를 추가
          analysisDataRef.current.push({
            timestamp: new Date().toISOString(),
            emotions,
          });
        }
      }
    }, 100);
    analysisIntervalRef.current = intervalId;

    // 4초 후 분석 중지
    setTimeout(() => {
      stopAnalysis();
    }, 4000);
  };

  // 분석 중지 및 결과 처리 함수
  const stopAnalysis = () => {
    console.log("분석 중지");
    // 인터벌 종료
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    // 수집된 데이터 평균 계산 (ref에서 읽음)
    const avgEmotion = computeAverageEmotion(analysisDataRef.current);
    if (!avgEmotion) {
      console.error("수집된 감정 데이터가 없습니다.");
      return;
    }
    // 다섯 감정 후보 중 평균값 높은 순으로 정렬 (happy, sad, angry, fearful, surprised)
    const candidates = ["happy", "sad", "angry", "fearful", "surprised"];
    const candidateAverages = candidates.map((emotion) => ({
      emotion,
      value: avgEmotion[emotion] || 0,
    }));
    candidateAverages.sort((a, b) => b.value - a.value);
    const first_emotion = candidateAverages[0].emotion;
    const second_emotion = candidateAverages[1].emotion;

    // 분석 결과 업데이트 및 모드 전환
    setAnalysisResult({ first_emotion, second_emotion, avgEmotion });
    setMode("result");

    // 결과 4초 후 다음 동영상으로 전환 (영상이 남아있다면)
    setTimeout(() => {
      if (currentVideoIndex < gameInfos.length - 1) {
        setCurrentVideoIndex((prevIndex) => prevIndex + 1);
        // 결과 초기화 후 동영상 재생 모드로 전환
        setAnalysisResult(null);
        setMode("playing");
      } else {
        console.log("모든 동영상 재생 완료");
        // 모든 동영상 종료 후 추가 처리 가능
      }
    }, 4000);
  };

  return (
    <div className="ch-review-game-container">
      <div className="ch-review-container">
        {/* 왼쪽: 게임 동영상 영역 */}
        <div className="ch-review-game-left">
          <Card className="ch-game-screen-container">
            <h2>1단계 2단원</h2>
            <h3>히히 찬환이 치킨 먹으러 간당</h3>
            <video
              ref={videoRef}
              src={
                gameInfos[currentVideoIndex]
                  ? gameInfos[currentVideoIndex].gameVideo
                  : ""
              }
              className="ch-gameVideo"
              autoPlay
              onEnded={handleVideoEnded}
            />
            <div>progressbar</div>
            {/* 선택지 버튼 영역 */}
            <div className="ch-game-button"></div>
          </Card>
        </div>

        {/* 오른쪽: 웹캠 및 상담가 화면 영역 */}
        <div className="ch-review-game-right">
          <div className="ch-game-face-screen">
            <Card className="ch-game-Top-section">
              <video
                ref={webcamRef}
                width="320"
                height="240"
                autoPlay
                muted
                style={{ backgroundColor: "#000" }}
              />
              {mode === "analyzing" && <p>분석 중...</p>}
              {mode === "result" && analysisResult && (
                <div>
                  <h3>분석 결과</h3>
                  <p>주요 감정: {analysisResult.first_emotion}</p>
                  <p>보조 감정: {analysisResult.second_emotion}</p>
                </div>
              )}
            </Card>

            <div className="ch-game-middle-section"></div>

            <div className="ch-game-bottom-section">
              <div className="ch-game-button-left">
                <img src="/child/button-left.png" alt="button-left" />
              </div>
              <Card className="ch-game-counselor-screen">
                <div className="review-message">
                  {mode === "result" && analysisResult ? (
                    <>
                      <h3>분석 결과</h3>
                      <p>주요 감정: {analysisResult.first_emotion}</p>
                      <p>보조 감정: {analysisResult.second_emotion}</p>
                    </>
                  ) : (
                    <>
                      <h3>상황에 어울리는 표정을 지어볼까요?</h3>
                      <p>상황에 어울리는 표정을 지어볼까요?</p>
                    </>
                  )}
                  <div className="feedback-message">
                    {mode === "result" ? (
                      <p>분석 결과를 바탕으로 피드백 제공</p>
                    ) : (
                      <p>우와 너 정말 잘하는 구나!</p>
                    )}
                  </div>
                </div>
              </Card>
              <div className="ch-game-button-right">
                <img src="/child/button-right.png" alt="button-right" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChildReviewGamePage;
