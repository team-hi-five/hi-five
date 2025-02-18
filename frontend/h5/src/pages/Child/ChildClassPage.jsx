import "./ChildCss/ChildClassPage.css";
import useGameStore from "../../store/gameStore";
import { limitGamedata } from "../../api/childGameContent";
import { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "primereact/card";
import * as faceapi from "face-api.js";
import stringSimilarity from "string-similarity";
import Swal from "sweetalert2";
import { BsStopBtnFill } from "react-icons/bs";
import { OpenVidu } from 'openvidu-browser';
import api from "../../api/api";
import CounselorCamWithChild from "../../components/OpenViduSession/CounselorCamWithChild";
import Webcam from "react-webcam";
import {sendAlarm} from "../../api/alarm.jsx";

function ChildReviewGamePage() {
  console.log("[ChildReviewGamePage] Component mounted");

  // react-webcam의 ref (내부 video 엘리먼트는 ref.current.video)
  const webcamRef = useRef(null);
  // OpenVidu 관련 ref
  const videoRef = useRef(null);
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
  const [voiceRecognitionResult, setVoiceRecognitionResult] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [session, setSession] = useState(null);
  const [subscriber, setSubscriber] = useState([]);
  const [publisher, setPublisher] = useState(null);
  const [screenSubscriber, setscreenSubscriber] = useState(null);
  const OV = useRef(new OpenVidu());

  const [isStarted, setIsStarted] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const recognitionRef = useRef(null);
  const analysisCanceledRef = useRef(false)

  // --- 0. 오픈비두 토큰 받기 -------------------------
  async function getToken() {
    try {
      const response = await api.post('/session/join', {
        type: 'game',
        childId
      });
      console.log("토큰!:", response.data);
      return response.data;
    } catch (error) {
      console.error('토큰 요청 실패:', error);
      throw error;
    }
  }

  // --- 1. 세션 초기화 -------------------------
  const initializeSession = useCallback(async () => {
    try {
      const sessionInstance = OV.current.initSession();

      sessionInstance.on("streamCreated", (event) => {
        const subscriber = sessionInstance.subscribe(event.stream, undefined);
        setSubscriber(subscriber);
      });

      sessionInstance.on('streamDestroyed', (event) => {
        setSubscriber(null);  // null로 초기화
      });

      const token = await getToken();
      // 토큰을 통해 세션과 스트림구독을 연결
      await sessionInstance.connect(token);

      // 화면 공유 퍼블리셔 생성 (child는 화면 공유만 OpenVidu로 publish)
      const pub = OV.current.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: "screen",
        publishAudio: true,
        publishVideo: true,
        mirror: true,
      });

      await sessionInstance.publish(pub);
      setSession(sessionInstance);
      setPublisher(pub);
    } catch (error) {
      console.error('세션 초기화 오류:', error);
    }
  }, []);

  // --- 2. 화면 공유 시작 함수 -------------------------
  const createScreenShareStream = async () => {
    try {
      console.log('1. 화면 공유 시작 시도...');
      if (screenSubscriber) {
        console.log("이미 화면 공유 중입니다.");
        return;
      }
      const newScreenPublisher = OV.current.initPublisher(undefined, {
        videoSource: 'screen',
        audioSource: true,
        publishVideo: true,
        mirror: false,
      });
      await session.publish(newScreenPublisher);
      setscreenSubscriber(newScreenPublisher);

      newScreenPublisher.stream.getVideoTracks()[0].addEventListener("ended", () => {
        console.log("사용자가 화면 공유를 중단함");
        session.unpublish(newScreenPublisher);
        setscreenSubscriber(null);
      });
    } catch (error) {
      console.error("화면 공유 중 오류:", error);
      setscreenSubscriber(null);
    }
  };

  // 화면 공유 시작 함수
  const startScreenShare = async () => {
    await createScreenShareStream();
  };


  // --- 3. 컴포넌트 마운트 시 세션 초기화 -------------------------
  useEffect(() => {
    initializeSession();
    return () => {
      if (session) session.disconnect();
    };
  }, []);

  // --- 4. API를 통해 동영상 데이터 로드 ----------------
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
          setGameState(currentState);
        }
        const gameData = useGameStore.getState().getCurrentGameData();
        setCurrentGameData(gameData);
      } catch (error) {
        console.error("[fetchLimitData] 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLimitData();
  }, [childId]);

  useEffect(() => {
    if (currentGameData) {
      console.log("[currentGameData 업데이트]", currentGameData);
    }
  }, [currentGameData]);

  // --- 5. face-api 모델 로드 ---
  useEffect(() => {
    const loadModels = async () => {
      console.log("[loadModels] face-api 모델 로드 시작");
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

  // --- 6. 시작 버튼 누른 후 모달 실행 ---------------------
  useEffect(() => {
    if (isStarted) {
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
    }
  }, [isStarted]);

  useEffect(() => {
    if (!isStart) {
      console.log("[useEffect - 시작] - 시작 대기 중");
      Swal.fire({
        title: "상담사 선생님을 기다리고 있어요!",
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        showConfirmButton: false,
      });
    }
    if (isStart) {
      setShowContent(true);
    }
  }, [isStart, showContent]);

  // --- 7. phase가 "video"이고 showContent가 true일 때 동영상 자동 재생 ---------------------
  useEffect(() => {
    if (phase === "video" && currentGameData && videoRef.current && showContent) {
      videoRef.current
          .play()
          .then(() => {
            console.log("동영상 자동 재생");
          })
          .catch((error) => {
            console.error("자동 재생 실패:", error);
          });
    }
  }, [phase, currentGameData, showContent]);



  // --- 녹화 시작 함수 (녹화와 분석 함께) --------------------
  const startRecording = async () => {
    try {
      if (webcamRef.current && webcamRef.current.video) {
        // react-webcam의 video 엘리먼트에서 스트림 가져오기
        const stream = webcamRef.current.video.srcObject;
        if (!stream) {
          console.error("웹캠 스트림이 없습니다.");
          return;
        }
        // 스트림 클론 (분석용으로 별도 처리)
        const clonedStream = stream.clone();
        const mediaRecorder = new MediaRecorder(clonedStream);
        const chunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const formData = new FormData();
          formData.append("video", blob, "recording.webm");
          // 파일 업로드 로직 (필요 시 구현)
        };

        mediaRecorder.start();
        setRecorder(mediaRecorder);
        setIsRecording(true);

        // 분석 시작
        setPhase("analysis");
        if (analysisCycle === 1 || analysisCycle === 2) {
          console.log("[runConcurrentAnalysis] 동시 분석 시작 (표정+음성)");
          runConcurrentAnalysis();
        } else if (analysisCycle === 3) {
          console.log("[runFaceAnalysis] 표정 분석 시작 (연습)");
          runFaceAnalysis();
        } else if (analysisCycle === 4) {
          console.log("[runVoiceAnalysis] 음성 분석 시작 (말 연습)");
          runVoiceAnalysis();
        }
      }
    } catch (error) {
      console.error("녹화 및 분석 시작 중 오류:", error);
    }
  };

  const handleVideoEnd = () => {
    Swal.fire({
      title: "상황에 어울리는 옳은 감정과 말은 무엇일까요?",
      imageUrl: "/child/character/againCh.png",
      imageWidth: 200,
      imageHeight: 200,
      timer: 2000,
      showConfirmButton: false,
    }).then(() => stopRecording());
  };

  const handleStartRecording = () => {
    setAnalysisReady(true);
    startRecording();
  };

  // --- 평균 감정 계산 함수 ------------------
  const computeAverageEmotion = (data) => {
    console.log("[computeAverageEmotion] 시작");
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
    if (count === 0) {
      console.log("[computeAverageEmotion] 데이터 없음");
      return null;
    }
    let avg = {};
    Object.keys(sum).forEach((key) => {
      avg[key] = sum[key] / count;
    });
    console.log("[computeAverageEmotion] 결과:", avg);
    return avg;
  };

  // --- 동시 분석 (표정 + 음성) ------------------
  const runConcurrentAnalysis = async () => {
    console.log("[runConcurrentAnalysis] 호출됨 - 동시 분석 시작 (표정 및 음성)");

    // 새 분석 시작 시 취소 플래그를 false로 초기화
    analysisCanceledRef.current = false;

    // 표정 분석 Promise (9초간 분석)
    const facePromise = new Promise((resolve) => {
      console.log("[facePromise] 표정 분석 시작: 9초간 분석 시작");
      analysisDataRef.current = [];

      const intervalId = setInterval(async () => {
        if (analysisCanceledRef.current) {
          clearInterval(intervalId);
          console.log("[facePromise] 분석이 취소됨");
          resolve("분석 취소됨");
          return;
        }

        if (webcamRef.current) {
          const detections = await faceapi
              .detectAllFaces(webcamRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
          // 검출 결과 처리
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
        clearInterval(intervalId);
        analysisIntervalRef.current = null;

        if (analysisCanceledRef.current) {
          console.log("[facePromise] 분석 취소 플래그 감지");
          resolve("분석 취소됨");
          return;
        }

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

    // 음성 인식 Promise
    const voicePromise = new Promise((resolve, reject) => {
      console.log("[voicePromise] 음성 인식 시작");
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        reject("이 브라우저는 Speech Recognition을 지원하지 않습니다.");
        return;
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      // 음성 인식 인스턴스를 ref에 저장
      recognitionRef.current = recognition;

      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.continuous = false;

      // 만약 취소 플래그가 세팅되면 recognition.abort()를 호출
      if (analysisCanceledRef.current) {
        recognition.abort();
        resolve("분석 취소됨");
        return;
      }

      const voiceTimeout = setTimeout(() => {
        recognition.abort();
        resolve("음성 인식 시간이 초과되었습니다.");
      }, 9000);

      recognition.onresult = (event) => {
        clearTimeout(voiceTimeout);
        if (analysisCanceledRef.current) {
          console.log("[voicePromise] 분석 취소됨, 결과 처리 안함");
          resolve("분석 취소됨");
          return;
        }
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
      console.log("[voicePromise] 음성 인식 시작됨");
    });

    try {
      const [faceMsg, voiceMsg] = await Promise.all([facePromise, voicePromise]);
      // 만약 분석이 취소되었다면 후속 처리를 하지 않습니다.
      if (faceMsg === "분석 취소됨" || voiceMsg === "분석 취소됨") {
        console.log("[runConcurrentAnalysis] 분석이 취소되어 후속 처리를 건너뜁니다.");
        return;
      }
      setFaceResult(faceMsg);
      setVoiceResult(voiceMsg);
      setPhase("analysisResult");
      // 작업 완료 후 recognitionRef 초기화
      recognitionRef.current = null;
    } catch (error) {
      console.error("[runConcurrentAnalysis] 동시 분석 오류:", error);
    }
  };

  // --- 얼굴 분석만 (표정 연습) ------------------
  const runFaceAnalysis = async () => {
    console.log("[runFaceAnalysis] 호출됨 - 얼굴 분석 시작 (표정 연습)");
    // 새 분석 시작 시 취소 플래그 초기화
    analysisCanceledRef.current = false;
    const faceMsg = await new Promise((resolve) => {
      console.log("[faceAnalysis] 표정 분석 시작: 9초간 분석 시작");
      analysisDataRef.current = [];
      const intervalId = setInterval(async () => {
        if (analysisCanceledRef.current) {
          clearInterval(intervalId);
          analysisIntervalRef.current = null;
          console.log("[faceAnalysis] 분석이 취소됨");
          resolve("분석 취소됨");
          return;
        }
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
        if (analysisCanceledRef.current) {
          console.log("[faceAnalysis] 분석 취소됨, 결과 처리 안함");
          resolve("분석 취소됨");
          return;
        }
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
    if (faceMsg === "분석 취소됨") {
      console.log("[runFaceAnalysis] 분석이 취소되어 후속 처리 없음");
      return;
    }
    setFaceResult(faceMsg);
    setPhase("analysisResult");
    console.log("[runFaceAnalysis] 얼굴 분석 완료, faceResult:", faceMsg);
  };

  // --- 음성 분석만 (말 연습) ------------------
  const runVoiceAnalysis = async () => {
    console.log("[runVoiceAnalysis] 호출됨 - 음성 분석 시작 (말 연습)");

    // 새 음성 분석 시작 시 취소 플래그를 false로 초기화
    analysisCanceledRef.current = false;

    const voiceMsg = await new Promise((resolve, reject) => {
      if (analysisCanceledRef.current) {
        console.log("[runVoiceAnalysis] 분석이 취소됨");
        resolve("분석 취소됨");
        return;
      }
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        console.error("[runVoiceAnalysis] 이 브라우저는 Speech Recognition을 지원하지 않습니다.");
        reject("이 브라우저는 Speech Recognition을 지원하지 않습니다.");
        return;
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      // 저장
      recognitionRef.current = recognition;

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
        if (analysisCanceledRef.current) {
          console.log("[runVoiceAnalysis] 분석 취소됨, 결과 처리 안함");
          resolve("분석 취소됨");
          return;
        }
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

    if (voiceMsg === "분석 취소됨") {
      console.log("[runVoiceAnalysis] 분석이 취소되어 후속 처리 없음");
      return;
    }
    setVoiceResult(voiceMsg);
    setPhase("analysisResult");
    console.log("[runVoiceAnalysis] 음성 분석 완료, voiceResult:", voiceMsg);
    // 작업 완료 후 recognitionRef 초기화
    recognitionRef.current = null;
  };

  // --- 녹화 중지 및 분석  ------------------
  const stopRecording = async () => {
    try {
      if (recorder) {
        recorder.stop();
        setIsRecording(false);
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      setPhase("analysisResult");

      // 결과 모달 표시 (분석 사이클에 따라 다른 로직)
      if (analysisCycle === 1 || analysisCycle === 2) {
        Swal.fire({
          title: `분석 결과예요!`,
          html:
              `<p>표정 분석: ${faceResult}</p>
             <p>음성 인식: ${voiceResult}</p>
            `,
          imageUrl: "/child/character/againCh.png",
          imageWidth: 200,
          imageHeight: 200,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          if (analysisCycle === 1) {
            if (faceResult.includes("정답") && voiceResult.includes("정답")) {
              Swal.fire({
                title: "이제 표정과 말 연습을 해볼까요?",
                text: "거울을 보면서 천천히 따라해보세요!",
                imageUrl: "/child/character/againCh.png",
                imageWidth: 200,
                imageHeight: 200,
                timer: 2000,
                showConfirmButton: false,
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
                timer: 2000,
                showConfirmButton: false,
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
              title: "이제 표정만 해볼까요?",
              text: "거울을 보면서 천천히 따라해보세요!",
              imageUrl: "/child/character/againCh.png",
              imageWidth: 200,
              imageHeight: 200,
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              console.log("[useEffect - analysisResult] 두 번째 분석 후 표정 연습, cycle 변경 -> 3");
              setAnalysisCycle(3);
              setFaceResult(null);
              setVoiceResult(null);
              setPhase("analysisModal");
            });
          }
        });
      } else if (analysisCycle === 3) {
        Swal.fire({
          title: "표정 분석 결과",
          html: <p>${faceResult}</p>,
          imageUrl: "/child/character/againCh.png",
          imageWidth: 200,
          imageHeight: 200,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          console.log("[useEffect - analysisResult] face analysis modal 자동 종료");
          Swal.fire({
            title: "이제 말 연습을 해볼까요?",
            text: "아래 글자를 천천히 따라해보세요!",
            imageUrl: "/child/character/againCh.png",
            imageWidth: 200,
            imageHeight: 200,
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            console.log("[useEffect - analysisResult] voice practice 시작");
            setAnalysisCycle(4);
            setFaceResult(null);
            setPhase("analysisModal");
          });
        });
      } else if (analysisCycle === 4) {
        // 자동 진행: 버튼 대신 2초 후 타이머 만료 시 '다음으로 넘어가기' 기본 선택
        Swal.fire({
          title: "다시 연습해볼까요?",
          icon: "question",
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: false,
        }).then(() => {
          console.log("[useEffect - analysisResult] '다음으로 넘어가기' 자동 선택됨");
          Swal.fire({
            html:
                `<style>
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
                if (card) card.style.transform = "rotateY(180deg)";
              }, 4000);
            },
          }).then(() => {
            if (currentGameData.gameStageId === 5) {
              Swal.fire({
                title: "정말 잘했어요!",
                text: "모든 단원을 완료했어요!",
                imageUrl: "/child/character/againCh.png",
                imageWidth: 200,
                imageHeight: 200,
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "정말 잘했어요!",
                text: "다음 단원으로 이동할까요?",
                imageUrl: "/child/character/againCh.png",
                imageWidth: 200,
                imageHeight: 200,
                timer: 2000,
                showConfirmButton: false,
              }).then(async () => {
                console.log("[useEffect - analysisResult] NextChapter 호출 (자동)");
                await nextChapter();
                console.log("[useEffect - analysisResult] NextChapter 완료, cycle 초기화");
                setAnalysisCycle(1);
                setFaceResult(null);
                setVoiceResult(null);
                setPhase("video");
              });
            }
          });
        });
      }
    } catch (error) {
      console.error("녹화 및 분석 중지 오류:", error);
      Swal.fire({
        title: "오류 발생",
        text: "분석 중 문제가 발생했습니다. 다시 시도해주세요.",
        icon: "error",
      });
    }
  };
  //
  //
  //

  //
  //
  //
  //비디오 중지
  const StopVideo = () => {
    console.log("[StopVideo] 호출됨");
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
  //
  //
  //

  //
  //
  //
  // 수정된 NextChapter 함수 (currentGameData 체크 추가)
  const nextChapter = async () => {
    const storeState = useGameStore.getState();
    const currentStageIndex = storeState.currentStageIndex; // 0-based
    const currentChapter = storeState.currentChapter;
    const chapterData = storeState.chapterData;
    const stageCount = chapterData[currentChapter]?.length || 0;

    console.log("[NextChapter] 현재 stageIndex:", currentStageIndex, "총 stage 수:", stageCount);
    const nextStageIndex = currentStageIndex + 1;
    if (nextStageIndex >= stageCount) {
      Swal.fire({
        title: `${currentChapter}단계 마지막이에요!`,
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        confirmButtonText: "확인",
      });
      console.log("[NextChapter] 마지막 단원 도달 - 이동 불가");
      return;
    }
    resetAnalysisState();

    // setChapterAndStage는 1-based gameStageId를 받으므로, nextStageIndex + 1로 전달
    useGameStore.getState().setChapterAndStage(currentChapter, nextStageIndex + 1);
    console.log("[NextChapter] 단원 설정 업데이트:", currentChapter, nextStageIndex + 1);

    const gameData = await useGameStore.getState().getCurrentGameData();
    console.log("[NextChapter] 업데이트된 게임 데이터:", gameData);
    setCurrentGameData(gameData);
    setPhase("video");
    setAnalysisCycle(1);
    setIsPlaying(false);
  };
  //
  //
  //

  //
  //
  //
  // 수정된 PrevChapter 함수 (currentGameData 체크 추가)
  const previousChapter = async () => {
    const storeState = useGameStore.getState();
    const currentStageIndex = storeState.currentStageIndex; // 0-based
    const currentChapter = storeState.currentChapter;

    console.log("[PreviousChapter] currentStageIndex:", currentStageIndex);
    if (currentStageIndex <= 0) {
      Swal.fire({
        title: `${currentChapter}단계 첫번째 단원입니다!`,
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        confirmButtonText: "확인",
      });
      console.log("[PreviousChapter] 첫번째 단원 도달 - 이동 불가");
      return;
    }
    const newStageIndex = currentStageIndex - 1;
    // setChapterAndStage는 1-based gameStageId를 받으므로, newStageIndex + 1로 전달
    resetAnalysisState();
    useGameStore.getState().setChapterAndStage(currentChapter, newStageIndex + 1);
    console.log("[PreviousChapter] 단원 설정 업데이트:", currentChapter, newStageIndex + 1);

    const gameData = await useGameStore.getState().getCurrentGameData();
    console.log("[PreviousChapter] 업데이트된 게임 데이터:", gameData);
    setCurrentGameData(gameData);
    setPhase("video");
    setAnalysisCycle(1);
    setIsPlaying(false);
  };
  //
  //
  //

  // --- 게임 데이터 저장 ------------------
  useEffect(() => {
    const sendGameData = async () => {
      if (!voiceResult || !currentGameData) return;
      const selectedOptionMatch = voiceResult.match(/선택한 옵션은 (.+)입니다/);
      const selectedOption = selectedOptionMatch ? selectedOptionMatch[1] : "";
      const selectedOptionIndex = currentGameData.options.findIndex(
          (option) => option === selectedOption
      );
      if (selectedOptionIndex !== -1) {
        const optionNumber = selectedOptionIndex + 1;
        const isCorrect = optionNumber === currentGameData.answer;
        const emotionData = analysisDataRef.current;
        const avgEmotions = computeAverageEmotion(emotionData);
        const gameLearningDocument = {
          selectedOption: optionNumber,
          corrected: isCorrect,
          consulted: true,
          childGameStageId: Number(currentGameData.gameStageId),
          childUserId: Number(childId),
          gameStageId: Number(currentGameData.gameStageId),
          fHappy: Number(avgEmotions?.happy || 0),
          fAnger: Number(avgEmotions?.angry || 0),
          fSad: Number(avgEmotions?.sad || 0),
          fPanic: Number(avgEmotions?.surprised || 0),
          fFear: Number(avgEmotions?.fearful || 0),
          tHappy: Number(avgEmotions?.happy || 0),
          tAnger: Number(avgEmotions?.angry || 0),
          tSad: Number(avgEmotions?.sad || 0),
          tPanic: Number(avgEmotions?.surprised || 0),
          tFear: Number(avgEmotions?.fearful || 0),
        };
        try {
          await saveGameData(gameLearningDocument);
          console.log(`분석 사이클 ${analysisCycle} 게임 데이터 저장 성공`);
        } catch (error) {
          console.error(`분석 사이클 ${analysisCycle} 게임 데이터 저장 실패:`, error);
        }
      }
    };

    sendGameData();
  }, [voiceResult, currentGameData, analysisCycle]);



  // --- 8. 시그널 이벤트 리스너 추가 (counselor에서 보내는 시그널 수신) ---
  useEffect(() => {
    console.log("Signal handler 등록 useEffect 실행, session:", session);
    if (session) {
      const signalHandler = (event) => {
        console.log("Received signal:", event.data);
        console.log("From:", event.from);
        console.log("Type:", event.type);

        // 전달받은 시그널 타입에 따라 분기하여 처리합니다.
        switch (event.data) {
          case "start-chapter":
            console.log("원격: 학습 시작");
            Swal.close();
            Swal.fire({
              title: "상담사 선생님이 수업을 시작했어요!",
              imageUrl: "/child/character/againCh.png",
              imageWidth: 200,
              imageHeight: 200,
              showConfirmButton: false,
              timer: 2000, // 2초 후 자동 닫힘
            }).then(() => {
              setIsStart(true);
            });
            break;
          case "previous-stage":
            console.log("수신: 이전 단원으로 이동");
            previousChapter();
            break;
          case "record-start":
            // 녹화 시작 시 처리 로직
            console.log("수신: 녹화 시작");
            handleStartRecording();
            // 예: UI 상태 업데이트, 녹화 시작 표시 등
            break;
          case "record-stop":
            // 녹화 중지 시 처리 로직
            console.log("수신: 녹화 중지");
            stopRecording();
            // 예: UI 상태 업데이트, 녹화 중지 표시 등
            break;
          case "next-stage":
            // 다음 단원으로 이동 시 처리 로직
            console.log("수신: 다음 단원으로 이동");
            nextChapter();
            break;
          case "end-chapter":
            console.log("수신: 학습 종료");
            // 현재 열린 OpenVidu 세션 종료
            if (session) {
              session.disconnect();
              console.log("OpenVidu 세션 종료됨");
            }
            // 페이지 뒤로가기 (또는 원하는 다른 페이지로 이동)
            window.history.back();
            break;
          case "stop-video":
            StopVideo();
            break;
          default:
            console.log("알 수 없는 시그널 타입:", event.type);
        }
      };

      // 세션에서 시그널 이벤트 등록
      session.on("signal", signalHandler);

      // 컴포넌트 unmount 시 이벤트 핸들러 제거
      return () => {
        session.off("signal", signalHandler);
      };
    }
  }, [session, currentGameData, isRecording, isStarted]);


  // resetAnalysisState 함수에서는 취소 플래그를 true로 설정한 후,
  // recognition 취소 및 인터벌 정리만 수행합니다.
  const resetAnalysisState = () => {
    console.log("분석 취소 요청!");
    // 현재 진행 중인 분석 작업들을 중단하기 위해 취소 플래그를 true로 설정합니다.
    analysisCanceledRef.current = true;

    // 진행 중인 얼굴 분석 인터벌 클리어
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    // SpeechRecognition 인스턴스 취소 (아래 recognitionRef를 사용)
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    // 분석 데이터 및 결과 초기화
    analysisDataRef.current = [];
    setFaceResult(null);
    setVoiceResult(null);
    setAnalysisCycle(1);
    setPhase("video");
    Swal.close();
  };

  // **************************************************************************************************************** //
  // 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람
  const isOtherParticipantAbsent = () => {
    if (!session) {
      console.log("[isOtherParticipantAbsent] 세션이 아직 초기화되지 않았습니다.");
      return false; // 세션이 없으면 아직 판단할 수 없음
    }

    let childStreamExists = false;

    if (session.streams && typeof session.streams.forEach === "function") {
      session.streams.forEach((stream) => {
        if (stream.typeOfVideo === "SCREEN") {
          childStreamExists = true;
        }
      });
    } else {
      console.log("[isOtherParticipantAbsent] session.streams가 없거나 순회할 수 없습니다.");
    }

    if (!childStreamExists) {
      console.log("[isOtherParticipantAbsent] 상대방(아동의 화면 공유 스트림)이 세션에 존재하지 않습니다.");
    } else {
      console.log("[isOtherParticipantAbsent] 아동의 화면 공유 스트림이 확인되었습니다.");
    }

    return !childStreamExists;
  };

  useEffect(() => {
    const checkAbsence = async () => {
      if (isOtherParticipantAbsent()) {
        console.log("[checkAbsence] 상대방이 없습니다. 알람 전송 시작...");
        // 알람 전송에 필요한 데이터(alarmDto)를 구성합니다.
        const alarmDto = {
          toUserId: Number(childId),
          senderRole: "ROLE_PARENT",
          sessionType: "game",
        };

        try {
          const response = await sendAlarm(alarmDto);
          console.log("[checkAbsence] 알람 전송 성공:", response);
        } catch (error) {
          console.error("[checkAbsence] 알람 전송 실패:", error);
        }
      }
    };

    // 5초마다 체크 (원하는 시간 간격으로 변경 가능)
    checkAbsence();
  }, [session, childId]);
  // 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람 알람
  // **************************************************************************************************************** //

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
                      {phase === "analysisResult" && analysisCycle > 2 && (
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
                                <p
                                    className={`${
                                        analysisCycle < 3
                                            ? index + 1 === currentGameData?.answer
                                                ? "ch-learning-before-answer"
                                                : ""
                                            : index + 1 === currentGameData?.answer
                                                ? "ch-learning-correct-answer"
                                                : ""
                                    }`}
                                >
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

        {/* 오른쪽: 웹캠 영역 */}
        <div className="ch-review-game-right">
          <div className="ch-game-face-screen">
            {/* 오른쪽 위: 아동 웹캠 (react-webcam 사용) */}
            <Card className="ch-game-Top-section">
              <Webcam
                  audio={false}
                  ref={webcamRef}
                  videoConstraints={{
                    width: 320,
                    height: 240,
                    facingMode: "user",
                  }}
              />
            </Card>

            <div className="ch-learning-middle-section"></div>

            <div className="ch-learning-bottom-section">
              <div className="ch-learning-button-left">
                <img src="/child/button-left.png" alt="button-left" />
                <p> 이전 단원</p>
                {!isStarted && (
                    <button
                        onClick={() => setIsStarted(true)}
                        className="game-screen-share-button"
                        style={{ marginTop: "10px" }}
                    >
                      시작하기
                    </button>
                )}
              </div>

              {/* 오른쪽 아래: 상담사 웹캠 (OpenVidu 구독) */}
              <Card className="ch-learning-counselor-screen">
                <CounselorCamWithChild session={session} subscriber={subscriber} mode="subscribe" />
              </Card>

              <div className="ch-learning-button-right">
                <img src="/child/button-right.png" alt="button-right"  />
                <p>다음 단원</p>
                <BsStopBtnFill  className="ch-learning-stop-icon" />
                <button
                    disabled={screenSubscriber !== null}
                    className="game-screen-share-button"
                >
                  {screenSubscriber ? "공유 중" : "공유하기"} ✅
                </button>
                {!isRecording && (
                    <button

                        className="game-screen-share-button"
                        style={{ marginTop: "10px" }}
                    >
                      녹화 시작
                    </button>
                )}
                {isRecording && (
                    <button

                        className="game-screen-share-button"
                        style={{ marginTop: "10px", backgroundColor: "red" }}
                    >
                      녹화 중지
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default ChildReviewGamePage;