import "./ChildCss/ChildReviewGamePage.css";
import useGameStore from "../../store/gameStore";
import { Card } from "primereact/card"; // Card import 다시 추가
import { useEffect, useState, useRef } from "react"; // useRef 추가
import { limitGamedata } from "../../api/childGameContent";
import { OpenVidu } from 'openvidu-browser';
import api from "../../api/api"
import * as faceapi from "face-api.js";
import stringSimilarity from "string-similarity";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ChildVideoScreen from "../../components/OpenviduSession/ChildVideoScreen"

function ChildClassPage() {
  // 상태관리 1import "./ChildCss/ChildClassPage.css";
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
import ChildVideoScreen from "../../components/OpenviduSession/ChildVideoScreen";
import CounselorCamWithChild from "../../components/OpenviduSession/CounselorCamWithChild";

function ChildReviewGamePage() {
  console.log("[ChildReviewGamePage] Component mounted");

  const videoRef = useRef(null);
  // 웹캠 분석용 video ref
  const webcamRef = useRef(null);
  // 표정 분석 인터벌 id 저장용 ref
  const analysisIntervalRef = useRef(null);
  // 표정 분석 데이터를 동기적으로 저장하기 위한 ref
  const analysisDataRef = useRef([]);

  const childId = sessionStorage.getItem("childId");
  const { setChapterAndStage, getCurrentGameData } = useGameStore();
  const [gameState, setGameState] = useState(null);
  const [gameIdData, setGameIdData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGameData, setCurrentGameData] = useState(null);
  const [phase, setPhase] = useState("video"); // 비디오 상태관리
  const [showContent, setShowContent] = useState(false); // 모달 확인 후 내용 보여주는 상태관리
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // 한 사이클의 분석 결과 저장
  // 사이클 1,2: 종합 감정 분석(표정+음성), 3: 표정 연습, 4: 말 연습
  const [faceResult, setFaceResult] = useState(null);
  const [voiceResult, setVoiceResult] = useState(null);
  const [analysisCycle, setAnalysisCycle] = useState(1);

  // 정답 여부
  const [corrected, setCorrected] = useState(false);
  // 녹화 
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [analysisReady, setAnalysisReady] = useState(false);

  

  // 오픈비두
  const [session, setSession] = useState(null);
  // 상대방 (상담사 화면)
  const [subscriber, setSubscriber] = useState([]);
  // 나(자신)
  const [publisher, setPublisher] = useState(null);
  // 화면공유 (아동 측 publish용)
  const [screenSubscriber, setscreenSubscriber] = useState(null);
  // 오픈비두 객체 (세션 초기화, 스트림 전송, 연결 등)
  const OV = useRef(new OpenVidu());

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

      // 스트림 감지 (다른 참가자 웹캠)
      sessionInstance.on('streamCreated', (event) => {
        const subscriber = sessionInstance.subscribe(event.stream, undefined);
        setSubscriber(subscriber);
      });

      sessionInstance.on('streamDestroyed', (event) => {
        setSubscriber(null);  // null로 초기화
      });

      const token = await getToken();
      // 토큰을 통해 세션과 스트림구독을 연결
      await sessionInstance.connect(token);

      // 초기값 (publisher: 화면 공유 퍼블리셔 생성)
      const pub = OV.current.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: 'screen', // 화면 공유용 스트림 (아동은 공유할 화면을 publish)
        publishAudio: true,
        publishVideo: true,
        mirror: true
      });

      await sessionInstance.publish(pub);
      setSession(sessionInstance);
      setPublisher(pub);
    } catch (error) {
      console.error('세션 초기화 오류:', error);
    }
  }, []);

  // --- 2. 화면 공유 시작 함수 (버튼 클릭 시 실행) -------------------------
  // 아동 페이지의 화면 공유 함수
  const createScreenShareStream = async () => {
    try {
      console.log('1. 화면 공유 시작 시도...');
      if (screenSubscriber) {
        console.log("📌 이미 화면 공유 중입니다.");
        return;
      }

      // 화면 공유 스트림을 가져옴
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // 화면 공유 스트림 퍼블리셔 생성 (videoSource를 'screen'으로 지정)
      const newScreenPublisher = OV.current.initPublisher(undefined, {
        videoSource: 'screen',
        audioSource: true,
        publishVideo: true,
        mirror: false,
      });

      // 화면 공유 스트림 퍼블리싱
      await session.publish(newScreenPublisher);
      setscreenSubscriber(newScreenPublisher);

      // 사용자가 화면 공유 중단 시 처리
      newScreenPublisher.stream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('사용자가 화면 공유를 중단함');
        session.unpublish(newScreenPublisher);
        setscreenSubscriber(null);
      });
    } catch (error) {
      console.error('❌ 화면 공유 중 오류:', error);
      setscreenSubscriber(null);
    }
  };

  // 화면 공유 시작 함수
  const startScreenShare = async () => {
    await createScreenShareStream();
  };

  // **[수정]** 아동 측에서는 화면 공유 스트림을 자기가 렌더링하지 않도록 아래 useEffect를 제거 또는 주석 처리합니다.
  /*
  useEffect(() => {
    if (screenSubscriber && videoRef.current) {
      const stream = screenSubscriber.stream?.getMediaStream();
      if (stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [screenSubscriber]);
  */

  // --- 3. 컴포넌트 마운트 시 세션 초기화 -------------------------
  useEffect(() => {
    initializeSession();
    return () => {
      if (session) session.disconnect();
    };
  }, []);

  // --- 1. API를 통해 동영상 데이터 로드 ----------------
  useEffect(() => {
    const fetchLimitData = async () => {
      console.log("[fetchLimitData] 호출됨 - childId:", childId);
      try {
        const data = await limitGamedata(childId);
        console.log("[fetchLimitData] API 호출 결과:", data);
        setGameIdData("가져온 정보", data);
        if (data) {
          console.log("[fetchLimitData] Fetch Data:", data);
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

  // 현재데이터 변경 시 실행
  useEffect(() => {
    if (currentGameData) {
      console.log("[useEffect - currentGameData] 업데이트된 currentGameData:", currentGameData);
      console.log("[useEffect - currentGameData] currentGameData.chapterId:", currentGameData?.chapterId);
    }
  }, [currentGameData]);

  // --- 1. face-api 모델 로드 ---
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

  // --- 3. 웹캠 스트림 시작 ----------------------------
  useEffect(() => {
    const startWebcam = async () => {
      console.log("[startWebcam] 호출됨 - 웹캠 스트림 시작");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        console.log("[startWebcam] 웹캠 스트림 획득:", stream);
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          webcamRef.current.play();
          console.log("[startWebcam] 웹캠 비디오 재생 시작");
        }
      } catch (err) {
        console.error("[startWebcam] 웹캠 시작 실패:", err);
      }
    };
    startWebcam();
  }, []);

    const [isStarted, setIsStarted] = useState(false);    // 시작 여부
  // --- 4. 시작 버튼 누른 후 시작 (모달) ---------------------
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


  // --- phase가 "video"이고 showContent가 true일 때 동영상 자동 재생 ---------------------
  useEffect(() => {
    if (phase === "video" && currentGameData && videoRef.current && showContent) {
      videoRef.current
          .play()
          .then(() => {
            console.log("새 단원 동영상이 자동 재생됩니다.");
          })
          .catch((error) => {
            console.error("자동 재생 실패:", error);
          });
    }
  }, [phase, currentGameData, showContent]);

  // --- 모달: 분석 전 (분석 종류에 따라 분기) ---
  useEffect(() => {
    if (phase === "analysisModal") {
      console.log("[useEffect - analysisModal] 현재 phase:", phase, "analysisCycle:", analysisCycle);
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

  // --- 비디오 종료 시 감정 분석 시작 ----------------------------

  const handleVideoEnd = () => {
    console.log("[handleVideoEnd] 호출됨 - 비디오 종료, 녹화 준비");
    setAnalysisReady(true); // 녹화 가능 상태로 변경
  };


// --- 녹화 시작 함수 ---
const startRecording = async () => {
  if (!session || !analysisReady) return;

  console.log("[startRecording] 녹화 및 분석 시작");
  const recorder = session.openvidu.getRecorder();
  await recorder.start();
  setRecorder(recorder);
  setIsRecording(true);
  setPhase("analysisModal"); // 분석 시작
  
  // 현재 분석 사이클에 따라 적절한 분석 시작
  if (analysisCycle === 1 || analysisCycle === 2) {
    runConcurrentAnalysis();
  } else if (analysisCycle === 3) {
    runFaceAnalysis();
  } else if (analysisCycle === 4) {
    runVoiceAnalysis();
  }
};

// --- 녹화 중지 함수 ---
const stopRecording = async () => {
  if (!recorder || !isRecording) return;

  console.log("[stopRecording] 녹화 중지 및 분석 종료");
  await recorder.stop();
  setRecorder(null);
  setIsRecording(false);
  
  // 현재 실행 중인 분석 중지
  if (analysisIntervalRef.current) {
    clearInterval(analysisIntervalRef.current);
    analysisIntervalRef.current = null;
  }
  
  setPhase("analysisResult"); // 결과 표시 페이즈로 전환
};
  

  // --- 표정 분석 보조 함수: 평균 감정 계산 ---
  const computeAverageEmotion = (data) => {
    console.log("[computeAverageEmotion] 호출됨 - 감정 데이터 평균 계산 시작");
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
    data.forEach((item, dataIndex) => {
      item.emotions.forEach((emotionObj, emotionIndex) => {
        console.log(`[computeAverageEmotion] dataIndex ${dataIndex}, emotionIndex ${emotionIndex}:`, emotionObj);
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

  // --- 동시 분석 실행 함수: 표정 및 음성 동시에 진행 (사이클 1,2) ---
  const runConcurrentAnalysis = async () => {
    console.log("[runConcurrentAnalysis] 호출됨 - 동시 분석 시작 (표정 및 음성)");
    analysisDataRef.current = [];
    // 표정 분석 Promise (9초간 분석)
    const facePromise = new Promise((resolve) => {
      console.log("[facePromise] 표정 분석 시작: 9초간 분석 시작");
      analysisDataRef.current = [];
      const intervalId = setInterval(async () => {
        if (webcamRef.current&& isRecording) {
          const detections = await faceapi
              .detectAllFaces(webcamRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
          console.log("[facePromise] 감지 결과:", detections);
          if (detections.length > 0) {
            const emotions = detections.map((det) => det.expressions);
            analysisDataRef.current.push({
              timestamp: new Date().toISOString(),
              emotions,
            });
            console.log("[facePromise] 현재 분석 데이터:", analysisDataRef.current);
          }
        }
      }, 100);
      analysisIntervalRef.current = intervalId;
      //       // 음성 인식 시작
      //   if (isRecording) {
      //     startVoiceRecognition();
      //   }
      // }

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

    // 음성 인식 Promise
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

  // --- 얼굴(표정) 분석만 진행 (사이클 3) ------------------------
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

  // --- 음성 분석만 진행 (사이클 4) -----------------------------
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

  // --- 결과 표시 후 다음 사이클 또는 다음 영상으로 전환 ---
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
        
          // 정답 여부
          if (analysisCycle === 1) {
            if (isCorrect) {
              setCorrected(true); // 첫 번째 시도에서 정답
            } else {
              setCorrected(false); // 첫 번째 시도에서 틀린 경우
            }
          } else if (analysisCycle === 2) {
            if (isCorrect) {
              setCorrected(true); // 두 번째 시도에서 정답
            } else {
              setCorrected(false); // 두 번째 시도에서 틀린 경우
            }
          }
          

          console.log("[useEffect - analysisResult] concurrent analysis modal result:", result);
         
          if (result.isConfirmed) {
            if (analysisCycle === 1) {

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

  // 저장 
  const selectedOption = optionsArray[bestOptionIndex]
  const submitData = () => {
    const data = {
      corrected: corrected,
      corrected: corrected, 
    };
  const saveCurrentTime = () => {
    const currentTime = new Date();
    setSubmitDtt(currentTime)
  }
  // consulted
  const childGameStageId = (chapter) => {
    setCurrentChapter(chapter)
  }
  const udserId = sessionStorage.getItem('child')
  const emotions = com
  // stt
  //
  const saveclassData = async () => {
    const data = {
      childId: sessionStorage.getItem('child'),
      gameStageId: currentGameData?.gameStageId,
      chapterId: currentGameData?.chapterId,
      cycle1Correct: analysisCycle === 1 ? isCorrect : null,   
      cycle2Correct: analysisCycle === 2 ? isCorrect : null,    
      cycle3Correct: analysisCycle === 3 ? isCorrect : null,    
      cycle4Correct: analysisCycle === 4 ? isCorrect : null,
      selectedOption: selectedOption,
      emotions: analysisDataRef.current,  // 표정 분석 데이터
      submitDtt: new Date().toISOString()
    };
  
    try {
      await saveClassData(data);
      console.log("[submitData] 데이터 저장 성공:", data);
    } catch (error) {
      console.error("[submitData] 데이터 저장 실패:", error);
    }
  };
  await saveClassData (classDocumentList)















  // --- 제어 기능 ------------------------------
  // 정지
  const StopVideo = () => {
    console.log("[StopVideo] 호출됨 - 비디오 재생 상태 토글 및 분석 중지");
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

  // 다음 단원으로 이동
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

  // 이전 단원으로 이동
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


  const [isStarted, setIsStarted] = useState(false);

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

            {isStarted && (
              <video
                ref={videoRef}
                src={currentGameData?.gameVideo ?? ""}
                onEnded={handleVideoEnd}
                className="ch-gameVideo"
              />
            )}
            {/* 비디오 종료 후 출력 메세지 */}
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

            {/* 선택지 버튼 영역 */}
            <div className="ch-game-button">
              {currentGameData?.optionImages?.length > 0 &&
              currentGameData?.options?.length > 0 ? (
                <div className="option-images">
                  {currentGameData.optionImages.map((imgSrc, index) => (
                    <div key={index} className="learning-option-item">
                      <img
                        src={imgSrc}
                        alt={`option ${index + 1}`}
                        className="option-image"
                      />
                      <p
                        className={`${
                          analysisCycle < 3
                            ? index + 1 === currentGameData?.answer
                              ? 'ch-learning-before-answer'
                              : ''
                            : index + 1 === currentGameData?.answer
                            ? 'ch-learning-correct-answer'
                            : ''
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
      <div>{/* 추가 버튼 영역 */}</div>
    </div>

    {/* 오른쪽: 웹캠 및 아동 화면 영역 */}
    <div className="ch-review-game-right">
      <div className="ch-game-face-screen">
        <Card className="ch-game-Top-section">
          <ChildVideoScreen
            publisher={publisher}
            session={session}
            videoRef={webcamRef}
          />
        </Card>
        <div className="ch-learning-middle-section"></div>
        <div className="ch-learning-bottom-section">
          <div className="ch-learning-button-left">
            <img
              src="/child/button-left.png"
              alt="button-left"
              onClick={PrevChapter}
            />
            <p> 이전 단원</p>
          </div>
          {/* 오른쪽: 상담사 화면 영역 */}
          <Card className="ch-learning-counselor-screen">
            <CounselorCamWithChild
              session={session}
              subscriber={subscriber}
              mode="subscribe"
            />
          </Card>
          <div className="ch-learning-button-right">
            <img
              src="/child/button-right.png"
              alt="button-right"
              onClick={NextChapter}
            />
            <p>다음 단원</p>
            <BsStopBtnFill onClick={StopVideo} className="ch-learning-stop-icon" />
            <button
              onClick={startScreenShare}
              disabled={screenSubscriber !== null}
              className="game-screen-share-button"
            >
              {screenSubscriber ? "화면 공유 중" : "게임 화면 공유하기"}
            </button>
            {!isStarted && (
              <button
                onClick={() => setIsStarted(true)}
                className="game-screen-share-button"
                style={{ marginTop: '10px' }}
              >
                시작하기
              </button>
            )}
          </div>
          {analysisReady && !isRecording && (
    <button
      onClick={startRecording}
      className="game-screen-share-button"
      style={{ marginTop: '10px' }}
    >
      녹화 시작
    </button>
  )}
  {isRecording && (
    <button
      onClick={stopRecording}
      className="game-screen-share-button"
      style={{ marginTop: '10px', backgroundColor: 'red' }}
    >
      녹화 중지
    </button>
  )}
        </div>
      </div>
    </div>
  </div>
);
}

export default ChildReviewGamePage;

  const childId = sessionStorage.getItem("childId");
  const { setChapterAndStage, getCurrentGameData } = useGameStore();
  const [gameState, setGameState] = useState(null);
  const [gameIdData, setGameIdData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [publisher, setPublisher] = useState(null)
  const OV = useRef(new OpenVidu());
  const videoRef = useRef(null);
  const navigate = useNavigate();


  // 단계(phase) 상태  
  // "video": 영상 재생 중
  // "situationmodal" : 녹화 전 모달표시
  // "record1" : 영상 녹화와 동시에 표정인식, 음성인식 
  // "recordResult" : 표정 분석 1회 결과 표시 -> 정답시 face1modal로 이동동
  // "record2" : 영상 녹화와 동시에 표정인식, 음성인식 
  // "recordResult" : 표정 분석 2회 결과 표시 
  // "답 표시" 
  // "face1Modal": 표정 인식 전 모달 표시  
  // "face1": 표정 분석 1회 진행 중 
  // "voice1Modal": 음성 인식 전 모달 표시  
  // "voice1": 음성 인식 1회 진행 중 


  // 상태관리 2
  // 웹캠 분석용 video ref
  const webcamRef = useRef(null);
  // 표정 분석 인터벌 id 저장용 ref
  const analysisIntervalRef = useRef(null);
  // 표정 분석 데이터를 동기적으로 저장하기 위한 ref
  const analysisDataRef = useRef([]);
  // 녹화
  const [isRecording, setIsRecording] = useState(false);
  // 분설결과 저장
  const [combinedResult, setCombinedResult] = useState(null);
  // 현재 단계
  const [phase, setPhase] = useState("video");


  // 토큰 받기 
  async function getToken() {
    try {
      const response = await api.post('/session/join', { 
        type: 'game', 
        childId 
      });
      return response.data;
    } catch (error) {
      console.error('토큰 요청 실패:', error);
      throw error;
    }
  }

  // 페이지가 열렸을때 데이터 가져오기
  useEffect(() => {
    const fetchLimitData = async () => {
      try {
        const data = await limitGamedata(childId);
        setGameIdData(data);
        if (data) {
          console.log("Fetched Data:", data);
          await useGameStore.getState().fetchChapterData(data.chapter);
          setChapterAndStage(data.chapter, data.stage);
          const currentState = useGameStore.getState();
          setGameState(currentState);
        }

        // 세션 초기화
      const sessionInstance = OV.current.initSession();
      const token = await getToken();
      
      await sessionInstance.connect(token);

      const camPublisher = OV.current.initPublisher(undefined, {
        videoSource: undefined,
        audioSource: true,
        mirror: true,
      });

      sessionInstance.publish(camPublisher);
      setPublisher(camPublisher);
      setSession(sessionInstance);

      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLimitData();

    // 상담사가 종료버튼을 누르면 아동도 나가지기
    // if (session) {
    //   session.on("sessionDisconnected", (event) => {
    //     Swal.fire({
    //       title: "함께 학습해서 즐거웠어~",
    //       text: "다다음에 만나!",
    //       imageUrl: "/child/character/againCh.png",
    //       imageWidth: 200,
    //       imageHeight: 200,
    //       showConfirmButton: false,
    //       timer: 2000,
    //     }).then(() => {
    //       navigate(`/child/${childId}/`);
    //     });
    //   });
    // }

    // 아래 session 추가하기
  }, []);

  // 상태관리 2

  const [showContent, setShowContent] = useState(false); //비디오 false이면 모달 및 내용 보여주는 상태관리
  const [feedback, setFeedback] = useState(null); // 임시(정답시 오답시 피드백)
  const [showAnswer, setShowAnswer] = useState(false); // 비디오 종료 시 정답 보여주는 상태 관리
  const [currentStep, setCurrentStep] = useState(0); // 현재 내용 스텝 인덱스
  // const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(null); // 타이머

  // 제어기능
  // 녹화, 일시정지
  // const [isRecording, setIsRecording] = useState(false);
  // const webcamRef = useRef(null);
  // const mediaRecorderRef = useRef(null);
  const [isGamePaused, setIsGamePaused] = useState(false);

  useEffect(() => {
    // gameState가 없으면 아무것도 하지 않음
    if (!gameState) return;

    // 모달 표시 및 비디오 시작
    Swal.fire({
      title: "감정아! 같이 공부해 볼까?",
      imageUrl: "/child/character/againCh.png",
      imageWidth: 200,
      imageHeight: 200,
      showConfirmButton: true,
    }).then(() => {
      setShowContent(true);
      if (videoRef.current) {
        videoRef.current.play();
      }
    });

    // 비디오 종료 이벤트 리스너 설정
    const videoEnd = () => {
      console.log("비디오 종료");
      setCurrentStep(0);
      if (typeof startTimer === "function") {
        startTimer();
      }
    };

    // showContent와 videoRef가 있을 때만 이벤트 리스너 추가
    if (showContent && videoRef.current) {
      videoRef.current.addEventListener("ended", videoEnd);
    }

    // cleanup 함수
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("ended", videoEnd);
      }
    };
  }, [gameState, showContent]);

  const createReviewContents = () => {
    const baseContents = [
      {
        header: "영상 속 감정이가 느낀 감정은 뭘까요?!",
        content: "이 상황에서는 어떤 표정을 지어야할까요?",
        duration: 5000,
        type: "question",
        options: gameState.options || [],
        answer: gameState.answer || null,
        feedbacks: {
          success: "맞았어요! 잘 보고 배워볼까요?",
          failure: "다시 한 번 생각해볼까요?",
          secondFailure: "아쉽지만 다음에 다시 도전해보세요!",
        },
      },
      {
        header: "이제 상황에 어울리는 표정을 지어볼까요?",
        duration: 5000,
        // ai 분석 필요
        // 아동 표정 분석 필요 : true
        isExpressionStep: true,
        type: "expression",
      },
      {
        header: "이제 상황에 어울리는 말을 표현해볼까요?",
        duration: 5000,
        isExpressionStep: true,
        type: "speech",
      },
    ];

    return baseContents;
  };

  const reviewContents = gameState ? createReviewContents(gameState) : [];
  // AI 실시간 표정 분석;

  // 타이머 (순서)
  const startTimer = () => {
    if (isGamePaused) return; // 일시정지 상태면 타이머 시작하지 않음
    if (timer) clearTimeout(timer);

    const newTimer = setTimeout(() => {
      setFeedback(reviewContents[currentStep]?.feedbacks?.failure);
      moveToStep();
    }, 3000);

    setTimer(newTimer);
  };

  // 학습 콘텐츠 내부 문구 이동동
  const moveToStep = () => {
    if (currentStep < reviewContents.length - 1) {
      setCurrentStep((prev) => prev + 1);
      startTimer();
    } else {
      console.log("마지막 단계 도달. handleStageComplete() 실행");
      handleStageComplete();
    }
  };

  // 일시정지/재개
  const togglePause = () => {
    setIsGamePaused((prev) => !prev);
    if (videoRef.current) {
      if (isGamePaused) {
        videoRef.current.play();
        if (timer) startTimer(); // 타이머 재시작
      } else {
        videoRef.current.pause();
        if (timer) clearTimeout(timer); // 타이머 중지
      }
    }
  };

  // 챕터 이동
  const moveToNextStep = () => {
    if (gameIdData.stage < 5) {
      // 최대 5단원까지 가정
      const nextStage = gameIdData.stage + 1;
      setChapterAndStage(gameIdData.chapter, nextStage);

      // 다음 게임 데이터 불러오기
      const nextData = getCurrentGameData();
      if (nextData) {
        setGameState(nextData);
        setGameIdData((prev) => ({
          ...prev,
          stage: nextStage,
        }));
      }
    } else {
      // 5단원 마지막인 경우 다음 챕터로 이동하거나 알림
      Swal.fire({
        title: "마지막 단원입니다!",
        text: "다음 챕터로 이동할 수 없습니다.",
        icon: "info",
      });
    }
  };

  const moveToPrevStage = () => {
    if (gameIdData.stage > 1) {
      // 최소 1단원부터 시작
      const prevStage = gameIdData.stage - 1;
      setChapterAndStage(gameIdData.chapter, prevStage);

      // 이전 게임 데이터 불러오기
      const prevData = getCurrentGameData();
      if (prevData) {
        setGameState(prevData);
        setGameIdData((prev) => ({
          ...prev,
          stage: prevStage,
        }));
      }
    } else {
      // 1단원인 경우 첫 단원임을 알림
      Swal.fire({
        title: "첫 단원입니다!",
        text: "이전 단원으로 이동할 수 없습니다.",
        icon: "info",
      });
    }
  };

  // 종료(나가기)
  const exitGame = () => {
    Swal.fire({
      title: "함께 학습해서 즐거웠어~",
      text: "다음에 만나!",
      imageUrl: "/child/character/againCh.png",
      imageWidth: 200,
      imageHeight: 200,
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      navigate(`/child/${childId}/`);
    });
  };

  // 종료 스왈
  const handleStageComplete = () => {
    // 먼저 카드 앞면 보여주기
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
              <img src="${gameState.cardFront}" alt="card front" style="width: 200px; height: 300px; object-fit: contain;" />
            </div>
            <div class="flip-card-back">
              <img src="${gameState.cardBack}" alt="card back" style="width: 200px; height: 300px; object-fit: contain;" />
            </div>
          </div>
        </div>
      `,
      showConfirmButton: false,
      timer: 2000, // 앞면 보여주는 시간
      didOpen: () => {
        // 2초 후 카드 뒤집기 시작
        setTimeout(() => {
          const card = document.querySelector(".flip-card-inner");
          card.style.transform = "rotateY(180deg)";
        }, 1000);
      },
      didClose: () => {
        if (gameState.gameStageId < 5) {
          // 카드 보여준 후 스테이지 완료 메시지
          Swal.fire({
            title: `${gameIdData.stage}를 마쳤어요!`,
            text: `이제 ${gameIdData.stage + 1}단원으로 출발~!`,
            imageUrl: "/child/character/againCh.png",
            imageWidth: 200,
            imageHeight: 200,
            showConfirmButton: true, // 확인 버튼 추가
            confirmButtonText: "계속하기", // 버튼 텍스트 변경
          }).then((result) => {
            if (result.isConfirmed) {
              // 다음 단원으로 이동
              const nextData = getCurrentGameData();
              if (nextData) {
                setGameState(nextData);
              }
            }
          });
        } else {
          Swal.fire({
            title: "1단계를 마쳤어요!",
            imageUrl: "/child/character/againCh.png",
            imageWidth: 200,
            imageHeight: 200,
            timer: 2000,
            showConfirmButton: false, // 확인 버튼 제거
            allowOutsideClick: false, // 외부 클릭 방지
            allowEscapeKey: false, // ESC 키로 닫기 방지
          });
        }
      },
    });
  };

  // 상담사 스트림 감지
  // 상담사 스트림 구독
  // const subscribeToStreamCreated = useCallback((session) => {
  //   session.on("streamCreated", (event) => {
  //     const subscriber = session.subscribe(event.stream, undefined);
  //     setSubscribers((prev) => [...prev, subscriber]);
  //   });
  // }, []);

  // // 상담사 스트림 제거
  // const subscribeToStreamDestroyed = useCallback((session) => {
  //   session.on("streamDestroyed", (event) => {
  //     setSubscribers((prev) =>
  //       prev.filter((sub) => sub !== event.stream.streamManager)
  //     );
  //   });
  // }, []);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!gameState || !gameIdData) {
    return <div>데이터를 불러올 수 없습니다.</div>;
  }

  const currentGameData = getCurrentGameData();

  return (
    <div className="ch-review-game-container">
      <div className="ch-review-container">
        <div className="ch-review-game-left">
          <Card className="ch-game-screen-container">
            <div className="ch-game-screen-container-up">
              <h2>
                {gameIdData.chapter}단계 {gameIdData.stage}단원
              </h2>
              <h3>{currentGameData?.situation}</h3>
              <video
                ref={videoRef}
                src={currentGameData?.gameVideo}
                controls
                className="ch-game-class-screen"
              />
            </div>
            <div>progressbar</div>
            <div className="ch-game-button">
              {currentGameData.options.map((option, index) => (
                <div key={index}>
                  <h4 className="ch-options-number">
                    {["①", "②", "③"][index]}
                  </h4>
                  <div
                    className={`ch-option ${
                      showAnswer && index === currentGameData.answer
                        ? "correct-answer"
                        : ""
                    }`}
                  >
                    <img
                      src={currentGameData.optionImages[index]}
                      alt={`option ${index + 1}`}
                    />
                  </div>
                  <h4 className="ch-options-selection">{option}</h4>
                </div>
              ))}
            </div>
          </Card>
        </div>
        {/* right */}
        <div className="ch-review-game-right">
          <div className="ch-game-face-screen">
            <div className="ch-game-Top-section">
              <div className="ch-game-child-video-screen">
              <ChildVideoScreen  session={session} publisher={publisher}/>
              </div>
            </div>
            <div className="ch-game-middle-section"></div>

            {/* 컨트롤 섹션 */}
            <div className="ch-game-bottom-section">
              {/* 십자가버튼 */}
              <div className="ch-game-button-left">
                <div>
                  <img src="/child/button-left.png" alt="button-left" />
                  {/* 정지버튼 */}
                  <button onClick={togglePause}>
                    {isGamePaused ? "재개" : "일시정지"}
                  </button>
                  {/* 챕터 이동 버튼 */}
                  <button
                    onClick={moveToPrevStage}
                    disabled={gameIdData.stage === 1}
                  >
                    이전 단원
                  </button>
                  <button
                    onClick={moveToNextStep}
                    disabled={gameIdData.stage === 5}
                  >
                    다음 단원
                  </button>
                  {/* 종료버튼튼 */}
                  <button onClick={exitGame}>종료</button>
                </div>
              </div>
              {/* content message 표시 */}
              <Card className="ch-game-counselor-screen">
                {/* <CounselorVideoScreen/> */}
              </Card>
              {/* 컬러버튼 */}
              <div className="ch-game-button-right">
                <img src="/child/button-right.png" alt="button-right" />
              </div>
            </div>
          </div>
        </div>

        {/* 녹화버튼 */}
        {/* 종료버튼 */}
      </div>
    </div>
  );
}

export default ChildClassPage;
