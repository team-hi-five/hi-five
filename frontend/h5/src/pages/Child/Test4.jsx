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