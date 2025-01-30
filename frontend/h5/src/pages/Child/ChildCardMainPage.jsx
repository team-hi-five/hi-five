import { useNavigate } from 'react-router-dom';

function ChildCardMainPage() {
    const navigate = useNavigate()

    const goback = () => {
        navigate('/child')
    } 
    return (
        <button onClick={goback}>
            back
        </button>
    );
}

export default ChildCardMainPage