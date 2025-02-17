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
// 기존 ChildVideoScreen 대신 일반 <video> 태그로 대체
// import ChildVideoScreen from "../../components/OpenViduSession/ChildVideoScreen";
import CounselorCamWithChild from "../../components/OpenViduSession/CounselorCamWithChild";

function ChildReviewGamePage() {
  console.log("[ChildReviewGamePage] Component mounted");

  // 게임 동영상 관련 videoRef (왼쪽 게임영상)
  const videoRef = useRef(null);
  // 아동 웹캠 스트림용 ref (일반 웹캠 영상, OpenVidu 사용하지 않음)
  const childWebcamRef = useRef(null);
  // OpenVidu 화면 공유용 ref (아동이 화면 공유 시 송출)
  // (화면 공유 스트림은 화면 공유 버튼 클릭 시 생성)
  const [screenSubscriber, setScreenSubscriber] = useState(null);

  // OpenVidu 세션 및 관련 상태 (오직 화면 공유용)
  const [session, setSession] = useState(null);
  // (아동의 웹캠은 일반 스트림으로 처리하므로 publisher 상태는 제거)
  // const [publisher, setPublisher] = useState(null);

  // 기타 게임 및 분석 관련 상태들
  const webcamRef = useRef(null); // face-api 분석용 (필요 시 사용)
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

  // OpenVidu 객체
  const OV = useRef(new OpenVidu());

  // --- 0. 오픈비두 토큰 받기 ---
  async function getToken() {
    try {
      const response = await api.post("/session/join", {
        type: "game",
        childId,
      });
      console.log("토큰!:", response.data);
      return response.data;
    } catch (error) {
      console.error("토큰 요청 실패:", error);
      throw error;
    }
  }

  // --- 1. OpenVidu 세션 초기화 ---
  // 여기서는 화면 공유 기능에만 사용할 세션을 연결합니다.
  const initializeSession = useCallback(async () => {
    try {
      const sessionInstance = OV.current.initSession();

      // 화면 공유 스트림만 구독하도록 처리
      sessionInstance.on("streamCreated", (event) => {
        const videoSource = (event.stream.videoSource || "").toLowerCase();
        console.log("[ChildReviewGamePage] streamCreated 이벤트:", event);
        if (videoSource === "screen") {
          // 화면 공유 스트림만 구독 (아동 측에서는 화면 공유를 렌더링하지 않으므로 주석 처리 가능)
          // 하지만 상담사에서는 이 스트림을 구독하게 됩니다.
          // 여기서는 로그로만 남깁니다.
          console.log("[ChildReviewGamePage] 화면 공유 스트림 감지:", event.stream.streamId);
        }
      });

      sessionInstance.on("streamDestroyed", (event) => {
        console.log("[ChildReviewGamePage] streamDestroyed:", event);
        // 화면 공유 스트림이 종료되면 상태 초기화
        setScreenSubscriber(null);
      });

      const token = await getToken();
      await sessionInstance.connect(token);
      setSession(sessionInstance);

      // **중요**: 아동의 웹캠 영상은 OpenVidu를 통해 publish하지 않습니다.
      // 따라서 여기서는 publish 코드를 제거합니다.
      // 화면 공유는 별도 startScreenShare 함수에서 처리됩니다.
    } catch (error) {
      console.error("세션 초기화 오류:", error);
    }
  }, []);

  // --- 2. 화면 공유 시작 함수 ---
  const createScreenShareStream = async () => {
    try {
      console.log("1. 화면 공유 시작 시도...");
      if (screenSubscriber) {
        console.log("📌 이미 화면 공유 중입니다.");
        return;
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const newScreenPublisher = OV.current.initPublisher(undefined, {
        videoSource: "screen",
        audioSource: true,
        publishVideo: true,
        mirror: false,
      });

      await session.publish(newScreenPublisher);
      setScreenSubscriber(newScreenPublisher);

      newScreenPublisher.stream.getVideoTracks()[0].addEventListener("ended", () => {
        console.log("사용자가 화면 공유를 중단함");
        session.unpublish(newScreenPublisher);
        setScreenSubscriber(null);
      });
    } catch (error) {
      console.error("❌ 화면 공유 중 오류:", error);
      setScreenSubscriber(null);
    }
  };

  const startScreenShare = async () => {
    await createScreenShareStream();
  };

  // --- 3. 컴포넌트 마운트 시 OpenVidu 세션 초기화 ---
  useEffect(() => {
    initializeSession();
    return () => {
      if (session) session.disconnect();
    };
  }, [initializeSession]);

  // --- 4. 아동 일반 웹캠 스트림 시작 (OpenVidu 사용하지 않음) ---
  useEffect(() => {
    const startChildWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("[startChildWebcam] 웹캠 스트림 획득:", stream);
        if (childWebcamRef.current) {
          childWebcamRef.current.srcObject = stream;
          childWebcamRef.current.play();
          console.log("[startChildWebcam] 웹캠 비디오 재생 시작");
        }
      } catch (err) {
        console.error("[startChildWebcam] 웹캠 시작 실패:", err);
      }
    };
    startChildWebcam();
  }, []);

  // --- 기존 API 호출, face-api 모델 로드, 분석 관련 useEffect 등 ---
  useEffect(() => {
    const fetchLimitData = async () => {
      console.log("[fetchLimitData] 호출됨 - childId:", childId);
      try {
        const data = await limitGamedata(childId);
        console.log("[fetchLimitData] API 호출 결과:", data);
        setGameIdData("가져온 정보", data);
        if (data) {
          await useGameStore.getState().fetchChapterData(data.chapter);
          setChapterAndStage(data.chapter, data.stage);
          const currentState = useGameStore.getState();
          console.log("[fetchLimitData] 현재 게임 상태:", currentState);
          setGameState(currentState);
        }
        const gameData = useGameStore.getState().getCurrentGameData();
        console.log("[fetchLimitData] 현재 게임 데이터:", gameData);
        setCurrentGameData(gameData);
      } catch (error) {
        console.error("[fetchLimitData] 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
        console.log("[fetchLimitData] 로딩 완료 - isLoading:", false);
      }
    };
    fetchLimitData();
  }, [childId]);

  useEffect(() => {
    if (currentGameData) {
      console.log("[useEffect - currentGameData] 업데이트된 currentGameData:", currentGameData);
    }
  }, [currentGameData]);

  useEffect(() => {
    const loadModels = async () => {
      console.log("[loadModels] 호출됨 - face-api 모델 로드 시작");
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      console.log("[loadModels] face-api 모델 로드 완료");
    };
    loadModels();
  }, []);

  useEffect(() => {
    const startWebcamForAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          webcamRef.current.play();
        }
      } catch (err) {
        console.error("[startWebcamForAnalysis] 웹캠 시작 실패:", err);
      }
    };
    startWebcamForAnalysis();
  }, []);

  useEffect(() => {
    console.log("[useEffect - 시작 모달] 호출됨 - 시작 버튼 모달 실행");
    Swal.fire({
      title: "감정아! 같이 공부해 볼까?",
      imageUrl: "/child/character/againCh.png",
      imageWidth: 200,
      imageHeight: 200,
      showConfirmButton: true,
    }).then((result) => {
      console.log("[useEffect - 시작 모달] Swal 결과:", result);
      if (result.isConfirmed) {
        setShowContent(true);
      }
    });
  }, []);

  useEffect(() => {
    if (phase === "video" && currentGameData && videoRef.current && showContent) {
      videoRef.current.play()
          .then(() => console.log("새 단원 동영상 자동 재생됨"))
          .catch((error) => console.error("자동 재생 실패:", error));
    }
  }, [phase, currentGameData, showContent]);

  // 이하 분석 관련 코드(동시 분석, 표정 분석, 음성 분석) 기존 코드 유지
  const handleVideoEnd = () => {
    console.log("[handleVideoEnd] 호출됨 - 비디오 종료, phase 변경 -> analysisModal");
    setPhase("analysisModal");
  };

  const computeAverageEmotion = (data) => {
    console.log("[computeAverageEmotion] 호출됨 - 감정 데이터 평균 계산 시작");
    let sum = { neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 };
    let count = 0;
    data.forEach((item, dataIndex) => {
      item.emotions.forEach((emotionObj, emotionIndex) => {
        Object.keys(sum).forEach((key) => {
          sum[key] += emotionObj[key] || 0;
        });
        count++;
      });
    });
    if (count === 0) {
      console.log("[computeAverageEmotion] 감지된 데이터가 없음");
      return null;
    }
    let avg = {};
    Object.keys(sum).forEach((key) => {
      avg[key] = sum[key] / count;
    });
    console.log("[computeAverageEmotion] 계산된 평균 감정:", avg);
    return avg;
  };

  const runConcurrentAnalysis = async () => {
    console.log("[runConcurrentAnalysis] 호출됨 - 동시 분석 시작 (표정+음성)");
    const facePromise = new Promise((resolve) => {
      console.log("[facePromise] 표정 분석 시작: 9초간 분석 시작");
      analysisDataRef.current = [];
      const intervalId = setInterval(async () => {
        if (webcamRef.current) {
          const detections = await faceapi
              .detectAllFaces(webcamRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
          console.log("[facePromise] 감지 결과:", detections);
          if (detections.length > 0) {
            const emotions = detections.map((det) => det.expressions);
            analysisDataRef.current.push({ timestamp: new Date().toISOString(), emotions });
            console.log("[facePromise] 현재 분석 데이터:", analysisDataRef.current);
          }
        }
      }, 100);
      analysisIntervalRef.current = intervalId;
      setTimeout(() => {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
        console.log("[facePromise] 9초 분석 종료, 분석 데이터:", analysisDataRef.current);
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
        console.log("[facePromise] 분석 결과 메시지:", resultMsg);
        resolve(resultMsg);
      }, 9000);
    });

    const voicePromise = new Promise((resolve, reject) => {
      console.log("[voicePromise] 음성 인식 시작");
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        console.error("[voicePromise] 이 브라우저는 Speech Recognition을 지원하지 않습니다.");
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
        console.log("[voicePromise] 음성 인식 시간 초과, 종료됨");
        resolve("음성 인식 시간이 초과되었습니다.");
      }, 9000);
      recognition.onresult = (event) => {
        clearTimeout(voiceTimeout);
        console.log("[voicePromise] 음성 인식 결과 이벤트:", event);
        let finalResult = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalResult += event.results[i][0].transcript;
          }
        }
        console.log("[voicePromise] 최종 음성 결과:", finalResult);
        const optionsArray = currentGameData.options;
        const bestMatch = stringSimilarity.findBestMatch(finalResult, optionsArray);
        const bestOptionIndex = bestMatch.bestMatchIndex;
        const voiceMsg =
            bestOptionIndex === currentGameData.answer - 1
                ? `정답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`
                : `오답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`;
        console.log("[voicePromise] 음성 분석 결과 메시지:", voiceMsg);
        resolve(voiceMsg);
      };
      recognition.onerror = (event) => {
        clearTimeout(voiceTimeout);
        console.error("[voicePromise] 음성 인식 오류:", event.error);
        resolve("음성 인식 실패");
      };
      recognition.start();
      console.log("[voicePromise] 음성 인식 시작됨");
    });

    try {
      const [faceMsg, voiceMsg] = await Promise.all([facePromise, voicePromise]);
      console.log("[runConcurrentAnalysis] 동시 분석 완료 - faceMsg:", faceMsg, ", voiceMsg:", voiceMsg);
      setFaceResult(faceMsg);
      setVoiceResult(voiceMsg);
      setPhase("analysisResult");
      console.log("[runConcurrentAnalysis] phase 변경 -> analysisResult");
    } catch (error) {
      console.error("[runConcurrentAnalysis] 동시 분석 오류:", error);
    }
  };

  const runFaceAnalysis = async () => {
    console.log("[runFaceAnalysis] 호출됨 - 얼굴 분석 시작 (표정 연습)");
    const faceMsg = await new Promise((resolve) => {
      console.log("[faceAnalysis] 표정 분석 시작: 9초간 분석 시작");
      analysisDataRef.current = [];
      const intervalId = setInterval(async () => {
        if (webcamRef.current) {
          const detections = await faceapi
              .detectAllFaces(webcamRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
          console.log("[faceAnalysis] 감지 결과:", detections);
          if (detections.length > 0) {
            const emotions = detections.map((det) => det.expressions);
            analysisDataRef.current.push({
              timestamp: new Date().toISOString(),
              emotions,
            });
            console.log("[faceAnalysis] 현재 분석 데이터:", analysisDataRef.current);
          }
        }
      }, 100);
      analysisIntervalRef.current = intervalId;
      setTimeout(() => {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
        console.log("[faceAnalysis] 9초 분석 종료, 분석 데이터:", analysisDataRef.current);
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
        console.log("[faceAnalysis] 분석 결과 메시지:", resultMsg);
        resolve(resultMsg);
      }, 5000);
    });
    setFaceResult(faceMsg);
    setPhase("analysisResult");
    console.log("[runFaceAnalysis] 얼굴 분석 완료, faceResult:", faceMsg);
  };

  const runVoiceAnalysis = async () => {
    console.log("[runVoiceAnalysis] 호출됨 - 음성 분석 시작 (말 연습)");
    const voiceMsg = await new Promise((resolve, reject) => {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        console.error("[runVoiceAnalysis] 이 브라우저는 Speech Recognition을 지원하지 않습니다.");
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
        console.log("[runVoiceAnalysis] 음성 인식 시간 초과, 종료됨");
        resolve("음성 인식 시간이 초과되었습니다.");
      }, 5000);
      recognition.onresult = (event) => {
        clearTimeout(voiceTimeout);
        console.log("[runVoiceAnalysis] 음성 인식 결과 이벤트:", event);
        let finalResult = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalResult += event.results[i][0].transcript;
          }
        }
        console.log("[runVoiceAnalysis] 최종 음성 결과:", finalResult);
        const optionsArray = currentGameData.options;
        const bestMatch = stringSimilarity.findBestMatch(finalResult, optionsArray);
        const bestOptionIndex = bestMatch.bestMatchIndex;
        const resultMsg =
            bestOptionIndex === currentGameData.answer - 1
                ? `정답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`
                : `오답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`;
        console.log("[runVoiceAnalysis] 음성 분석 결과 메시지:", resultMsg);
        resolve(resultMsg);
      };
      recognition.onerror = (event) => {
        clearTimeout(voiceTimeout);
        console.error("[runVoiceAnalysis] 음성 인식 오류:", event.error);
        resolve("음성 인식 실패");
      };
      recognition.start();
      console.log("[runVoiceAnalysis] 음성 인식 시작됨");
    });
    setVoiceResult(voiceMsg);
    setPhase("analysisResult");
    console.log("[runVoiceAnalysis] 음성 분석 완료, voiceResult:", voiceMsg);
  };

  useEffect(() => {
    if (phase === "analysisResult") {
      console.log("[useEffect - analysisResult] phase:", phase, "analysisCycle:", analysisCycle);
      if (analysisCycle === 1 || analysisCycle === 2) {
        Swal.fire({
          title: `분석 결과예요!`,
          html: `
            <p>표정 분석: ${faceResult}</p>
            <p>음성 인식: ${voiceResult}</p>
          `,
          imageUrl: "/child/character/againCh.png",
          imageWidth: 200,
          imageHeight: 200,
          showConfirmButton: true,
          confirmButtonText: "다음으로"
        }).then((result) => {
          console.log("[useEffect - analysisResult] concurrent analysis modal result:", result);
          if (result.isConfirmed) {
            if (analysisCycle === 1) {
              if (faceResult.includes("정답") && voiceResult.includes("정답")) {
                Swal.fire({
                  title: "이제 표정 연습을 해볼까요?",
                  text: "거울을 보면서 천천히 따라해보세요!",
                  imageUrl: "/child/character/againCh.png",
                  imageWidth: 200,
                  imageHeight: 200,
                  timer: 3000,
                  showConfirmButton: false
                }).then(() => {
                  console.log("[useEffect - analysisResult] 표정 연습 모달 완료, cycle 변경 -> 3");
                  setAnalysisCycle(3);
                  setFaceResult(null);
                  setVoiceResult(null);
                  setPhase("analysisModal");
                });
              } else {
                Swal.fire({
                  title: "한 번 더 연습해볼까요?",
                  text: "다시 한 번 표정과 말을 해보세요!",
                  imageUrl: "/child/character/againCh.png",
                  imageWidth: 200,
                  imageHeight: 200,
                  timer: 3000,
                  showConfirmButton: false
                }).then(() => {
                  console.log("[useEffect - analysisResult] 다시 연습 모달 완료, cycle 변경 -> 2");
                  setAnalysisCycle(2);
                  setFaceResult(null);
                  setVoiceResult(null);
                  setPhase("analysisModal");
                });
              }
            } else if (analysisCycle === 2) {
              Swal.fire({
                title: "이제 표정 연습을 해볼까요?",
                text: "거울을 보면서 천천히 따라해보세요!",
                imageUrl: "/child/character/againCh.png",
                imageWidth: 200,
                imageHeight: 200,
                timer: 3000,
                showConfirmButton: false
              }).then(() => {
                console.log("[useEffect - analysisResult] 두 번째 분석 후 표정 연습, cycle 변경 -> 3");
                setAnalysisCycle(3);
                setFaceResult(null);
                setVoiceResult(null);
                setPhase("analysisModal");
              });
            }
          }
        });
      } else if (analysisCycle === 3) {
        Swal.fire({
          title: "표정 분석 결과",
          html: `<p>${faceResult}</p>`,
          imageUrl: "/child/character/againCh.png",
          imageWidth: 200,
          imageHeight: 200,
          timer: 3000,
          showConfirmButton: false
        }).then(() => {
          console.log("[useEffect - analysisResult] face analysis modal 자동 종료");
          Swal.fire({
            title: "이제 말 연습을 해볼까요?",
            text: "아래 글자를 천천히 따라해보세요!",
            imageUrl: "/child/character/againCh.png",
            imageWidth: 200,
            imageHeight: 200,
            timer: 3000,
            showConfirmButton: false
          }).then(() => {
            console.log("[useEffect - analysisResult] voice practice 시작");
            setAnalysisCycle(4);
            setFaceResult(null);
            setPhase("analysisModal");
          });
        });
      } else if (analysisCycle === 4) {
        Swal.fire({
          title: "다시 연습해볼까요?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "연습 다시하기",
          cancelButtonText: "다음으로",
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            console.log("[useEffect - analysisResult] '다시하기' 선택됨");
            setAnalysisCycle(3);
            setFaceResult(null);
            setVoiceResult(null);
            setPhase("analysisModal");
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log("[useEffect - analysisResult] '다음으로 넘어가기' 선택됨");
            Swal.fire({
              html: `
                <style>
                  .flip-card {
                    perspective: 1000px;
                    width: 200px;
                    height: 300px;
                    margin: 0 auto;
                  }
                  .flip-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    transition: transform 0.6s;
                    transform-style: preserve-3d;
                  }
                  .flip-card-front, .flip-card-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                  }
                  .flip-card-back {
                    transform: rotateY(180deg);
                  }
                </style>
                <div class="flip-card">
                  <div class="flip-card-inner">
                    <div class="flip-card-front">
                      <img src="${currentGameData.cardFront}" alt="card front" style="width: 200px; height: 300px; object-fit: contain;" />
                    </div>
                    <div class="flip-card-back">
                      <img src="${currentGameData.cardBack}" alt="card back" style="width: 200px; height: 300px; object-fit: contain;" />
                    </div>
                  </div>
                </div>
              `,
              showConfirmButton: false,
              timer: 2000,
              didOpen: () => {
                setTimeout(() => {
                  const card = document.querySelector(".flip-card-inner");
                  card.style.transform = "rotateY(180deg)";
                }, 4000);
              }
            }).then(() => {
              if (currentGameData.gameStageId === 5) {
                Swal.fire({
                  title: "정말 잘했어요!",
                  text: "모든 단원을 완료했어요!",
                  imageUrl: "/child/character/againCh.png",
                  imageWidth: 200,
                  imageHeight: 200,
                  showConfirmButton: true,
                });
              } else {
                Swal.fire({
                  title: "정말 잘했어요!",
                  text: "다음 단원으로 이동할까요?",
                  imageUrl: "/child/character/againCh.png",
                  imageWidth: 200,
                  imageHeight: 200,
                  timer: 3000,
                  showConfirmButton: false,
                }).then(async () => {
                  console.log("[useEffect - analysisResult] NextChapter 호출 (자동)");
                  await NextChapter();
                  console.log("[useEffect - analysisResult] NextChapter 완료, cycle 초기화");
                  setAnalysisCycle(1);
                  setFaceResult(null);
                  setVoiceResult(null);
                  setPhase("video");
                });
              }
            });
          }
        });
      }
    }
  }, [phase, analysisCycle, faceResult, voiceResult, currentGameData?.gameStageId]);

  const StopVideo = () => {
    console.log("[StopVideo] 호출됨 - 비디오 재생/정지 토글 및 분석 중지");
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        console.log("[StopVideo] 비디오 정지");
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        console.log("[StopVideo] 비디오 재생");
      }
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
      console.log("[StopVideo] 진행 중인 분석 인터벌 중지");
    }
  };

  const NextChapter = async () => {
    console.log("[NextChapter] 호출됨 - 다음 단원으로 이동");
    const nextStageId = currentGameData.gameStageId + 1;
    console.log("[NextChapter] 현재 단원:", currentGameData.gameStageId, "다음 단원:", nextStageId);
    if (nextStageId > 5) {
      Swal.fire({
        title: `${currentGameData.chapterId}단계 마지막이에요!`,
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        confirmButtonText: "확인"
      });
      console.log("[NextChapter] 마지막 단원 도달 - 이동 불가");
      return;
    }
    setChapterAndStage(currentGameData.chapterId, nextStageId);
    console.log("[NextChapter] 단원 설정 업데이트:", currentGameData.chapterId, nextStageId);
    const gameData = await useGameStore.getState().getCurrentGameData();
    console.log("[NextChapter] 업데이트된 게임 데이터:", gameData);
    setCurrentGameData(gameData);
    setPhase("video");
    setAnalysisCycle(1);
    setIsPlaying(false);
  };

  const PrevChapter = async () => {
    console.log("[PrevChapter] 호출됨 - 이전 단원으로 이동");
    const prevStageId = currentGameData.gameStageId - 1;
    console.log("[PrevChapter] 현재 단원:", currentGameData.gameStageId, "이전 단원:", prevStageId);
    if (prevStageId > 0) {
      setChapterAndStage(currentGameData.chapterId, prevStageId);
      console.log("[PrevChapter] 단원 설정 업데이트:", currentGameData.chapterId, prevStageId);
    }
    const gameData = await useGameStore.getState().getCurrentGameData();
    console.log("[PrevChapter] 업데이트된 게임 데이터:", gameData);
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
                    {currentGameData?.chapterId ?? ""}단계 {currentGameData?.gameStageId ?? ""}단원
                  </h2>
                  <h3>{currentGameData?.situation ?? ""}</h3>
                  <video
                      ref={videoRef}
                      src={currentGameData?.gameVideo ?? ""}
                      onEnded={handleVideoEnd}
                      className="ch-gameVideo"
                  />
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
                    {currentGameData?.optionImages?.length > 0 &&
                    currentGameData?.options?.length > 0 ? (
                        <div className="option-images">
                          {currentGameData.optionImages.map((imgSrc, index) => (
                              <div key={index} className="learning-option-item">
                                <img src={imgSrc} alt={`option ${index + 1}`} className="option-image" />
                                <p className={`${
                                    analysisCycle < 3
                                        ? index + 1 === currentGameData?.answer ? "ch-learning-before-answer" : ""
                                        : index + 1 === currentGameData?.answer ? "ch-learning-correct-answer" : ""
                                }`}>
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

        {/* 오른쪽: 아동 웹캠 및 상담사 화면 영역 */}
        <div className="ch-review-game-right">
          <div className="ch-game-face-screen">
            <Card className="ch-game-Top-section">
              {/* 아동 웹캠 영상: 일반 웹캠으로 getUserMedia 사용 */}
              <video ref={childWebcamRef} autoPlay muted style={{ width: "100%" }} />
            </Card>
            <div className="ch-learning-middle-section"></div>
            <div className="ch-learning-bottom-section">
              <div className="ch-learning-button-left">
                <img src="/child/button-left.png" alt="button-left" onClick={PrevChapter} />
                <p> 이전 단원</p>
              </div>
              {/* 오른쪽: 상담사 화면 영역 (화면 공유 스트림은 상담사 페이지에서 구독됨) */}
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
