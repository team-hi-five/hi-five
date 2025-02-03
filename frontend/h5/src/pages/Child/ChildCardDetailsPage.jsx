import CardDetailsLayout from '../../components/Child/Card/CardDetailsLayout';
import { useLocation } from 'react-router-dom';

function ChildCardDetailsPage() {

    // 현재 페이지의 위치 가져오기 
    const location = useLocation();
    const emotion = location.state?.emotion;

    const emotionContent = () => {
        console.log(emotion)

        switch(emotion.type) {
            case 'joy':
                return(
                    <div className='ch-joy-detail-content'>
                        1
                    </div>
                );
            }
    }

    return (
        <div>
            <CardDetailsLayout emotion={emotion}/>
            {emotionContent()}
        </div>
    );
}

export default ChildCardDetailsPage