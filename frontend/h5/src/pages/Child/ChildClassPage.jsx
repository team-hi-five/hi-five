import { useNavigate } from 'react-router-dom';

function ChildClassPage() {
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

export default ChildClassPage