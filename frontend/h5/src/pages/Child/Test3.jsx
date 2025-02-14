import "./ChildCss/ChildReviewGamePage.css";
import useGameStore from "../../store/gameStore";
import { Card } from "primereact/card";
import { useEffect, useState, useRef } from "react";
import { limitGamedata } from "../../api/childGameContent";
import { OpenVidu } from 'openvidu-browser';
import api from "../../api/api"
import * as faceapi from "face-api.js";
import stringSimilarity from "string-similarity";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ChildVideoScreen from "../../components/OpenviduSession/ChildVideoScreen"

function ChildClassPage() {
  // 상태관리 1
  const childId = sessionStorage.getItem("childId");
  const { setChapterAndStage, getCurrentGameData } = useGameStore();
  const [gameState, setGameState] = useState(null);
  const [gameIdData, setGameIdData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  // const [subscribers, setSubscribers] = useState([]);
  const [publisher, setPublisher] = useState(null)
  const OV = useRef(new OpenVidu());
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // 상태관리 2
  const webcamRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const analysisDataRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [phase, setPhase] = useState("initial");
  const [attempt, setAttempt] = useState(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // 표정 결과와 음성 결과 각각 저장
  const [analysisResult, setAnalysisResult1] = useState(null);
  const [analysisResult2, setAnalysisResult2] = useState(null);
  const [faceAnalysisResult, setFaceAnalysisResult] = useState(null);
  const [voiceAnalysisResult, setVoiceAnalysisResult] = useState(null);

  // 오픈비두 토큰 받기 
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

  // 페이지가 열렸을때 데이터 가져오기 + 오픈비두 연결
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
  }, []);

  // 시작하기 초기상태
  useEffect(() => {
    if (phase === "initial") {
      Swal.fire({
        title: "감정아! 같이 공부해 볼까?",
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        showConfirmButton: true,
        confirmButtonText: "시작하기",
      }).then((result) => {
        if (result.isConfirmed) {
          setPhase("video");
          if (videoRef.current) {
            videoRef.current.play();
          }
        }
      });
    }
  }, [phase]);

    // 비디오 실행 후 
    // 녹화시작


    // 첫 번째와 두 번째 시도에서는 표정과 음성을 함께 분석
    if (phase === "recording" || phase === "secondAttempt") {
      startFaceAnalysis();
      startVoiceRecognition();
    } 
    
    // 연습 단계에서는 phase에 따라 다르게 분석
    else if (phase === "facePractice") {
      // 표정만 분석
      startFaceAnalysis();
    } 
    else if (phase === "voicePractice") {
      // 음성만 분석
      startVoiceRecognition();
    }
  };

  // 표정 인식
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

  const startRecording = () => {
    setIsRecording(true);
    
  
  const stopRecording = () => {
    setIsRecording(false);
    
    // 첫 번째와 두 번째 시도에서는 종합 결과 분석
    if (phase === "recording" || phase === "secondAttempt") {
      const result = stopAnalysisAndRecognition();
      // 종합 결과 처리
    } 
    
    // 연습 단계에서는 phase에 따라 다른 분석
    else if (phase === "facePractice") {
      const faceResult = stopFaceAnalysis();
      // 표정 결과 처리
    } 
    else if (phase === "voicePractice") {
      const voiceResult = stopVoiceRecognition();
      // 음성 결과 처리
    }
  };

  // 음성인식 결과
  const handleVoiceResult = (finalText) => {
    console.log("음성 인식 결과:", finalText);
    
    const optionsArray = gameInfos[currentVideoIndex].options;
    const bestMatch = stringSimilarity.findBestMatch(finalText, optionsArray);
    const bestOptionIndex = bestMatch.bestMatchIndex;
    
    const voiceMsg =
      bestOptionIndex === gameInfos[currentVideoIndex].answer - 1
        ? `정답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`
        : `오답입니다! 선택한 옵션은 ${optionsArray[bestOptionIndex]}입니다.`;
    
    // 필요에 따라 상태 업데이트
    setVoiceAnalysisResult(voiceMsg);
  };

  // 표정 분석 
  const stopFaceAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  
    const avgEmotion = computeAverageEmotion(analysisDataRef.current);
    if (!avgEmotion) {
      console.error("수집된 감정 데이터가 없습니다.");
      return null;
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
  
    const isFaceCorrect = bestEmotion === expectedEmotion;
  
    return {
      emotion: bestEmotion,
      expectedEmotion: expectedEmotion,
      isCorrect: isFaceCorrect
    };
  };
  // 음성분석
  const stopVoiceRecognition = () => {
    const finalText = ""; // 실제 음성 인식 결과
  
    const optionsArray = gameInfos[currentVideoIndex].options;
    const bestMatch = stringSimilarity.findBestMatch(finalText, optionsArray);
    const bestOptionIndex = bestMatch.bestMatchIndex;
  
    const isVoiceCorrect = bestOptionIndex === gameInfos[currentVideoIndex].answer - 1;
  
    return {
      text: finalText,
      selectedOption: optionsArray[bestOptionIndex],
      isCorrect: isVoiceCorrect
    };
  };
  
  const expectedEmotions = ["happy", "sad", "angry", "fearful", "surprised"];

  // 표정 분석 시작 로직
  const startFaceAnalysis = () => {
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
          setFaceAnalysisResult();
        }, 4000);
  };

  // 음성 인식 시작 로직
  const startVoiceRecognition = () => {
    if (phase === "voice1") {
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
  };

  // 표정 분석,음성인식 중지 및 결과 반환 로직
  const stopAnalysisAndRecognition = () => {
    console.log("표정 분석 및 음성 인식 중지");
    
    // 표정 분석 중지
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    // 표정 분석 결과 계산
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
  
    // 예상 표정
    const expectedEmotions = ["happy", "sad", "angry", "fearful", "surprised"];
    const expectedEmotion = expectedEmotions[currentVideoIndex] || "없음";
  
    // 음성 인식 결과 처리
    const finalText = ""; // 여기에 실제 음성 인식 결과를 넣어야 합니다
    const optionsArray = gameInfos[currentVideoIndex].options;
    const bestMatch = stringSimilarity.findBestMatch(finalText, optionsArray);
    const bestOptionIndex = bestMatch.bestMatchIndex;
  
    // 결과 평가
    const isFaceCorrect = bestEmotion === expectedEmotion;
    const isVoiceCorrect = bestOptionIndex === gameInfos[currentVideoIndex].answer - 1;
    const isOverallCorrect = isFaceCorrect && isVoiceCorrect;
  
    const result = {
      faceEmotion: bestEmotion,
      expectedEmotion: expectedEmotion,
      voiceText: finalText,
      selectedOption: optionsArray[bestOptionIndex],
      isFaceCorrect: isFaceCorrect,
      isVoiceCorrect: isVoiceCorrect,
      isOverallCorrect: isOverallCorrect
    };
  
    // 첫 번째 시도에서 성공하면
    if (attempt === 1 && isOverallCorrect) {
    // 바로 다음 연습 단계로 이동
    setPhase("facePractice");
    } 
    // 첫 번째 시도에서 실패하면
    else if (attempt === 1 && !isOverallCorrect) {
      // 두 번째 시도 기회 제공
      setAttempt(2);
      setPhase("secondAttempt");

      // 첫 시도 실패 시 정답 안내 추가
      Swal.fire({
        title: "다시 한 번 해볼까요?",
        icon: "info",
        timer: 2000,
        showConfirmButton: true,
      });
    } 
    // 두 번째 시도에서
    else if (attempt === 2) {
    if (isOverallCorrect) {
      // 성공하면 바로 연습 단계로
      // 정답
      Swal.fire({
        title: "정답이에요!",
        text: "이제 연습을 해볼까요?",
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        timer: 2000,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          setPhase("practice");
        }
      });

    } else {
      // 실패하면 연습 단계로 (다만 좀 더 도움을 줄 수 있는 로직 필요)
      Swal.fire({
        title: "정답이에요!",
        text: "이제 연습을 해볼까요?",
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        timer: 2000,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          setPhase("practice");
        }
      });
    }

     // 결과 저장
  if (attempt === 1) {
    setAnalysisResult1({
      ...result,
      // 첫 시도 성공 여부 추가
      isFirstAttemptSuccess: isOverallCorrect 
    });
  } else {
    setAnalysisResult2({
      ...result,
       // 첫 시도에 실패했으므로 false
      isFirstAttemptSuccess: false
    });
  }
  return result;
  };

  

  useEffect(() => {
    if (phase === "practice") {
      Swal.fire({
              title: "상황과 어울리는 표정정을 해볼까요~?",
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

  // 녹화 시작 & 표정인식 로직
  const startFacePractice = () => {
    startRecording(); // 녹화 시작
    startFaceAnalysis()
  };

  // 말하기기 연습 알림
  const handleFacePracticeComplete = () => {
    Swal.fire({
      title: "이제 말을 해볼까요?",
      imageUrl: "/child/character/againCh.png",
      imageWidth: 200,
      imageHeight: 200,
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      setPhase("voicePractice");
    });
  };

  // 말하기 연습 시작
  const startVoicePractice = () => {
    startRecording(); // 녹화 시작
    startVoiceRecognition()
  };

// 음성 인식 완료 후 호출되는 함수
const handleVoiceRecognitionComplete = () => {

  // 카드 모달 표시
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
    }
  }).then(() => {
    // 카드 모달 완료 후 다음 단계로 진행
    handleVoicePracticeComplete();
  });
};

};


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
                onEnded={() => setPhase("recording")}
              />
            </div>
            <div>progressbar</div>
            <div className="ch-game-button">
              {currentGameData.options.map((option, index) => (
                <div key={index}>
                  <h4 className="ch-options-number">
                    {["①", "②", "③"][index]}
                  </h4>
                  <div className={`ch-option`}>
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
        <div className="ch-review-game-right">
          <div className="ch-game-face-screen">
            <div className="ch-game-Top-section">
              <div className="ch-game-child-video-screen">
                <ChildVideoScreen session={session} publisher={publisher}/>
              </div>
            </div>
            <div className="ch-game-middle-section"></div>
            <div className="ch-game-bottom-section">
              <div className="ch-game-button-left">
                <div>
                  <img src="/child/button-left.png" alt="button-left" />
                  {phase === "video" && <button onClick={() => setPhase("recording")}>녹화 준비</button>}
                  {(phase === "recording" || phase === "secondAttempt") && (
                    <button onClick={isRecording ? stopRecording : startRecording}>
                      {isRecording ? "녹화 중지" : "녹화 시작"}
                    </button>
                  )}
                  <button onClick={moveToPrevStage} disabled={gameIdData.stage === 1}>
                    이전 단원
                  </button>
                  <button onClick={moveToNextStep} disabled={gameIdData.stage === 5}>
                    다음 단원
                  </button>
                  <button onClick={exitGame}>종료</button>
                </div>
              </div>
              <Card className="ch-game-counselor-screen">
                {phase === "recording" && <p>표정과 말을 분석 중입니다...</p>}
                {phase === "secondAttempt" && <p>다시 한 번 시도해보세요!</p>}
                {phase === "facePractice" && <p>표정을 따라해보세요!</p>}
                {phase === "voicePractice" && <p>말을 따라해보세요!</p>}
                {analysisResult && (
                  <div>
                    <p>표정 분석 결과: {analysisResult.faceResult}</p>
                    <p>음성 분석 결과: {analysisResult.voiceResult}</p>
                  </div>
                )}
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
export default ChildClassPage;