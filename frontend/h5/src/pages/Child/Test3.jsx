import "./ChildCss/ChildReviewGamePage.css";
import useGameStore from "../../store/gameStore";
import { Card } from "primereact/card";  // Card import 다시 추가
import { useEffect, useState, useRef} from "react";  // useRef 추가
import { limitGamedata } from "../../api/childGameContent";
import Swal from "sweetalert2";

function ChildClassPage(){

  // 상태관리 1
  const childId = sessionStorage.getItem('childId');
  const { setChapterAndStage, getCurrentGameData } = useGameStore();
  const [gameState, setGameState] = useState(null);
  const [gameIdData, setGameIdData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);

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
  }, []);

 // 상태관리 2

const [showContent, setShowContent] = useState(false);       //비디오 false이면 모달 및 내용 보여주는 상태관리
const [feedback, setFeedback] = useState(null);             // 임시(정답시 오답시 피드백)
const [showAnswer, setShowAnswer] = useState(false);        // 비디오 종료 시 정답 보여주는 상태 관리
const [currentStep, setCurrentStep] = useState(0);          // 현재 내용 스텝 인덱스
// const [attempts, setAttempts] = useState(0);
const [timer, setTimer] = useState(null);                  // 타이머

  // 제어기능
  // 녹화, 일시정지
  // const [isRecording, setIsRecording] = useState(false);
  // const webcamRef = useRef(null);
  // const mediaRecorderRef = useRef(null);
  const [isGamePaused, setIsGamePaused] = useState(false)

   useEffect(() => {
      if (!gameState) return;
      Swal.fire({
        title: "감정아! 같이 공부해 볼까?",
        imageUrl: "/child/character/againCh.png",
        imageWidth: 200,
        imageHeight: 200,
        showConfirmButton: true,
      }).then(() => {
        // 2. 모달이 사라지고 동영상 시작
        setShowContent(true);
        if (videoRef.current) {
          videoRef.current.play();
        }
      });
    }, [gameState]);


//     // 2-1.비디오 종료 감지
    useEffect(() => {
      // showContent가 false거나 비디오 참조가 없으면 실행하지 않음
      if (!showContent || !videoRef.current) return;

      const videoEnd = () => {
        console.log("비디오 종료");
        setCurrentStep(0);
        // startTimer가 정의되어 있다면 실행
        if (typeof startTimer === 'function') {
          startTimer();
        }
      };
      videoRef.current.addEventListener("ended", videoEnd);
      return () => {
        videoRef.current?.removeEventListener("ended", videoEnd);
      };
    }, [showContent]);


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
    // moveToNextStep();
  }, 3000);

  setTimer(newTimer);
};


  // 일시정지/재개 토글 함수
const togglePause = () => {
  setIsGamePaused(prev => !prev);
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
            <h2>
              {gameIdData.chapter}단계 {gameIdData.stage}단원
            </h2>
            <h3>{currentGameData?.situation}</h3>
            <video  
               ref={videoRef} 
              src={currentGameData?.gameVideo} 
              controls 
            />
          </Card>
        </div>
        {/* right */}
        <div className="ch-review-game-right">
          <div className="ch-game-face-screen">
            <Card className="ch-game-Top-section">{/* <VideoScreen /> */}</Card>
            <div className="ch-game-middle-section"></div>

            {/* 컨트롤 섹션 */}
            <div className="ch-game-bottom-section">
              {/* 십자가버튼 */}
              <div className="ch-game-button-left">
                <div>
                  <img src="/child/button-left.png" alt="button-left" />
                  <button onClick={togglePause}>
                    {isGamePaused ? "재개" : "일시정지"}
                  </button>
                </div>
              </div>
              {/* content message 표시 */}
              <Card className="ch-game-counselor-screen">상담사 웹캠</Card>
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

export default ChildClassPage;