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
import CounselorCamWithChild from "../../components/OpenViduSession/CounselorCamWithChild";
import Webcam from "react-webcam";

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
  const [isStarted, setIsStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [session, setSession] = useState(null);
  const [subscriber, setSubscriber] = useState([]);
  const [publisher, setPublisher] = useState(null);
  const [screenSubscriber, setscreenSubscriber] = useState(null);
  const OV = useRef(new OpenVidu());

  // --- 0. 오픈비두 토큰 받기 -------------------------
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

  // --- 1. 세션 초기화 -------------------------
  const initializeSession = useCallback(async () => {
    try {
      const sessionInstance = OV.current.initSession();

      sessionInstance.on("streamCreated", (event) => {
        const subscriber = sessionInstance.subscribe(event.stream, undefined);
        setSubscriber(subscriber);
      });

      sessionInstance.on("streamDestroyed", (event) => {
        setSubscriber(null);
      });

      const token = await getToken();
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
      console.error("세션 초기화 오류:", error);
    }
  }, []);

  // --- 2. 화면 공유 시작 함수 -------------------------
  const createScreenShareStream = async () => {
    try {
      console.log("1. 화면 공유 시작 시도...");
      if (screenSubscriber) {
        console.log("이미 화면 공유 중입니다.");
        return;
      }
      const newScreenPublisher = OV.current.initPublisher(undefined, {
        videoSource: "screen",
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
      showConfirmButton: true,
      confirmButtonText: "확인",
    });
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

  //
  //
  // --- 동시 분석 (표정 + 음성) ------------------
  const runConcurrentAnalysis = async () => {
    console.log("[runConcurrentAnalysis] 시작");
    // 표정 분석 Promise
    const facePromise = new Promise((resolve) => {
      console.log("[facePromise] 표정 분석 시작 (9초)");
      analysisDataRef.current = [];
      const intervalId = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video) {
          const detections = await faceapi
              .detectAllFaces(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
          console.log("[facePromise] 감지:", detections);
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
        console.error("Speech Recognition 미지원");
        reject("이 브라우저는 Speech Recognition을 지원하지 않습니다.");
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
        console.error("[voicePromise] 오류:", event.error);
        resolve("음성 인식 실패");
      };
      recognition.start();
      console.log("[voicePromise] 시작됨");
    });

    try {
      const [faceMsg, voiceMsg] = await Promise.all([facePromise, voicePromise]);
      setFaceResult(faceMsg);
      setVoiceResult(voiceMsg);
      setPhase("analysisResult");
    } catch (error) {
      console.error("[runConcurrentAnalysis] 오류:", error);
    }
  };
  //
  //
  //

  //
  //
  //
  // --- 얼굴 분석만 (표정 연습) ------------------
  const runFaceAnalysis = async () => {
    console.log("[runFaceAnalysis] 시작");
    const faceMsg = await new Promise((resolve) => {
      analysisDataRef.current = [];
      const intervalId = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video) {
          const detections = await faceapi
              .detectAllFaces(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
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
  //
  //
  //

  //
  //
  //
  // --- 음성 분석만 (말 연습) ------------------
  const runVoiceAnalysis = async () => {
    console.log("[runVoiceAnalysis] 시작");
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
      recognition.onresult = (event) => {
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
        console.error("[runVoiceAnalysis] 오류:", event.error);
        resolve("음성 인식 실패");
      };
      recognition.start();
    });
    setVoiceResult(voiceMsg);
    setPhase("analysisResult");
  };
  //
  //
  //


  //
  //
  //
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
          if (result.isConfirmed) {
            if (analysisCycle === 1) {
              Swal.fire({
                title: "이제 표정 연습을 해볼까요?",
                text: "거울을 보면서 천천히 따라해보세요!",
                imageUrl: "/child/character/againCh.png",
                imageWidth: 200,
                imageHeight: 200,
                showConfirmButton: true,
                confirmButtonText: "시작하기"
              }).then(() => {
                setAnalysisCycle(3);
                setFaceResult(null);
                setVoiceResult(null);
                setPhase("analysisModal");
              });
            } else if (analysisCycle === 2) {
              Swal.fire({
                title: "이제 표정 연습을 해볼까요?",
                text: "거울을 보면서 천천히 따라해보세요!",
                imageUrl: "/child/character/againCh.png",
                imageWidth: 200,
                imageHeight: 200,
                showConfirmButton: true,
                confirmButtonText: "시작하기"
              }).then(() => {
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
          showConfirmButton: true,
          confirmButtonText: "다음으로"
        }).then(() => {
          Swal.fire({
            title: "이제 말 연습을 해볼까요?",
            text: "아래 글자를 천천히 따라해보세요!",
            imageUrl: "/child/character/againCh.png",
            imageWidth: 200,
            imageHeight: 200,
            showConfirmButton: true,
            confirmButtonText: "시작하기"
          }).then(() => {
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
            setAnalysisCycle(3);
            setFaceResult(null);
            setVoiceResult(null);
            setPhase("analysisModal");
          } else if (result.dismiss === Swal.DismissReason.cancel) {
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
              showConfirmButton: true,
              confirmButtonText: "확인",
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
                  confirmButtonText: "확인"
                });
              } else {
                Swal.fire({
                  title: "정말 잘했어요!",
                  text: "다음 단원으로 이동할까요?",
                  imageUrl: "/child/character/againCh.png",
                  imageWidth: 200,
                  imageHeight: 200,
                  showConfirmButton: true,
                  confirmButtonText: "확인"
                }).then(async () => {
                  await NextChapter();
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
  const NextChapter = async () => {
    console.log("[NextChapter] 호출됨");
    if (!currentGameData) {
      console.error("NextChapter: currentGameData가 없습니다.");
      return;
    }
    const nextStageId = currentGameData.gameStageId + 1;
    if (nextStageId > 5) {
      Swal.fire({
        title: `${currentGameData.chapterId}단계 마지막이에요!`,
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        confirmButtonText: "확인",
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
  //
  //
  //

  //
  //
  //
  // 수정된 PrevChapter 함수 (currentGameData 체크 추가)
  const PrevChapter = async () => {
    console.log("[PrevChapter] 호출됨");
    if (!currentGameData) {
      console.error("PrevChapter: currentGameData가 없습니다.");
      return;
    }
    const prevStageId = currentGameData.gameStageId - 1;
    if (prevStageId < 1) {
      console.warn("이전 단원이 없습니다.");
      return;
    }
    setChapterAndStage(currentGameData.chapterId, prevStageId);
    const gameData = await useGameStore.getState().getCurrentGameData();
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
    if (session) {
      const signalHandler = (event) => {
        console.log("[ChildReviewGamePage] Received signal:", event);
        switch (event.type) {
          case "start-chapter":
            if (!isStarted) {
              setIsStarted(true);
            }
            break;
          case "previous-stage":
            if (currentGameData) {
              PrevChapter();
            } else {
              console.warn("currentGameData가 없어 이전 단원으로 이동할 수 없습니다.");
            }
            break;
          case "next-stage":
            if (currentGameData) {
              NextChapter();
            } else {
              console.warn("currentGameData가 없어 다음 단원으로 이동할 수 없습니다.");
            }
            break;
          case "record-start":
            if (!isRecording) {
              handleStartRecording();
            }
            break;
          case "record-stop":
            if (isRecording) {
              stopRecording();
            }
            break;
          case "end-chapter":
            Swal.fire({
              title: "수업이 종료되었습니다! <br> 수고하셨습니다!",
              imageUrl: "/child/character/againCh.png",
              imageWidth: 200,
              imageHeight: 200,
              showConfirmButton: false,
              timer: 2000,
            });
            break;
          default:
            console.warn("처리되지 않은 시그널 타입:", event.type);
            break;
        }
      };

      session.on("signal", signalHandler);

      return () => {
        session.off("signal", signalHandler);
      };
    }
  }, [session, currentGameData, isRecording, isStarted]);



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
                <img src="/child/button-left.png" alt="button-left" onClick={PrevChapter} />
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
                <img src="/child/button-right.png" alt="button-right" onClick={NextChapter} />
                <p>다음 단원</p>
                <BsStopBtnFill onClick={StopVideo} className="ch-learning-stop-icon" />
                <button
                    onClick={startScreenShare}
                    disabled={screenSubscriber !== null}
                    className="game-screen-share-button"
                >
                  {screenSubscriber ? "공유 중" : "공유하기"} ✅
                </button>
                {!isRecording && (
                    <button
                        onClick={handleStartRecording}
                        className="game-screen-share-button"
                        style={{ marginTop: "10px" }}
                    >
                      녹화 시작
                    </button>
                )}
                {isRecording && (
                    <button
                        onClick={stopRecording}
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
