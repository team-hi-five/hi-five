import ChildGameScreen from "../../components/Child/Game/ChildGameScreen";
import ChildGameFaceScreen from "../../components/Child/Game/ChildGameFaceScreen";
import "./ChildCss/ChildReviewGamePage.css"
import { useLocation } from "react-router-dom";

function ChildReviewGamePage() {

    const location = useLocation();
    const item = location.state?.item;


    return (
        <div className='ch-review-container'>
            <div className="ch-review-game-left">
                <ChildGameScreen
                chapterId={item.game_chapter_id}/>

            </div>
            <div className="ch-review-game-right">
                <ChildGameFaceScreen/>
            </div>
        </div>
    );
}

export default ChildReviewGamePage