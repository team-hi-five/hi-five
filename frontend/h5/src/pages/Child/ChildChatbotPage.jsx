import { useNavigate } from 'react-router-dom';
import ChildMainBackground from '../../components/Child/ChildMainBackground'

function ChildChatbotPage() {
    const navigate = useNavigate()

    const goback = () => {
        navigate('/child')
    } 
    return (
        <>
        <button onClick={goback}>
            back
        </button>
        <ChildMainBackground />
        </>
    );
}

export default ChildChatbotPage