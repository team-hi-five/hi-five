import "./ChildCss/ChildClassPage.css";
import useGameStore from "../../store/gameStore";
import { limitGamedata } from "../../api/childGameContent";
import { useEffect, useState, useRef } from "react";
import { Card } from "primereact/card";
import * as faceapi from "face-api.js";
import stringSimilarity from "string-similarity";
import Swal from "sweetalert2";
import { BsStopBtnFill } from "react-icons/bs";
import { OpenVidu } from 'openvidu-browser';
import api from "../../api/api"
import ChildVideoScreen from "../../components/OpenviduSession/ChildVideoScreen"
import CounselorCam from "../../components/Counselor/CounselorCam";

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

  // 오픈비두
  const [session, setSession] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [publisher, setPublisher] = useState(null)
  const OV = useRef(new OpenVidu());

  // --- 0. 오픈비두 토큰 받기 -------------------------
    // 토큰 받기 
    async function getToken() {
      try {
        const response = await api.post('/session/join', { 
          type: 'game', 
          childId 
        });
        console.log("받은 OpenVidu 토큰:", response.data); 
        return response.data;
      } catch (error) {
        console.error('토큰 요청 실패:', error);
        throw error;
      }
    }

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
      console.log(
          "[useEffect - currentGameData] 업데이트된 currentGameData:",
          currentGameData
      );
      console.log(
          "[useEffect - currentGameData] currentGameData.chapterId:",
          currentGameData?.chapterId
      );
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
        // 모달 확인 후 video 자동 재생은 아래 useEffect에서 처리됨
      }
    });
  }, []);

  // --- phase가 "video"이고 showContent가 true일 때만 동영상 자동 재생 ---------------------
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
      console.log(
          "[useEffect - analysisModal] 현재 phase:",
          phase,
          "analysisCycle:",
          analysisCycle
      );
      if (analysisCycle === 1 || analysisCycle === 2) {
        // 기존 종합 감정 분석 (표정+음성)
        setPhase("analysis");
        runConcurrentAnalysis();
      } else if (analysisCycle === 3) {
        // 사이클 3: 표정 연습 - 얼굴 분석만 진행
        setPhase("analysis");
        runFaceAnalysis();
      } else if (analysisCycle === 4) {
        // 사이클 4: 말 연습 - 음성 분석만 진행
        setPhase("analysis");
        runVoiceAnalysis();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, analysisCycle]);

  // --- 비디오 종료 시 감정 분석 시작 ----------------------------
  const handleVideoEnd = () => {
    console.log("[handleVideoEnd] 호출됨 - 비디오 종료, phase 변경 -> analysisModal");
    setPhase("analysisModal");
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
        console.log(
            `[computeAverageEmotion] dataIndex ${dataIndex}, emotionIndex ${emotionIndex}:`,
            emotionObj
        );
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

    // 표정 분석 Promise (9초간 분석)
    const facePromise = new Promise((resolve) => {
      console.log("[facePromise] 표정 분석 시작: 9초간 분석 시작");
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
      setTimeout(() => {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
        console.log("[facePromise] 9초 분석 종료, 분석 데이터:", analysisDataRef.current);
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
        console.log("[facePromise] 분석 결과 메시지:", resultMsg);
        resolve(resultMsg);
      }, 9000);
    });

    // 음성 인식 Promise 
    const voicePromise = new Promise((resolve, reject) => {
      console.log("[voicePromise] 음성 인식 시작");
      if (
          !("webkitSpeechRecognition" in window) &&
          !("SpeechRecognition" in window)
      ) {
        console.error(
            "[voicePromise] 이 브라우저는 Speech Recognition을 지원하지 않습니다."
        );
        reject("이 브라우저는 Speech Recognition을 지원하지 않습니다.");
        return;
      }
      const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.continuous = false;

      // 타이머 설정
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
        const bestMatch = stringSimilarity.findBestMatch(
            finalResult,
            optionsArray
        );
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
      console.log(
          "[runConcurrentAnalysis] 동시 분석 완료 - faceMsg:",
          faceMsg,
          ", voiceMsg:",
          voiceMsg
      );
      setFaceResult(faceMsg);
      setVoiceResult(voiceMsg);
      setPhase("analysisResult");
      console.log("[runConcurrentAnalysis] phase 변경 -> analysisResult");
    } catch (error) {
      console.error("[runConcurrentAnalysis] 동시 분석 오류:", error);
    }
  };

  // --- 얼굴(표정) 분석만 진행 (사이클 3) ---
  const runFaceAnalysis = async () => {
    console.log("[runFaceAnalysis] 호출됨 - 얼굴 분석 시작 (표정 연습)");
    const faceMsg = await new Promise((resolve) => {
      console.log("[faceAnalysis] 표정 분석 시작: 9초간 분석 시작");
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

  // --- 음성 분석만 진행 (사이클 4) ---
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

      // 타이머 설정
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
        // 기존 종합 분석 결과 모달 (표정+음성)
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
        // 사이클 3: 얼굴(표정) 분석 결과 모달 → 자동으로 음성 분석(사이클 4)로 전환
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
          setPhase("analysisModal"); // 음성 분석 시작 (사이클 4)
        });
      })
      } else if (analysisCycle === 4) {
        // 사이클 4: 음성 분석 결과 모달 → "다시 연습해볼까요?" 모달로 전환하여
        // "다시하기" 버튼과 "다음으로 넘어가기" 버튼 선택하게 함.
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
            // 다시 표정 연습(사이클 3)으로 돌아감.
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
              timer: 2000, // 앞면 보여주는 시간
              didOpen: () => {
                // 1초 후 카드 뒤집기 시작
                setTimeout(() => {
                  const card = document.querySelector(".flip-card-inner");
                  card.style.transform = "rotateY(180deg)";
                }, 4000);
              }
            }).then(() => {
              // 🟢 카드 플립 모달이 끝난 후 다음 단원으로 이동
              if (currentGameData.gameStageId === 5) {
                Swal.fire({
                  title: "정말 잘했어요!",
                  text: "모든 단원을 완료했어요!",
                  imageUrl: "/child/character/againCh.png",
                  imageWidth: 200,
                  imageHeight: 200,
                  showConfirmButton: true,
                })
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
        })
      }
    }
  }, [phase, analysisCycle, faceResult, voiceResult, currentGameData?.gameStageId]);
  

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

                  <video
                      ref={videoRef}
                      src={currentGameData?.gameVideo ?? ""}
                      onEnded={handleVideoEnd}
                      className="ch-gameVideo"
                  />
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
                              <div key={index}
                              className="learning-option-item"

                              >
                                <img
                                    src={imgSrc}
                                    alt={`option ${index + 1}`}
                                    className="option-image"
                                />
                                <p className={`${
                                  analysisCycle < 3 
                                    ? (index + 1 === currentGameData?.answer ? 'ch-learning-before-answer' : '')
                                    : (index + 1 === currentGameData?.answer ? 'ch-learning-correct-answer' : '')
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
          <div>{/* 추가 버튼 영역 */}</div>
        </div>

        {/* 오른쪽: 웹캠 및 상담가 화면 영역 */}
        <div className="ch-review-game-right">
          <div className="ch-game-face-screen">
            <Card className="ch-game-Top-section">
            <ChildVideoScreen 
              publisher={publisher}
              session={session}
              subscribers={subscribers}
              videoRef={webcamRef}
            />
            </Card>
            <div className="ch-learning-middle-section"></div>
            <div className="ch-learning-bottom-section">
              <div className="ch-learning-button-left">
                <img src="/child/button-left.png" alt="button-left" onClick={PrevChapter} />
                <p> 이전 단원</p>
              </div>
              <Card className="ch-learning-counselor-screen">
                <CounselorCam
                  publisher={publisher}
                  session={session}
                  subscribers={subscribers}
                />
              </Card>
              <div className="ch-learning-button-right">
                <img src="/child/button-right.png" alt="button-right" onClick={NextChapter} />
                <p>다음 단원</p>
                <BsStopBtnFill onClick={StopVideo} className="ch-learning-stop-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default ChildReviewGamePage;
