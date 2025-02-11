import "../ChildCss/ChildReviewGameScreen.css";
import ChildProgressBar from "./ChildProgressBar";
import PropTypes from "prop-types";
import { Card } from "primereact/card";
import Swal from "sweetalert2";
import { Dialog } from "primereact/dialog";
import { useEffect, useRef, useState } from "react";

function ChildReveiwGameScreen({ chapterId, currentData, incrementStage }) {
  const [showContent, setShowContent] = useState(false);
  // 모달의 상태
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // const [repeatCount, setRepeatCount] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    Swal.fire({
      title: "감정아! 같이 공부해 볼까?",
      imageUrl: "/child/character/againCh.png",
      imageWidth: 200,
      imageHeight: 200,
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      setShowContent(true);
      if (videoRef.current) {
        videoRef.current.play();
      }
    });
  }, []);

  // useEffect(()=>{
  //   if (repeatCount >= 3){
  //     incrementStage()
  //   }
  // },[repeatCount, incrementStage])

  if (!currentData) {
    return console.log("현재 데이터가 없습니다.");
  }

  const { gameStageId, gameVideo, optionImages, options, situation, answer } =
    currentData;

  const modalContents = [
    {
      header: "영상 속 감정이가 느낀 감정을 따라해 볼까요?!",
      content: "이 상황에서는 어떤 표정을 지어야할까요?",
      duration: 2000,
    },
    {
      header: "상황에 어울리는 표정을 지어볼까요?",
      duration: 15000,
      // ai 분석 필요
      isExpressionStep: true,
    },
    {
      header: "이제 상황에 어울리는 말을 표현해볼까요?",
      duration: 3000,
      // ai 분석 필요
      isExpressionStep: true,
    },
  ];

  const AiAnalysis = async () => {
    try {
      // Ai 결과 들어가기
      const isCorrect = true;

      if (isCorrect) {
        await Swal.fire({
          title: "정답이에요!",
          content: "감정 표현을 이렇게 잘하다니, 정말 대단해요!",
          imageWidth: 200,
          imageHeight: 200,
          showConfirmButton: true,
          timer: 2000,
        });
      } else {
        await Swal.fire({
          title: "정답이에요!",
          content:
            "괜찮아요! 다음번에는 더 잘 할 수 있을 거에요! 다시 해볼 까요?",
          imageWidth: 200,
          imageHeight: 200,
          showConfirmButton: true,
          timer: 2000,
        });
      }
    } catch (error) {
      console.log.error("감정분석에러!", error);
    }
  };

  return (
    <>
      <Card className="ch-game-screen-container">
        <h2>
          {chapterId}단계 {gameStageId}단원
        </h2>
        <h3>{situation}</h3>
        <video ref={videoRef} src={gameVideo} className="ch-gameVideo" />
        <div className="ch-game-progress-bar">
          <ChildProgressBar />
        </div>
        <div className="ch-game-button">
          {options.map((option, index) => (
            <div key={index}>
              <h4 className="ch-options-number">{index + 1}</h4>
              <button className="ch-option">
                <img src={optionImages[index]} alt={`option ${index + 1}`} />
              </button>
              <h4 className="ch-options-selection">{option}</h4>
            </div>
          ))}
        </div>
        {/* dialog + 정답  */}
        <Dialog
          visibal={showAnswerModal}
          onHide={(modalContents) => modalContents}
          header="영상 속 감정이가 느낀 감정을 따라해 볼까요?!"
          className="ch-review-modal-style"
          // 모달이 떠있어도 뒤에 요소들과 상호작용 가능
          modal={false}
          draggable={false}
        ></Dialog>
      </Card>
    </>
  );
}

ChildReveiwGameScreen.propTypes = {
  chapterId: PropTypes.number, // 또는 PropTypes.string (chapterId 타입에 따라)
  currentData: PropTypes.object,
  incrementStage: PropTypes.func,
  mode: PropTypes.oneOf(["learning", "review"]).isRequired,
};
export default ChildReveiwGameScreen;
