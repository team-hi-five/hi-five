import ChildGameScreen from "../../components/Child/Game/ChildGameScreen";
import ChildGameFaceScreen from "../../components/Child/Game/ChildGameFaceScreen";
import "./ChildCss/ChildClassPage.css"
import { useNavigate } from "react-router-dom"

function ChildClassPage() {
    const navigate = useNavigate()
    return (
        <>
            <div className='ch-class-container'>
                <div className="ch-class-game-left">
                    <ChildGameScreen/>

                </div>
                <div className="ch-class-game-right">
                    <ChildGameFaceScreen/>
                </div>
            </div>

            <button onClick={()=> navigate(-1)}
                className="ch-class-button"
                >뒤로가기</button>
        </>
    );
}

export default ChildClassPage