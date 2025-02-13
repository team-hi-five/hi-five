import "./ChildCss/ChildReviewGamePage.css";
import useGameStore from "../../store/gameStore";
import { useLocation } from "react-router-dom";
import { Card } from "primereact/card";


function ChildClassPage(){

  const location = useLocation()
  console.log("location.state 확인:", location.state);
  const { chapterId, stageId } = location.state;
 
  const { setChapterAndStage, getCurrentGameData} = useGameStore();
  
  

  return(
    <div className="ch-review-game-container">
      <div className="ch-review-container">
        <div className="ch-review-game-left">
          <Card className="ch-game-screen-container">
            <h2>
              1단계 1단원
            </h2>
            <h3>상황</h3>
            <video src=""></video>
            <div>progressbar</div>
            {/* ①②③ ❶❷❸*/}
            {/* showanswer(true)일때 보여줘야하는 답안! */}
            <div className="ch-game-button">
              선지
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
              <Card className="ch-game-counselor-screen">상담사 웹캠</Card>
              {/* 컬러버튼 */}
              <div className="ch-game-button-right">
                <img src="/child/button-right.png" alt="button-right" />
              </div>
            </div>
          </div>
        </div>
        <div className="ch-button-container">
          {/* 단원 이동 버튼 */}
          {/* 녹화버튼 */}
          {/* 정지버튼 */}
          {/* 종료버튼 */}
        </div>
      </div>
    </div>

  )
}
export default ChildClassPage