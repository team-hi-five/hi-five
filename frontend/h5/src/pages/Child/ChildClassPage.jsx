import "./ChildCss/ChildClassPage.css"
import useGameStore from "../../store/gameStore";
import { limitGamedata } from "../../api/childGameContent";
import { useEffect, useState, useRef } from "react";
import { Card } from "primereact/card";
import * as faceapi from "face-api.js";
import stringSimilarity from "string-similarity";
import Swal from "sweetalert2";
import { BsStopBtnFill } from "react-icons/bs";

function ChildReviewGamePage() {
  
    // 동영상 재생용 ref
    const videoRef = useRef(null);
    // 웹캠 분석용 video ref (오픈비두로 바꾸기)
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
  const [currentGameData, setCurrentGameData] = useState(null)
  const [phase, setPhase] = useState("video");                  // 비디오 상태관리
  const [showContent, setShowContent] = useState(false);        // 모달 확인 후 내용 보여주는 상태관리
  // 단계(phase) 상태  
  // "video": 영상 재생 중  
  // "analysisModal": 분석 전 모달 (표정, 음성 동시에 안내)  
  // "analysis": 표정 및 음성 분석 진행 중  
  // "analysisResult": 표정 및 음성 결과 표시
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 한 사이클의 분석 결과 저장 (두 사이클 진행)
  const [faceResult, setFaceResult] = useState(null);
  const [voiceResult, setVoiceResult] = useState(null);
  // 몇 번째 분석 사이클인지 (1 또는 2)
  const [analysisCycle, setAnalysisCycle] = useState(1);
    // --- 1. API를 통해 동영상 데이터 로드 ---
  useEffect(() => {
    const fetchLimitData = async () => {
      try {
        const data = await limitGamedata(childId);
        setGameIdData("가져온 정보",data);
        if (data) {
          console.log("Fetched Data:", data);
          await useGameStore.getState().fetchChapterData(data.chapter);
          setChapterAndStage(data.chapter, data.stage);
          
          
          const currentState = useGameStore.getState();
          console.log("currenState", currentState)
          setGameState(currentState);
        }

        const gameData = useGameStore.getState().getCurrentGameData();
        console.log("현재게임데이터", gameData)
        setCurrentGameData(gameData)

      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLimitData();
  }, [childId]);

  // 현재데이터가 변경될 때마다 실행
  useEffect(() => {
    if (currentGameData) {
      console.log("업데이트된 currentGameData:", currentGameData);
      console.log(currentGameData?.chapterId)
    }
  }, [currentGameData]); 


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
  
  
  // --- 3. 웹캠 스트림 시작 ----------------------------
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

  // --- 4. 시작 버튼 누른 후 시작---------------------
  useEffect(() => {
    Swal.fire({
      title: "감정아! 같이 공부해 볼까?",
      imageUrl: "/child/character/againCh.png",
      imageWidth: 200,
      imageHeight: 200,
      showConfirmButton: true,
    }).then((result) => {
      if(result.isConfirmed){
        setShowContent(true);
        if (videoRef.current) {
          videoRef.current.play(); // 비디오 시작
        }
      }
    });
  }, []);


  // --- 모달: 분석 전 (표정, 음성 동시에 안내) ---
  useEffect(() => {
    if (phase === "analysisModal") {
      if (analysisCycle === 1) {  // 첫 번째 종합감정 분석에서만 모달 표시
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
      } else {
        // 다른 사이클에서는 모달 없이 바로 분석 시작
        setPhase("analysis");
        runConcurrentAnalysis();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, analysisCycle]);

    // --- 비디오 끝 감정 분석 시작 ----------------------------

    const handleVideoEnd = () => {
      setPhase("analysisModal");  // 비디오가 끝난 후 분석 상태로 변경
      // 추가적인 분석 로직을 여기서 처리할 수 있습니다.
    };


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
          const voiceMsg =
            bestOptionIndex === currentGameData.answer - 1
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
        }, 9000);
      });
  
      try {
        const [faceMsg, voiceMsg] = await Promise.all([facePromise, voicePromise]);
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
        // 결과를 보여주는 모달
        if (analysisCycle <= 2) {
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
                // 첫 번째 종합감정 분석 결과 확인
                if (faceResult.includes("정답") && voiceResult.includes("정답")) {
                  // 모두 맞았으면 표정 연습으로
                  Swal.fire({
                    title: "이제 표정 연습을 해볼까요?",
                    text: "거울을 보면서 천천히 따라해보세요!",
                    imageUrl: "/child/character/againCh.png",
                    imageWidth: 200,
                    imageHeight: 200,
                    timer: 3000,
                    showConfirmButton: false
                  }).then(() => {
                    setAnalysisCycle(3);  // 표정 분석으로
                    setFaceResult(null);
                    setVoiceResult(null);
                    setPhase("analysisModal")
    
                    // 표정 연습 후 자동으로 음성 연습으로 넘어가기
                    Swal.fire({
                      title: "이제 말 연습을 해볼까요?",
                      text: "선택지를 보고 천천히 말해보세요!",
                      imageUrl: "/child/character/againCh.png",
                      imageWidth: 200,
                      imageHeight: 200,
                      timer: 3000,
                      showConfirmButton: false
                    }).then(() => {
                      setAnalysisCycle(4);
                      setVoiceResult(null);
                      setPhase("analysisModal");
                    });
                  });
                } else {
                  // 틀린 게 있으면 다시 연습
                  Swal.fire({
                    title: "한 번 더 연습해볼까요?",
                    text: "다시 한 번 표정과 말을 해보세요!",
                    imageUrl: "/child/character/againCh.png",
                    imageWidth: 200,
                    imageHeight: 200,
                    timer: 3000,
                    showConfirmButton: false
                  }).then(() => {
                    setAnalysisCycle(2);  // 두 번째 종합감정으로
                    setFaceResult(null);
                    setVoiceResult(null);
                    setPhase("analysisModal");
                  });
                }
              } else if (analysisCycle === 2) {
                // 두 번째 종합감정 후에는 무조건 표정 분석으로
                Swal.fire({
                  title: "이제 표정 연습을 해볼까요?",
                  text: "거울을 보면서 천천히 따라해보세요!",
                  imageUrl: "/child/character/againCh.png",
                  imageWidth: 200,
                  imageHeight: 200,
                  timer: 3000,
                  showConfirmButton: false
                }).then(() => {
                  setAnalysisCycle(3);  // 표정 분석으로
                  setFaceResult(null);
                  setVoiceResult(null);
                  setPhase("analysisModal");
    
                  // 표정 연습 후 자동으로 음성 연습으로 넘어가기
                  Swal.fire({
                    title: "이제 말 연습을 해볼까요?",
                    text: "선택지를 보고 천천히 말해보세요!",
                    imageUrl: "/child/character/againCh.png",
                    imageWidth: 200,
                    imageHeight: 200,
                    timer: 3000,
                    showConfirmButton: false
                  }).then(() => {
                    setAnalysisCycle(4);
                    setVoiceResult(null);
                    setPhase("analysisModal");
                  });
                });
              }
            }
          });
        } else if (analysisCycle === 4) {
          if (currentGameData.gameStageId === 5) {
            // 마지막 스테이지인 경우
            Swal.fire({
              title: "정말 잘했어요!",
              text: "모든 단원을 완료했어요!",
              imageUrl: "/child/character/againCh.png",
              imageWidth: 200,
              imageHeight: 200,
              showConfirmButton: true,
              confirmButtonText: "확인"
            }).then(() => {
              setAnalysisCycle(1);
              setFaceResult(null);
              setVoiceResult(null);
              setPhase("video");
            });
          } else {
            // 다음 스테이지가 있는 경우
            Swal.fire({
              title: "정말 잘했어요!",
              text: "다음 단원으로 이동할까요?",
              imageUrl: "/child/character/againCh.png",
              imageWidth: 200,
              imageHeight: 200,
              showConfirmButton: true,
              confirmButtonText: "다음 단원으로",
            }).then(async (result) => {
              if (result.isConfirmed) {
                // 다음 단원으로 이동
                await NextChapter();  // await로 새 데이터 로드 완료 대기
                // NextChapter 완료 후 상태 초기화
                setAnalysisCycle(1);
                setFaceResult(null);
                setVoiceResult(null);
                setPhase("video");
              } 
            });
          }
        }
      }
    }, [phase, analysisCycle, faceResult, voiceResult, currentGameData?.gameStageId]);
    
    





  // --- 제어 기능 ------------------------------

  // 정지
  const StopVideo = () => {
    // 1. 비디오 상태 토글
    if (videoRef.current) {
      if (isPlaying) {
        // 현재 재생 중이라면 정지
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        // 현재 정지 상태라면 재생
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  
    // 2. 진행중인 분석이 있다면 중지
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  // 다음 단원으로 이동
  const NextChapter = async () => {
    const nextStageId = currentGameData.gameStageId +1;
    if (nextStageId > 5) {
      // 5단원 끝에 도달시
      Swal.fire({
        title: `${currentGameData.chapterId}단계 마지막이에요!`,
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        confirmButtonText: "확인",
      })
      return;
    }
    setChapterAndStage(currentGameData.chapterId, nextStageId);
    console.log("다음단원으로 이동: ", currentGameData.chapterId, nextStageId)

    // 새 데이터를 불러옴
    const gameData = await useGameStore.getState().getCurrentGameData();
    console.log("업데이트된 게임 데이터:", gameData);
    setCurrentGameData(gameData);
    // 초기화
    setCurrentGameData(gameData);
    setPhase("video");  
    setAnalysisCycle(1);  
    setIsPlaying(false);
  };

  // 이전 단원으로 이동
  const PrevChapter = async() => {
    const prevStageId = currentGameData.gameStageId - 1;
    if (prevStageId > 0) {
      setChapterAndStage(currentGameData.chapterId, prevStageId); 
      console.log("이전 단원으로 이동:", currentGameData.chapterId, prevStageId);
    }
    // 새 데이터를 불러옴
    const gameData = await useGameStore.getState().getCurrentGameData();
    console.log("업데이트된 게임 데이터:", gameData);
    setCurrentGameData(gameData);

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
          {/*  비디오 종료 후 출력 메세지 */}
          <Card className="ch-learning-message-screen">
              <div className="learning-message">
                {phase === "analysis" && (
                  // 분석 중일 때는 항상 표시
                  <h3>분석 중입니다...</h3>
                )}
                {phase === "analysisResult" && analysisCycle > 2 && (
                  // 종합감정(cycle 1,2)이 아닌 경우에만 결과 텍스트로 표시
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
                  <div key={index} className="option-item">
                    <img
                      src={imgSrc}
                      alt={`option ${index + 1}`}
                      className="option-image"
                    />
                    <p className="option-text">
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
    <div>
      {/* 버튼 */}
    </div>
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
            height: "350px",
            marginTop: "4px",
            transform: "scaleX(-1)",
            borderRadius:"1%"
          }}
        />
      </Card>
      <div className="ch-learning-middle-section"></div>
      <div className="ch-learning-bottom-section">
        <div className="ch-learning-button-left">
          <img src="/child/button-left.png" alt="button-left" onClick={PrevChapter} />
          <p> 이전 단원</p>
        </div>
        <Card className="ch-learning-counselor-screen"> 상담사화면  </Card>
          <div className="ch-learning-button-right">
            <img src="/child/button-right.png" alt="button-right" onClick={NextChapter}/>
            <p>다음 단원</p>
            <BsStopBtnFill onClick={StopVideo} className="ch-learning-stop-icon"/>
          </div>
      </div>
    </div>
  </div>
</div>

    );
}
export default ChildReviewGamePage;
