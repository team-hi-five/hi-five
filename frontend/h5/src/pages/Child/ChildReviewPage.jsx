import ChildGameScreen from "../../components/Child/Game/ChildGameScreen";
import ChildGameFaceScreen from "../../components/Child/Game/ChildGameFaceScreen";
import "./ChildCss/ChildReviewPage.css"

function ChildReviewPage() {

    return (
        <div className='ch-review-container'>
            <div className="ch-review-game-left">
                <ChildGameScreen/>

            </div>
            <div className="ch-review-game-right">
                <ChildGameFaceScreen/>
            </div>
        </div>
    );
}

export default ChildReviewPage