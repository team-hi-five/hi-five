import { useNavigate } from 'react-router-dom';
import ChildMainBackground from '../../components/Child/ChildMainBackground'
import './ChildCss/ChildChatbotPage.css'

function ChildChatbotPage() {
    const navigate = useNavigate()

    const goback = () => {
        navigate('/child')
    } 
    return (
        <div className='ch-chatbot-container'>
            <ChildMainBackground />
            <div className='ch-button'>
                <button onClick={goback}>
                    back
                </button>
            </div>
        </div>
    );
}

export default ChildChatbotPage