import ChildGameScreen from "../../components/Child/Game/ChildGameScreen";
import ChildGameFaceScreen from "../../components/Child/Game/ChildGameFaceScreen";
import "./ChildCss/ChildReviewGamePage.css";
import { useLocation } from "react-router-dom";
import useGameStore from "../../store/gameStore";
import { useEffect } from "react";

function ChildReviewGamePage() {

  const {fetchChapterData, getCurrentGameData, incrementStage, setCurrentChapter } = useGameStore()

  // 챕터 아이디 불러오기기
  const location = useLocation()
  // console.log(location.state?.item)
  const chapterId = location.state?.item.gameChapterId
  
  // 해당 스테이지 불러오기 
  useEffect(()=>{
    if(chapterId){
      setCurrentChapter(chapterId)
      fetchChapterData(chapterId)
    }
  },[chapterId, fetchChapterData,setCurrentChapter])

  const currentData = getCurrentGameData()
  // console.log("현재데이터",currentData)
  // console.log(currentData?.gameVideo)

  return (
    <div className="ch-review-container">
      <div className="ch-review-game-left">
        <ChildGameScreen 
        chapterId={chapterId}
        currentData={currentData}
        incrementStage={incrementStage} />
      </div>
      <div className="ch-review-game-right">
        <ChildGameFaceScreen />
      </div>
    </div>
  );
}

export default ChildReviewGamePage;
