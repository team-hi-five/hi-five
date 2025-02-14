import "./ChildCss/ChildReviewGamePage.css";
import useGameStore from "../../store/gameStore";
import { Card } from "primereact/card"; // Card import 다시 추가
import { useEffect, useState, useRef } from "react"; // useRef 추가
import { limitGamedata } from "../../api/childGameContent";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
// import { ChildVideoScreen } from "../../components/OpenviduSession/ChildVideoScreen";
// import { CounselorVideoScreen } from "../../components/OpenviduSession/CounselorVideoScreen";

function ChildClassPage() {
  // 상태관리 1
  const childId = sessionStorage.getItem("childId");
  const { setChapterAndStage, getCurrentGameData } = useGameStore();
  const [gameState, setGameState] = useState(null);
  const [gameIdData, setGameIdData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [session, setSsession] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const videoRef = useRef(null);
  const navigate = useNavigate();

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
            <Card className="ch-game-Top-section">
              {/* <ChildVideoScreen /> */}
            </Card>
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
