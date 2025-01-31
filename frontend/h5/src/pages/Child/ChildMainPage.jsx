import { useNavigate } from 'react-router-dom';
import './ChildCss/ChildMainPage.css'
import { Card } from 'primereact/card';
import Header from '../../components/Child/ChildLayout';
// import ChildMainBackground from '../../components/Child/ChildMainBackground';
// import { Outlet } from 'react-router-dom';

export default function BasicDemo() {

    const navigate = useNavigate();

    return (
        <div className='ch-main-container' >
            {/* <ChildMainBackground /> */}
            <Header/>
            {/* <Outlet/> */}

            <Card className='ch-login-state'>
                안녕! 000아 오늘은 어떤 감정을 만나볼까?
            </Card>

            <div className='ch-menu-container'>
                    <Card className='ch-class' onClick={() => navigate('/child/todayclass')}>
                        <h1>오늘의 수업</h1>
                        <p>선생님과 함께하는 감정게임!</p>
                    </Card>

                <Card className='ch-review' onClick={() => navigate('/child/review')}>
                    <h1>감정놀이 복습</h1>
                    <p>혼자서 다시해봐요~!</p>
                </Card>
                <Card className='ch-cardmain' onClick={() => navigate('/child/cardmain')}>
                    <h1>카드상자</h1>
                    <p>내가 모은 카드, 한번 볼까요?</p>
                </Card>
                <Card className='ch-chatbot' onClick={() => navigate('/child/chatbot')}>
                    <h1>마음이 챗봇</h1>
                    <p>마음이랑 이야기해요~!</p>
                </Card>
            </div>

        </div>

    );
}
        