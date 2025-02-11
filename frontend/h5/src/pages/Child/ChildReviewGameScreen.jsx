import "../ChildCss/ChildReviewGameScreen.css";
import ChildProgressBar from "./ChildProgressBar";
import PropTypes from "prop-types";
import { Card } from "primereact/card";
import Swal from "sweetalert2";
import { Dialog } from "primereact/dialog";
import { useEffect, useRef, useState } from "react";

function ChildReveiwGameScreen({ chapterId, currentData, incrementStage }) {
  

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
