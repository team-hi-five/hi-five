import "./ChildCss/ChildClassPage.css";
import useGameStore from "../../store/gameStore";
import { limitGamedata } from "../../api/childGameContent";
import { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "primereact/card";
import * as faceapi from "face-api.js";
import stringSimilarity from "string-similarity";
import Swal from "sweetalert2";
import { BsStopBtnFill } from "react-icons/bs";
import { OpenVidu } from "openvidu-browser";
import api from "../../api/api";
import ChildVideoScreen from "../../components/OpenViduSession/ChildVideoScreen";
import CounselorCamWithChild from "../../components/OpenViduSession/CounselorCamWithChild";

function ChildReviewGamePage() {
  console.log("[ChildReviewGamePage] Component mounted");

  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const analysisDataRef = useRef([]);

  const childId = sessionStorage.getItem("childId");
  const { setChapterAndStage, getCurrentGameData } = useGameStore();
  const [gameState, setGameState] = useState(null);
  const [gameIdData, setGameIdData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGameData, setCurrentGameData] = useState(null);
  const [phase, setPhase] = useState("video");
  const [showContent, setShowContent] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [faceResult, setFaceResult] = useState(null);
  const [voiceResult, setVoiceResult] = useState(null);
  const [analysisCycle, setAnalysisCycle] = useState(1);

  // OpenVidu 상태
  const [session, setSession] = useState(null);
  const [subscriber, setSubscriber] = useState([]);
  const [publisher, setPublisher] = useState(null); // 웹캠 퍼블리셔
  const [screenSubscriber, setScreenSubscriber] = useState(null); // 화면 공유 퍼블리셔의 스트림 구독 (상담사 쪽에서 사용)
  const OV = useRef(new OpenVidu());

  async function getToken() {
    try {
      const response = await api.post("/session/join", { type: "game", childId });
      console.log("토큰!:", response.data);
      return response.data;
    } catch (error) {
      console.error("토큰 요청 실패:", error);
      throw error;
    }
  }

  // [수정] 초기 퍼블리셔 생성 시 videoSource 옵션을 제거하여 기본 웹캠 영상으로 생성합니다.
  const initializeSession = useCallback(async () => {
    try {
      const sessionInstance = OV.current.initSession();

      sessionInstance.on("streamCreated", (event) => {
        const videoType = (event.stream.videoType || "").toLowerCase();
        const typeOfVideo = event.stream.typeOfVideo;
        // 화면 공유 스트림은 ChildReviewGamePage에서는 렌더링하지 않습니다.
        if (videoType === "screen" || typeOfVideo === "SCREEN") {
          console.log("화면 공유 스트림이 publish됨:", event);
        } else if (event.stream.typeOfVideo === "CAMERA") {
          try {
            const sub = sessionInstance.subscribe(event.stream, undefined);
            setSubscriber(sub);
          } catch (error) {
            console.error("스트림 구독 중 오류:", error);
          }
        }
      });

      sessionInstance.on("streamDestroyed", (event) => {
        setSubscriber(null);
      });

      const token = await getToken();
      await sessionInstance.connect(token);

      // [수정] 화면 공유용이 아니라 기본 웹캠 영상으로 퍼블리셔 생성
      const webcamPub = OV.current.initPublisher(undefined, {
        publishAudio: true,
        publishVideo: true,
        mirror: true,
      });
      await sessionInstance.publish(webcamPub);
      setSession(sessionInstance);
      setPublisher(webcamPub);
    } catch (error) {
      console.error("세션 초기화 오류:", error);
    }
  }, []);

  // 화면 공유 시작: 별도의 화면 공유 퍼블리셔 생성 (이 부분은 그대로 유지)
  const createScreenShareStream = async () => {
    try {
      console.log("1. 화면 공유 시작 시도...");
      if (screenSubscriber) {
        console.log("이미 화면 공유 중입니다.");
        return;
      }
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const screenPub = OV.current.initPublisher(undefined, {
        videoSource: "screen",
        audioSource: true,
        publishVideo: true,
        mirror: false,
      });
      await session.publish(screenPub);
      setScreenSubscriber(screenPub);
      screenPub.stream.getVideoTracks()[0].addEventListener("ended", () => {
        console.log("사용자가 화면 공유를 중단함");
        session.unpublish(screenPub);
        setScreenSubscriber(null);
      });
    } catch (error) {
      console.error("화면 공유 중 오류:", error);
      setScreenSubscriber(null);
    }
  };

  const startScreenShare = async () => {
    await createScreenShareStream();
  };

  useEffect(() => {
    initializeSession();
    return () => {
      if (session) session.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchLimitData = async () => {
      try {
        const data = await limitGamedata(childId);
        console.log("API 호출 결과:", data);
        setGameIdData("가져온 정보", data);
        if (data) {
          await useGameStore.getState().fetchChapterData(data.chapter);
          setChapterAndStage(data.chapter, data.stage);
          const currentState = useGameStore.getState();
          setGameState(currentState);
        }
        const gameData = useGameStore.getState().getCurrentGameData();
        setCurrentGameData(gameData);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLimitData();
  }, [childId]);

  useEffect(() => {
    if (currentGameData) {
      console.log("현재 게임 데이터 업데이트:", currentGameData);
    }
  }, [currentGameData]);

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

  useEffect(() => {
    Swal.fire({
      title: "감정아! 같이 공부해 볼까?",
      imageUrl: "/child/character/againCh.png",
      imageWidth: 200,
      imageHeight: 200,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setShowContent(true);
      }
    });
  }, []);

  useEffect(() => {
    if (phase === "video" && currentGameData && videoRef.current && showContent) {
      videoRef.current.play().catch((error) => {
        console.error("자동 재생 실패:", error);
      });
    }
  }, [phase, currentGameData, showContent]);

  useEffect(() => {
    if (phase === "analysisModal") {
      if (analysisCycle === 1 || analysisCycle === 2) {
        setPhase("analysis");
        runConcurrentAnalysis();
      } else if (analysisCycle === 3) {
        setPhase("analysis");
        runFaceAnalysis();
      } else if (analysisCycle === 4) {
        setPhase("analysis");
        runVoiceAnalysis();
      }
    }
  }, [phase, analysisCycle]);

  const handleVideoEnd = () => {
    setPhase("analysisModal");
  };

  const computeAverageEmotion = (data) => {
    let sum = { neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 };
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

  const runConcurrentAnalysis = async () => {
    const facePromise = new Promise((resolve) => {
      analysisDataRef.current = [];
      const intervalId = setInterval(async () => {
        if (webcamRef.current) {
          const detections = await faceapi
              .detectAllFaces(webcamRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
          if (detections.length > 0) {
            const emotions = detections.map((det) => det.expressions);
            analysisDataRef.current.push({ timestamp: new Date().toISOString(), emotions });
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
        const candidates = ["happy", "sad", "angry", "fearful", "surprised"];
        const candidateAverages = candidates.map((emotion) => ({
          emotion,
          value: avgEmotion[emotion] || 0,
        }));
        candidateAverages.sort((a, b) => b.value - a.value);
        const bestEmotion = candidateAverages[0].emotion;
        const expectedEmotions = ["happy", "sad", "angry", "fearful", "surprised"];
        const expectedEmotion = expectedEmotions[currentVideoIndex] || "없음";
        const resultMsg =
            bestEmotion === expectedEmotion
                ? `정답입니다! 표정 분석 결과: ${bestEmotion}`
                : `오답입니다! 표정 분석 결과: ${bestEmotion} (예상: ${expectedEmotion})`;
        resolve(resultMsg);
      }, 9000);
    });

    const voicePromise = new Promise((resolve, reject) => {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        reject("이 브라우저는 Speech Recognition을 지원하지 않습니다.");
        return;
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.continuous = false;
      const voiceTimeout = setTimeout(() => {
        recognition.abort();
        resolve("음성 인식 시간이 초과되었습니다.");
      }, 9000);
      recognition.onresult = (event) => {
        clearTimeout(voiceTimeout);
        let finalResult = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalResult += event.results[i][0].transcript;
          }
        }
        const optionsArray = currentGameData.options;
        const bestMatch = stringSimilarity.findBestMatch(finalResult, optionsArray);
        const bestOptionIndex = bestMatch.bestMatchIndex;
        const voiceMsg =
            bestOptionIndex === currentGameData.answer - 1
                ? `정답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`
                : `오답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`;
        resolve(voiceMsg);
      };
      recognition.onerror = (event) => {
        clearTimeout(voiceTimeout);
        resolve("음성 인식 실패");
      };
      recognition.start();
    });

    try {
      const [faceMsg, voiceMsg] = await Promise.all([facePromise, voicePromise]);
      setFaceResult(faceMsg);
      setVoiceResult(voiceMsg);
      setPhase("analysisResult");
    } catch (error) {
      console.error("동시 분석 오류:", error);
    }
  };

  const runFaceAnalysis = async () => {
    const faceMsg = await new Promise((resolve) => {
      analysisDataRef.current = [];
      const intervalId = setInterval(async () => {
        if (webcamRef.current) {
          const detections = await faceapi
              .detectAllFaces(webcamRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
          if (detections.length > 0) {
            const emotions = detections.map((det) => det.expressions);
            analysisDataRef.current.push({ timestamp: new Date().toISOString(), emotions });
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
        const candidates = ["happy", "sad", "angry", "fearful", "surprised"];
        const candidateAverages = candidates.map((emotion) => ({
          emotion,
          value: avgEmotion[emotion] || 0,
        }));
        candidateAverages.sort((a, b) => b.value - a.value);
        const bestEmotion = candidateAverages[0].emotion;
        const expectedEmotions = ["happy", "sad", "angry", "fearful", "surprised"];
        const expectedEmotion = expectedEmotions[currentVideoIndex] || "없음";
        const resultMsg =
            bestEmotion === expectedEmotion
                ? `정답입니다! 표정 분석 결과: ${bestEmotion}`
                : `오답입니다! 표정 분석 결과: ${bestEmotion} (예상: ${expectedEmotion})`;
        resolve(resultMsg);
      }, 5000);
    });
    setFaceResult(faceMsg);
    setPhase("analysisResult");
  };

  const runVoiceAnalysis = async () => {
    const voiceMsg = await new Promise((resolve, reject) => {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        reject("이 브라우저는 Speech Recognition을 지원하지 않습니다.");
        return;
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.continuous = false;
      const voiceTimeout = setTimeout(() => {
        recognition.abort();
        resolve("음성 인식 시간이 초과되었습니다.");
      }, 9000);
      recognition.onresult = (event) => {
        clearTimeout(voiceTimeout);
        let finalResult = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalResult += event.results[i][0].transcript;
          }
        }
        const optionsArray = currentGameData.options;
        const bestMatch = stringSimilarity.findBestMatch(finalResult, optionsArray);
        const bestOptionIndex = bestMatch.bestMatchIndex;
        const resultMsg =
            bestOptionIndex === currentGameData.answer - 1
                ? `정답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`
                : `오답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`;
        resolve(resultMsg);
      };
      recognition.onerror = (event) => {
        clearTimeout(voiceTimeout);
        resolve("음성 인식 실패");
      };
      recognition.start();
    });
    setVoiceResult(voiceMsg);
    setPhase("analysisResult");
  };

  // 자동으로 화면 공유 시작 (한 번만 실행)
  const autoScreenShareStarted = useRef(false);
  useEffect(() => {
    if (session && !screenSubscriber && !autoScreenShareStarted.current) {
      autoScreenShareStarted.current = true;
      startScreenShare();
    }
  }, [session, screenSubscriber]);

  const StopVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  const NextChapter = async () => {
    const nextStageId = currentGameData.gameStageId + 1;
    if (nextStageId > 5) {
      Swal.fire({
        title: `${currentGameData.chapterId}단계 마지막이에요!`,
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        confirmButtonText: "확인"
      });
      return;
    }
    setChapterAndStage(currentGameData.chapterId, nextStageId);
    const gameData = await useGameStore.getState().getCurrentGameData();
    setCurrentGameData(gameData);
    setPhase("video");
    setAnalysisCycle(1);
    setIsPlaying(false);
  };

  const PrevChapter = async () => {
    const prevStageId = currentGameData.gameStageId - 1;
    if (prevStageId > 0) {
      setChapterAndStage(currentGameData.chapterId, prevStageId);
    }
    const gameData = await useGameStore.getState().getCurrentGameData();
    setCurrentGameData(gameData);
    setPhase("video");
    setAnalysisCycle(1);
    setIsPlaying(false);
  };

  return (
      <div className="ch-review-container">
        {/* 왼쪽: 게임 동영상 영역 */}
        <div className="ch-review-game-left">
          <Card className="ch-game-screen-container">
            {currentGameData ? (
                <>
                  <h2>
                    {currentGameData?.chapterId ?? ""}단계{" "}
                    {currentGameData?.gameStageId ?? ""}단원
                  </h2>
                  <h3>{currentGameData?.situation ?? ""}</h3>
                  <video ref={videoRef} src={currentGameData?.gameVideo ?? ""} onEnded={handleVideoEnd} className="ch-gameVideo" />
                  <Card className="ch-learning-message-screen">
                    <div className="learning-message">
                      {phase === "analysis" && <h3>분석 중입니다...</h3>}
                      {phase === "analysisResult" &&
                          analysisCycle > 2 &&
                          analysisCycle !== 1 &&
                          analysisCycle !== 2 && (
                              <div>
                                {analysisCycle === 3 ? (
                                    <h3>표정 분석 결과: {faceResult}</h3>
                                ) : analysisCycle === 4 ? (
                                    <h3>음성 분석 결과: {voiceResult}</h3>
                                ) : null}
                              </div>
                          )}
                    </div>
                  </Card>
                  <div className="ch-game-button">
                    {currentGameData?.optionImages?.length > 0 && currentGameData?.options?.length > 0 ? (
                        <div className="option-images">
                          {currentGameData.optionImages.map((imgSrc, index) => (
                              <div key={index} className="learning-option-item">
                                <img src={imgSrc} alt={`option ${index + 1}`} className="option-image" />
                                <p className={`${analysisCycle < 3 ? index + 1 === currentGameData?.answer ? "ch-learning-before-answer" : "" : index + 1 === currentGameData?.answer ? "ch-learning-correct-answer" : ""}`}>
                                  {currentGameData.options[index]}
                                </p>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <p>선택지 정보를 불러오는 중...</p>
                    )}
                  </div>
                </>
            ) : (
                <h2>게임 데이터를 불러오는 중...</h2>
            )}
          </Card>
        </div>

        {/* 오른쪽: 웹캠 및 아동 화면 영역 */}
        <div className="ch-review-game-right">
          <div className="ch-game-face-screen">
            <Card className="ch-game-Top-section">
              <ChildVideoScreen publisher={publisher} session={session} videoRef={webcamRef} />
            </Card>
            <div className="ch-learning-middle-section"></div>
            <div className="ch-learning-bottom-section">
              <div className="ch-learning-button-left">
                <img src="/child/button-left.png" alt="button-left" onClick={PrevChapter} />
                <p> 이전 단원</p>
              </div>
              <Card className="ch-learning-counselor-screen">
                <CounselorCamWithChild session={session} subscriber={subscriber} mode="subscribe" />
              </Card>
              <div className="ch-learning-button-right">
                <img src="/child/button-right.png" alt="button-right" onClick={NextChapter} />
                <p>다음 단원</p>
                <BsStopBtnFill onClick={StopVideo} className="ch-learning-stop-icon" />
                <button onClick={startScreenShare} disabled={screenSubscriber !== null} className="game-screen-share-button">
                  {screenSubscriber ? "화면 공유 중" : "게임 화면 공유하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default ChildReviewGamePage;
