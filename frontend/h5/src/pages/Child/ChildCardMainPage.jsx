import { useNavigate } from 'react-router-dom';

function ChildCardMainPage() {
    const navigate = useNavigate()

    const goback = () => {
        navigate('/child')
    } 
    return (
        <div>
            <div className='ch-button'>
                <button onClick={goback}>
                    back
                </button>
            </div>
            <div className='ch-card-main-title'>
                <h1>내가 모은 감정 카드</h1>
            </div>

        </div>
    );
}

export default ChildCardMainPage