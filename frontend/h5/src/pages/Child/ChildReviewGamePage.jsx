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
  // "face1Modal": 표정 인식 전 모달 표시  
  // "face1": 표정 분석 1회 진행 중  
  // "face1Result": 표정 분석 1회 결과 표시  
  // "face2": 표정 분석 2회 진행 중  
  // "face2Result": 표정 분석 2회 결과 표시  
  // "voice1Modal": 음성 인식 전 모달 표시  
  // "voice1": 음성 인식 1회 진행 중  
  // "voice1Result": 음성 인식 1회 결과 표시  
  // "voice2": 음성 인식 2회 진행 중  
  // "voice2Result": 음성 인식 2회 결과 표시
  const [phase, setPhase] = useState("video");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // 표정 결과와 음성 결과 각각 저장
  const [faceResult1, setFaceResult1] = useState(null);
  const [faceResult2, setFaceResult2] = useState(null);
  const [voiceResult1, setVoiceResult1] = useState("");
  const [voiceResult2, setVoiceResult2] = useState("");

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

        console.log("게임 데이터 불러오기 성공", { data1, data2, data3, data4, data5 });

        // 하드코딩 sample 예시
        const sampleStageData = {
          options: ["사과", "바나나", "오렌지"],
          answer: 2 // DB 값이 2라면 실제 정답 인덱스는 2 - 1 = 1 (즉, "바나나")
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

  // 영상 종료 시 1초 후 "face1Modal" 단계로 전환
  const handleVideoEnded = () => {
    if (phase === "video") {
      setTimeout(() => {
        setPhase("face1Modal");
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

  // --- 모달: 표정 인식 전 ---
  useEffect(() => {
    if (phase === "face1Modal") {
      Swal.fire({
        title: "상황과 어울리는 표정을 지어볼까요~?",
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        setPhase("face1");
      });
    }
  }, [phase]);

  // --- 표정 인식 단계 (face1, face2) ---
  useEffect(() => {
    if (phase === "face1" || phase === "face2") {
      startAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

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

  const startAnalysis = async () => {
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
        console.log("face-api detections:", detections);
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
      stopAnalysis();
    }, 4000);
  };

  const stopAnalysis = () => {
    console.log("표정 분석 중지");
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    const avgEmotion = computeAverageEmotion(analysisDataRef.current);
    if (!avgEmotion) {
      console.error("수집된 감정 데이터가 없습니다.");
      return;
    }
    const candidates = ["happy", "sad", "angry", "fearful", "surprised"];
    const candidateAverages = candidates.map((emotion) => ({
      emotion,
      value: avgEmotion[emotion] || 0,
    }));
    candidateAverages.sort((a, b) => b.value - a.value);
    const bestEmotion = candidateAverages[0].emotion;

    // 예상 표정은 현재 비디오 순서에 따라 결정됩니다.
    // 예시: currentVideoIndex 0 → "happy", 1 → "sad", 2 → "angry", 3 → "fearful", 4 → "surprised"
    const expectedEmotions = ["happy", "sad", "angry", "fearful", "surprised"];
    const expectedEmotion = expectedEmotions[currentVideoIndex] || "없음";

    const resultMsg =
      bestEmotion === expectedEmotion
        ? `정답입니다! 표정 분석 결과: ${bestEmotion}`
        : `오답입니다! 표정 분석 결과: ${bestEmotion} (예상: ${expectedEmotion})`;

    if (phase === "face1") {
      setFaceResult1(resultMsg);
      const timeoutId = setTimeout(() => {
        setPhase("face1Result");
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (phase === "face2") {
      setFaceResult2(resultMsg);
      const timeoutId = setTimeout(() => {
        setPhase("face2Result");
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  // faceResult 단계: 결과 표시 후 2초 대기하고 다음 단계로 전환
  useEffect(() => {
    let timeoutId;
    if (phase === "face1Result") {
      timeoutId = setTimeout(() => {
        setPhase("face2");
      }, 2000);
    } else if (phase === "face2Result") {
      timeoutId = setTimeout(() => {
        setPhase("voice1Modal");
      }, 2000);
    }
    return () => clearTimeout(timeoutId);
  }, [phase]);

  // --- 모달: 음성 인식 전 ---
  useEffect(() => {
    if (phase === "voice1Modal") {
      Swal.fire({
        title: "상황과 어울리는 말을 해볼까요~?",
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        setPhase("voice1");
      });
    }
  }, [phase]);

  // --- 음성 인식 단계 (voice1, voice2) ---
  // 음성 인식을 1초 지연해서 시작하도록 함
  useEffect(() => {
    if (phase === "voice1" || phase === "voice2") {
      const timeoutId = setTimeout(() => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
          console.error("이 브라우저는 Speech Recognition을 지원하지 않습니다.");
          return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
          handleVoiceResult(finalResult);
        };
        recognition.onerror = (event) => {
          console.error("음성 인식 오류", event.error);
        };
        recognition.start();
        return () => {
          recognition.abort();
        };
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [phase]);

  const handleVoiceResult = (finalText) => {
    console.log("음성 인식 결과:", finalText);
    if (!stageData) return;
    const optionsArray = gameInfos[currentVideoIndex].options;
    const bestMatch = stringSimilarity.findBestMatch(finalText, optionsArray);
    const bestOptionIndex = bestMatch.bestMatchIndex;
    const voiceMsg =
      bestOptionIndex === gameInfos[currentVideoIndex].answer - 1
        ? `정답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`
        : `오답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`;
    if (phase === "voice1") {
      setVoiceResult1(voiceMsg);
      const timeoutId = setTimeout(() => {
        setPhase("voice1Result");
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (phase === "voice2") {
      setVoiceResult2(voiceMsg);
      const timeoutId = setTimeout(() => {
        setPhase("voice2Result");
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  // voiceResult 단계: 결과 표시 후 2초 대기하고 다음 단계로 전환 (voice2Result → video)
  useEffect(() => {
    let timeoutId;
    if (phase === "voice1Result") {
      timeoutId = setTimeout(() => {
        setPhase("voice2");
      }, 2000);
    } else if (phase === "voice2Result") {
      timeoutId = setTimeout(() => {
        // 다음 영상으로 전환
        setVoiceResult1("");
        setVoiceResult2("");
        setFaceResult1(null);
        setFaceResult2(null);
        setPhase("video");
        setCurrentVideoIndex((prev) =>
          prev < gameInfos.length - 1 ? prev + 1 : prev
        );
      }, 2000);
    }
    return () => clearTimeout(timeoutId);
  }, [phase, currentVideoIndex, gameInfos.length]);

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
            <ProgressBar value={(currentVideoIndex + 1) * 20} style={{ width: "80%", height: "15px", margin: "0 auto", marginTop: "20px" }} />

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
                  transform: "scaleX(-1)",
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
                  {phase === "video" ? null : 
                    phase === "face1" ? (
                      <h3>표정 분석 중입니다...</h3>
                    ) : phase === "face1Result" ? (
                      <h3>표정 분석 결과: {faceResult1}</h3>
                    ) : phase === "face2" ? (
                      <h3>표정 분석 중입니다...</h3>
                    ) : phase === "face2Result" ? (
                      <h3>표정 분석 결과: {faceResult2}</h3>
                    ) : phase === "voice1" ? (
                      <h3>음성 인식 중입니다...</h3>
                    ) : phase === "voice1Result" ? (
                      <h3>음성 인식 결과: {voiceResult1}</h3>
                    ) : phase === "voice2" ? (
                      <h3>음성 인식 중입니다...</h3>
                    ) : phase === "voice2Result" ? (
                      <h3>음성 인식 결과: {voiceResult2}</h3>
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
