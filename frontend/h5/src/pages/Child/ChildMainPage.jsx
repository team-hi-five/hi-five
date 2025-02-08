import { useNavigate, useParams } from 'react-router-dom';
import './ChildCss/ChildMainPage.css'
import { Card } from 'primereact/card';
import ChildMainBackground from '../../components/Child/ChildMainBackground';
// import { Outlet } from 'react-router-dom';


/* //✅ api 호출과 변수 관리에 필요한 import ✅
import { getParentChildren } from "/src/api/userParent";
import { useState, useEffect } from 'react';
*/ //❌ api 호출과 변수 관리에 필요한한 import ❌

function ChildMainPage() {

    const navigate = useNavigate();
    const { childId } = useParams();

    /* //✅ api 호출, 호출된 data 중 childId와 일치하는 아이 이름 꺼내오기기 ✅
    const [ingredientsList, setIngredientsList] = useState([]);
    const [childName, setChildName] = useState("");

    useEffect(() => {
        async function getChildName() {
          try {
            const childrenData = await getParentChildren();
            setIngredientsList(childrenData);
            const matchedChild = childrenData.find(child => String(child.childUserId) === String(childId));
            if (matchedChild) {
                console.log("✅ 선택된 아동 이름:", matchedChild.childUserName);
                setChildName(matchedChild.childUserName); 
            } else {
                console.log("⚠️ 일치하는 아동을 찾을 수 없습니다.");
            }
          } catch (error) {
            console.error("❌ 아이 목록 불러오기 실패:", error);
          }
        }
        getChildName();
    }, ); 
    */ //❌ api 호출, 호출된 data 중 childId와 일치하는 아이 이름 꺼내오기기 ❌
    
    return (
        <div className='ch-main-container' >
            {/* <ChildMainBackground /> */}
            {/* <Outlet/> */}
        <ChildMainBackground />
            <div className='ch-main-foreground'>
                    <Card className='ch-login-state'>
                        안녕! {childId || "아동 없음"}아 오늘은 어떤 감정을 만나볼까?
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

        </div>

    );
}
        
export default ChildMainPage