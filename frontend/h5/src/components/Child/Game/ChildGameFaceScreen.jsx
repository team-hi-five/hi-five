import "../ChildCss/ChildGameFaceScreen.css";
// import VideoScreen from "../../OpenviduSession/VideoScreen";
import { Card } from "primereact/card";

function ChildGameFaceScreen() {
  return (
    <div className="ch-game-face-screen">
      <Card className="ch-game-Top-section">
        {/* <VideoScreen /> */}
      </Card>
      <div className="ch-game-middle-section"></div>
      {/* 컨트롤 섹션 */}
      <div className="ch-game-bottom-section">
        {/* 십자가버튼 */}
        <div className="ch-game-button-left">
          <img src="/child/button-left.png" alt="button-left" />
        </div>

        {/* 상담사 화면 */}
        <Card className="ch-game-counselor-screen"></Card>
        {/* 컬러버튼 */}
        <div className="ch-game-button-right">
          <img src="/child/button-right.png" alt="button-right" />
        </div>
      </div>
    </div>
  );
}
export default ChildGameFaceScreen;
