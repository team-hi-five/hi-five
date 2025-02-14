import "./ChildCss/ChildReviewGamePage.css";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { reviewGame } from "/src/api/childGameContent";
import stringSimilarity from "string-similarity";
import Swal from "sweetalert2";

function ChildReviewGamePage() {
  // 동영상 재생용 ref
  const videoRef = useRef(null);
  // 웹캠 분석용 video ref
  const webcamRef = useRef(null);
  // 표정 분석 인터벌 id 저장용 ref
  const analysisIntervalRef = useRef(null);
  // 표정 분석 데이터를 동기적으로 저장하기 위한 ref
  const analysisDataRef = useRef([]);

  // 단계(phase) 상태
  // "video": 영상 재생 중
  // "analysisModal": 분석 전 모달 (표정, 음성 동시에 안내)
  // "analysis": 표정 및 음성 분석 진행 중
  // "analysisResult": 표정 및 음성 결과 표시
  const [phase, setPhase] = useState("video");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // 한 사이클의 분석 결과 저장 (두 사이클 진행)
  const [faceResult, setFaceResult] = useState(null);
  const [voiceResult, setVoiceResult] = useState(null);
  // 몇 번째 분석 사이클인지 (1 또는 2)
  const [analysisCycle, setAnalysisCycle] = useState(1);

  // 스테이지 데이터 (동영상 데이터에서 옵션 배열 및 정답 보정)
  // DB에서 넘어온 answer 값은 1씩 큰 값이므로, 실제 정답 인덱스는 (answer - 1)
  const [stageData, setStageData] = useState(null);

  // 동영상 데이터 (API 호출 결과)
  const [gameInfo1, setGameInfo1] = useState(null);
  const [gameInfo2, setGameInfo2] = useState(null);
  const [gameInfo3, setGameInfo3] = useState(null);
  const [gameInfo4, setGameInfo4] = useState(null);
  const [gameInfo5, setGameInfo5] = useState(null);
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

        console.log("게임 데이터 불러오기 성공", {
          data1,
          data2,
          data3,
          data4,
          data5,
        });

        // 하드코딩 sample 예시
        const sampleStageData = {
          options: ["사과", "바나나", "오렌지"],
          answer: 2, // DB 값이 2라면 실제 정답 인덱스는 2 - 1 = 1 (즉, "바나나")
        };
        setStageData(sampleStageData);
      } catch (error) {
        console.error("게임 데이터 로드 실패", error);
      }
    }
    loadGameData();
  }, []);

  // --- 영상 재생 단계 ---
  useEffect(() => {
    if (phase === "video" && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("비디오 재생 오류:", error);
      });
    }
  }, [phase, currentVideoIndex]);

  // 영상 종료 시 1초 후 "analysisModal" 단계로 전환
  const handleVideoEnded = () => {
    if (phase === "video") {
      setTimeout(() => {
        setPhase("analysisModal");
      }, 1000);
    }
  };

  // --- 웹캠 스트림 시작 ---
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

  // --- 모달: 분석 전 (표정, 음성 동시에 안내) ---
  useEffect(() => {
    if (phase === "analysisModal") {
      Swal.fire({
        title: "상황에 맞는 표정과 말을 해볼까요?",
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        setPhase("analysis");
        runConcurrentAnalysis();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // --- 표정 분석 보조 함수: 평균 감정 계산 ---
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

  // --- 동시 분석 실행 함수: 표정 분석 & 음성 인식을 동시에 진행 ---
  const runConcurrentAnalysis = async () => {
    // 표정 분석 Promise (4초간 분석)
    const facePromise = new Promise((resolve) => {
      analysisDataRef.current = [];
      const intervalId = setInterval(async () => {
        if (webcamRef.current) {
          const detections = await faceapi
            .detectAllFaces(
              webcamRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceExpressions();
          // console.log("face-api detections:", detections);
          if (detections.length > 0) {
            const emotions = detections.map((det) => det.expressions);
            analysisDataRef.current.push({
              timestamp: new Date().toISOString(),
              emotions,
            });
          }
        }
      }, 100);
      analysisIntervalRef.current = intervalId;
      setTimeout(() => {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
        const avgEmotion = computeAverageEmotion(analysisDataRef.current);
        if (!avgEmotion) {
          resolve("표정 분석 실패");
          return;
        }
        // 후보 감정 및 예상 감정 (currentVideoIndex에 따라 결정)
        const candidates = ["happy", "sad", "angry", "fearful", "surprised"];
        const candidateAverages = candidates.map((emotion) => ({
          emotion,
          value: avgEmotion[emotion] || 0,
        }));
        candidateAverages.sort((a, b) => b.value - a.value);
        const bestEmotion = candidateAverages[0].emotion;
        const expectedEmotions = [
          "happy",
          "sad",
          "angry",
          "fearful",
          "surprised",
        ];
        const expectedEmotion = expectedEmotions[currentVideoIndex] || "없음";
        const resultMsg =
          bestEmotion === expectedEmotion
            ? `정답입니다! 표정 분석 결과: ${bestEmotion}`
            : `오답입니다! 표정 분석 결과: ${bestEmotion} (예상: ${expectedEmotion})`;
        resolve(resultMsg);
      }, 4000);
    });

    // 음성 인식 Promise
    const voicePromise = new Promise((resolve, reject) => {
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        reject("이 브라우저는 Speech Recognition을 지원하지 않습니다.");
        return;
      }
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        let finalResult = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalResult += event.results[i][0].transcript;
          }
        }
        const optionsArray = gameInfos[currentVideoIndex].options;
        const bestMatch = stringSimilarity.findBestMatch(
          finalResult,
          optionsArray
        );
        const bestOptionIndex = bestMatch.bestMatchIndex;
        const voiceMsg =
          bestOptionIndex === gameInfos[currentVideoIndex].answer - 1
            ? `정답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`
            : `오답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`;
        resolve(voiceMsg);
      };
      recognition.onerror = (event) => {
        console.error("음성 인식 오류", event.error);
        resolve("음성 인식 실패");
      };
      recognition.start();
      // 음성 인식 제한 시간 (예: 5초) 후 강제 종료
      setTimeout(() => {
        recognition.abort();
        resolve("음성 인식 시간이 초과되었습니다.");
      }, 5000);
    });

    try {
      const [faceMsg, voiceMsg] = await Promise.all([
        facePromise,
        voicePromise,
      ]);
      // 결과를 동시에 저장
      setFaceResult(faceMsg);
      setVoiceResult(voiceMsg);
      // 결과 표시 단계로 전환
      setPhase("analysisResult");
    } catch (error) {
      console.error("동시 분석 오류:", error);
    }
  };

  // --- 결과 표시 후 다음 사이클 또는 다음 영상으로 전환 ---
  useEffect(() => {
    if (phase === "analysisResult") {
      const timeoutId = setTimeout(() => {
        if (analysisCycle === 1) {
          // 첫 번째 사이클 완료 → 두 번째 사이클 시작
          setAnalysisCycle(2);
          setFaceResult(null);
          setVoiceResult(null);
          setPhase("analysisModal");
        } else if (analysisCycle === 2) {
          // 두 번째 사이클 완료 → 다음 영상으로 전환
          setAnalysisCycle(1);
          setFaceResult(null);
          setVoiceResult(null);
          setPhase("video");
          setCurrentVideoIndex((prev) =>
            prev < gameInfos.length - 1 ? prev + 1 : prev
          );
        }
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [phase, analysisCycle, gameInfos.length]);

  return (
    <div className="ch-review-game-container">
      <div className="ch-review-container">
        {/* 왼쪽: 게임 동영상 영역 */}
        <div className="ch-review-game-left">
          <Card className="ch-game-screen-container">
            {gameInfos[currentVideoIndex] && (
              <>
                <h2>
                  {gameInfos[currentVideoIndex].chapterId}단계{" "}
                  {gameInfos[currentVideoIndex].gameStageId}단원
                </h2>
                <h3>{gameInfos[currentVideoIndex].situation}</h3>
              </>
            )}
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
            {/* ProgressBar 추가 (진행 상황: 1~5 단계에 따라) */}
            <ProgressBar
              value={(currentVideoIndex + 1) * 20}
              style={{
                width: "80%",
                height: "15px",
                margin: "0 auto",
                marginTop: "20px",
              }}
            />

            {/* 선택지 버튼 영역 - 이미지와 텍스트 함께 표시 */}
            <div className="ch-game-button">
              {gameInfos[currentVideoIndex] &&
                gameInfos[currentVideoIndex].optionImages &&
                gameInfos[currentVideoIndex].options && (
                  <div className="option-images">
                    {gameInfos[currentVideoIndex].optionImages.map(
                      (imgSrc, index) => (
                        <div key={index} className="option-item">
                          <img
                            src={imgSrc}
                            alt={`option ${index + 1}`}
                            className="option-image"
                          />
                          <p className="option-text">
                            {gameInfos[currentVideoIndex].options[index]}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          </Card>
        </div>

        {/* 오른쪽: 웹캠 및 상담가 화면 영역 */}
        <div className="ch-review-game-right">
          <div className="ch-game-face-screen">
            <Card className="ch-game-Top-section">
              <video
                ref={webcamRef}
                autoPlay
                muted
                style={{
                  backgroundColor: "#000",
                  width: "100%",
                  height: "300px",
                  marginTop: "4px",
                }}
              />
            </Card>
            <div className="ch-game-middle-section"></div>
            <div className="ch-game-bottom-section">
              <div className="ch-game-button-left">
                <img src="/child/button-left.png" alt="button-left" />
              </div>
              <Card className="ch-game-counselor-screen">
                <div className="review-message">
                  {phase === "video" ? null : phase === "analysis" ? (
                    <h3>표정 및 음성 분석 중입니다...</h3>
                  ) : phase === "analysisResult" ? (
                    <>
                      <h3>표정 분석 결과: {faceResult}</h3>
                      <h3>음성 인식 결과: {voiceResult}</h3>
                    </>
                  ) : null}
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
