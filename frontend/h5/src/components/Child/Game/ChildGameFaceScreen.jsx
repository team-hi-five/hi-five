import '../ChildCss/ChildGameFaceScreen.css'
import { Card } from 'primereact/card';

function ChildGameFaceScreen (){

    return(
        <div className='ch-game-face-screen'>
            <Card className='ch-game-Top-section'>
                <Card className='ch-game-child-screen'>
                    아동 이미지
                </Card>
            </Card>
            <div className='ch-game-middle-section'></div>
            {/* 컨트롤 섹션 */}
            <div className="ch-game-bottom-section">
                {/* 십자가버튼 */}
                <div className="ch-game-button-left">
                    <img src="/Child/button-left.png" alt="button-left" />
                </div>

                {/* 상담사 화면 */}
                <Card className='ch-game-counselor-screen'>
                    상담사 화면
                </Card>
                {/* 컬러버튼 */}
                <div className="ch-game-button-right">
                    <img src="/Child/button-right.png" alt="button-right" />
                </div>    
            </div>
        </div>
    )
}
export default ChildGameFaceScreen