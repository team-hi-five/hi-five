import { useNavigate } from 'react-router-dom';
import Game from '../../components/Child/Game';

function ChildReviewPage() {
    const navigate = useNavigate()

    const goback = () => {
        navigate('/child')
    } 
    return (
        <>
        <button onClick={goback}>
            back
        </button>
        <div className='ch-container'>
            <Game/>
        </div>
        </>
    );
}

export default ChildReviewPage