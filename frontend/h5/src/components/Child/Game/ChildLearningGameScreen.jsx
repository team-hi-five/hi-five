import "../ChildCss/ChildLearningGameScreen.css";
import ChildProgressBar from "./ChildProgressBar";
import PropTypes from "prop-types";
import { Card } from "primereact/card";
import Swal from "sweetalert2";
import { useEffect, useRef, useState } from "react";

function ChildLearningGameScreen({
  chapterId,
  currentData,
  incrementStage,
  mode,
}) {
  const [showContent, setShowContent] = useState(false);

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
      </Card>
    </>
  );
}

ChildLearningGameScreen.propTypes = {
  chapterId: PropTypes.number, // 또는 PropTypes.string (chapterId 타입에 따라)
  currentData: PropTypes.object,
  incrementStage: PropTypes.func,
  mode: PropTypes.oneOf(["learning", "review"]).isRequired,
};
export default ChildLearningGameScreen;
