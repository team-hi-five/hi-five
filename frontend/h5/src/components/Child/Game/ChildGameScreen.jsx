import '../ChildCss/ChildGameScreen.css'
import ChildProgressBar from './ChildProgressBar';
import { Card } from 'primereact/card';

function ChildGameScreen (){


    return(
        <>
            <Card className="ch-game-screen-container">
                <h2>1단계 1단원</h2>
                <h3>상황: 민준이가 아침에 일어나서 어린이집 가방을 메고 있다</h3>
                <Card className='ch-game-screen'>
                        게임스크린
                </Card>
                <div className='ch-game-progress-bar'>
                    <ChildProgressBar />
                </div>
                <div className='ch-game-button'>
                    <button>1</button>
                    <button>2</button>
                    <button>3</button>
                </div>
            </Card>
        </>
        
    )
}
export default ChildGameScreen