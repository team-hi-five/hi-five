import "./ChildCss/ChildReviewGamePage.css";
import { useLocation } from "react-router-dom";
import useGameStore from "../../store/gameStore";


function ChildReviewGamePage() {

  // 챕터 아이디 불러오기
  const location = useLocation();
  const chapterId = location.state?.chapterId
  console.log("넘어온 아이템:",location.state?.chapterId)


  // // 저장소에서 데이터 가져오기
  const { getCurrentGameData, incrementStage } = useGameStore();
  const currentData = getCurrentGameData();
  console.log(currentData)

  return (
    <></>
    // <div className="ch-review-container">
    //   <div className="ch-review-game-left">

    //      <Card className="ch-game-screen-container">
    //         <h2>
    //           {chapterId}단계 {gameStageId}단원
    //         </h2>
    //         <h3>{situation}</h3>
    //         <video ref={videoRef} src={gameVideo} className="ch-gameVideo" />
    //         <div>progressbar</div>
    //         <div className="ch-game-button">
    //           {options.map((option, index) => (
    //             <div key={index}>
    //               <h4 className="ch-options-number">{index + 1}</h4>
    //               <button className="ch-option">
    //                 <img src={optionImages[index]} alt={`option ${index + 1}`} />
    //               </button>
    //               <h4 className="ch-options-selection">{option}</h4>
    //             </div>
    //           ))}
    //         </div>
    //       </Card>
    //   </div>
    //   <div className="ch-review-game-right">
    //     <div className="ch-game-face-screen">
    //           <Card className="ch-game-Top-section">
    //             {/* <VideoScreen /> */}
    //           </Card>
    //           <div className="ch-game-middle-section"></div>
    //           {/* 컨트롤 섹션 */}
    //           <div className="ch-game-bottom-section">
    //             {/* 십자가버튼 */}
    //             <div className="ch-game-button-left">
    //               <img src="/child/button-left.png" alt="button-left" />
    //             </div>
        
    //             {/* 상담사 화면 */}
    //             <Card className="ch-game-counselor-screen"></Card>
    //             {/* 컬러버튼 */}
    //             <div className="ch-game-button-right">
    //               <img src="/child/button-right.png" alt="button-right" />
    //             </div>
    //           </div> 
    //         </div>
    //   </div>
    // </div>
  );
}


export default ChildReviewGamePage;
