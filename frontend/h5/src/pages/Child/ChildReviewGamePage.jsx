import "./ChildCss/ChildReviewGamePage.css";
// import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGameStore from "../../store/gameStore";
import { Card } from "primereact/card";
import Swal from "sweetalert2";
import { useState, useEffect, useRef } from "react";

function ChildReviewGamePage() {
  // 챕터 아이디 불러오기

  // 데이터 넘어오는지 확인용
  // const location = useLocation();
  // const chapterId = location.state?.chapterId;
  // console.log("넘어온 아이템:", location.state?.chapterId);

  // 저장소에서 데이터 가져오기
  const { getCurrentGameData, incrementStage, setCurrentChapter } =
    useGameStore();
  const [currentData, setCurrentData] = useState(null);
  const [timer, setTimer] = useState(null); // 타이머 추가

  useEffect(() => {
    // 초기값 설정
    setCurrentChapter(1);
    const data = getCurrentGameData();
    // console.log("Zustand에서 가져온 데이터:", data);

    if (data) {
      setCurrentData(data);
    } else {
      console.warn("데이터가 없습니다.");
    }
  }, [getCurrentGameData, setCurrentChapter]);

  console.log("현재 데이터 상태:", currentData); // 상태 출력
  console.log("getCurrentGameData() 함수:", getCurrentGameData); // 함수가 정상적으로 존재하는지 확인
  console.log("Zustand 전체 상태:", useGameStore.getState());

  // 상태관리
  const navigate = useNavigate();
  const childId = sessionStorage.getItem("childId");
  const videoRef = useRef(null);
  const [showContent, setShowContent] = useState(false); // 비디오 끄고 모달 및 내용 보여주는 상태관리
  const [feedback, setFeedback] = useState(null); // 임시(정답시 오답시 피드백)
  const [selectedAnswer, setSelectedAnswer] = useState(null); // 임시
  const [showAnswer, setShowAnswer] = useState(false); // 비디오 종료 시 정답 보여주는 상태 관리
  const [currentStep, setCurrentStep] = useState(0); // 현재 내용 스텝 인덱스

  // 1. 처음 들어갔을 때 화면
  useEffect(() => {
    Swal.fire({
      title: "감정아! 같이 공부해 볼까?",
      imageUrl: "/child/character/againCh.png",
      imageWidth: 200,
      imageHeight: 200,
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      // 2. 모달이 사라지고 동영상 시작
      setShowContent(true);
      if (videoRef.current) {
        videoRef.current.play();
      }
    });
  }, []);

  // 2-1.비디오 종료 감지
  useEffect(() => {
    // 비디오 감지
    if (!videoRef.current) return;

    const videoEnd = () => {
      console.log("비디오 종료");
      setShowAnswer(true);
      setCurrentStep(0);
      startTimer();
    };

    videoRef.current.addEventListener("ended", videoEnd);
    return () => {
      videoRef.current?.removeEventListener("ended", videoEnd);
    };
  }, [videoRef.current]);

  // 3. 동영상이 끝나면 아동 표정학습 순서
  const createReviewContents = () => {
    const baseContents = [
      {
        header: "영상 속 감정이가 느낀 감정을 따라해 볼까요?!",
        content: "이 상황에서는 어떤 표정을 지어야할까요?",
        duration: 2000,
      },
    ];

    const expressionMessage = [
      "상황에 어울리는 표정을 지어볼까요?",
      "한 번 더 표정을 지어볼까요?",
    ];

    // AI 실시간 표정 분석
    const currentEmotion = "기쁨";

    expressionMessage.forEach((message) => {
      baseContents.push({
        header: message,
        content: `현재 아동의 표정: ${currentEmotion}`,
        duration: 5000,
        // ai 분석 필요
        // 아동 표정 분석 필요 : true
        isExpressionStep: true,
        type: "expression",
        feedbacks: {
          success: "감정 표현을 이렇게 잘하다니, 정말 대단해요!",
          failure: "괜찮아요! 다음번에는 더 잘 할 수 있을 거에요!",
        },
      });
    });

    const speechMessages = [
      "이제 상황에 어울리는 말을 표현해볼까요?",
      "한 번 더 말로 표현해볼까요?",
    ];

    speechMessages.forEach((message) => {
      baseContents.push({
        header: message,
        duration: 5000,
        isExpressionStep: true,
        type: "speech",
        feedbacks: {
          success: "감정 표현을 이렇게 잘하다니, 정말 대단해요!",
          failure: "괜찮아요! 다음번에는 더 잘 할 수 있을 거에요!",
        },
      });
    });
    return baseContents;
  };

  const reviewContents = createReviewContents();

  // 10초 후 자동으로 다음으로 넘어감
  const startTimer = () => {
    if (timer) clearTimeout(timer);

    const newTimer = setTimeout(() => {
      // 타이머 만료 시 실패 처리
      setFeedback(reviewContents[currentStep]?.feedbacks?.failure);
      moveToNextStep();
    }, 5000);

    setTimer(newTimer);
  };

  // 다음 콘텐츠 내용으로 이동
  const moveToNextStep = () => {
    if (currentStep < reviewContents.length - 1) {
      setCurrentStep((prev) => prev + 1);
      startTimer();
    } else {
      console.log("마지막 단계 도달. handleStageComplete() 실행");
      handleStageComplete();
    }
  };

  // 임시: 버튼 클릭 처리 (나중에 AI 분석으로 대체)
  const handleOptionClick = (index) => {
    console.log(`선택한 옵션: ${index}, 정답: ${currentData.answer}`);
    const isCorrect = index === currentData.answer;

    if (timer) clearTimeout(timer);

    // 정답인경우 피드백 메세지 지우고 다음콘텐츠로 넘어감
    // 오답일 경우 로직 그대로 실행
    if (isCorrect) {
      setTimeout(() => {
        setFeedback(reviewContents[currentStep]?.feedbacks?.success);
        moveToNextStep();
      }, 2000);
    } else {
      setFeedback(reviewContents[currentStep]?.feedbacks?.failure);
      startTimer();
    }
  };

  // 종료 스왈
  const handleStageComplete = () => {
    // 먼저 카드 앞면 보여주기
    Swal.fire({
      html: `
          <div class="flip-card">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <img src="${currentData.cardFront}" alt="card front" style="width: 200px; height: 300px; object-fit: contain; />
              </div>
              <div class="flip-card-back">
                <img src="${currentData.cardBack}" alt="card back" style="width: 200px; height: 300px; object-fit: contain; />
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
        }, 1500);
      },
      didClose: () => {
        // 카드 보여준 후 스테이지 완료 메시지
        Swal.fire({
          title: `${currentData.gameStageId}를 마쳤어요!`,
          content: `이제 ${currentData.gameStageId + 1}단원으로 출발~!`,
          imageUrl: "/child/character/againCh.png",
          imageWidth: 200,
          imageHeight: 200,
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          // 마지막 5단원 끝났을때
          if (currentData.gameStageId === 5) {
            Swal.fire({
              title: "오늘의 복습은 여기까지!",
              text: "다음에 다시 만나요~!",
              imageUrl: "/child/character/againCh.png",
              imageWidth: 200,
              imageHeight: 200,
              showConfirmButton: false,
              timer: 2000,
            }).then(() => {
              // 학습 종료 후 처리
              navigate(`/child/${childId}/review`);
            });
          } else {
            // 5단원이 아니라면 다음 챕터로 이동
            incrementStage();
            const nextData = getCurrentGameData();
            console.log(nextData);
            if (nextData) {
              setCurrentData(nextData);
            }
          }
        });
      },
    });
  };

  if (!currentData) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="ch-review-game-container">
      <div className="ch-review-container">
        <div className="ch-review-game-left">
          <Card className="ch-game-screen-container">
            <h2>
              {currentData.chapterId}단계 {currentData.gameStageId}단원
            </h2>
            <h3>{currentData.situation}</h3>
            <video
              ref={videoRef}
              src={currentData.gameVideo}
              className="ch-gameVideo"
            />
            <div>progressbar</div>
            {/* ①②③ ❶❷❸*/}
            {/* showanswer(true)일때 보여줘야하는 답안! */}
            <div className="ch-game-button">
              {currentData.options.map((option, index) => (
                <div key={index}>
                  <h4 className="ch-options-number">
                    {["①", "②", "③"][index]}
                  </h4>
                  <button
                    className={`ch-option ${
                      showAnswer && index === currentData.answer
                        ? "correct-answer"
                        : ""
                    }`}
                    onClick={() => handleOptionClick(index)}
                  >
                    <img
                      src={currentData.optionImages[index]}
                      alt={`option ${index + 1}`}
                    />
                  </button>
                  <h4 className="ch-options-selection">{option}</h4>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="ch-review-game-right">
          <div className="ch-game-face-screen">
            <Card className="ch-game-Top-section">{/* <VideoScreen /> */}</Card>
            <div className="ch-game-middle-section"></div>

            {/* 컨트롤 섹션 */}
            <div className="ch-game-bottom-section">
              {/* 십자가버튼 */}
              <div className="ch-game-button-left">
                <img src="/child/button-left.png" alt="button-left" />
              </div>

              {/* content message 표시 */}
              <Card className="ch-game-counselor-screen">
                {showAnswer && reviewContents[currentStep] && (
                  <div className="review-message">
                    <h3>{reviewContents[currentStep].header}</h3>
                    <p>{reviewContents[currentStep].content}</p>
                    {reviewContents[currentStep].isExpressionStep && (
                      <div className="feedback-message">
                        {/* AI 분석 결과에 따른 피드백 메시지 */}
                        {feedback ? (
                          <p>{feedback}</p>
                        ) : (
                          <p>{reviewContents[currentStep].feedbacks.success}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
              {/* 컬러버튼 */}
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
