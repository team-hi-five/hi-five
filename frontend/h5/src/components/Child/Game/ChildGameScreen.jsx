import "../ChildCss/ChildGameScreen.css";
import ChildProgressBar from "./ChildProgressBar";
import { Card } from "primereact/card";
import useGameStore from "../../../store/gameStore";
import {useLocation} from "react-router-dom"

function ChildGameScreen() {
  const {getCurrentGameData, incrementStage, setCurrentChapter, selectChapter } = useGameStore()

  // 챕터 아이디 불러오기기
  const location = useLocation()
  console.log(location.state?.item)
  const chapterId = location.state?.item.gameChapterId


  return (
    <>
      <Card className="ch-game-screen-container">
        <h2>1단계 1단원</h2>
        <h3>상황: 민준이가 아침에 일어나서 어린이집 가방을 메고 있다</h3>

        <div className="ch-game-progress-bar">
          <ChildProgressBar />
        </div>
        <div className="ch-game-button">
          <button>1</button>
          <button>2</button>
          <button>3</button>
        </div>
      </Card>
    </>
  );
}
export default ChildGameScreen;
