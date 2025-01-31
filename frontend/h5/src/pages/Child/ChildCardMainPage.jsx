import { Outlet, Link } from 'react-router-dom';
import "./ChildCss/ChildCardMainPage.css"

function ChildCardMainPage() {

    return (
        <div className='ch-card-main-container'>
            <div className='ch-card-details-nav'>
                <Link to='joy'>
                <img src="\test\기쁘미.PNG" alt="joy" />
                </Link>
                <Link to='sadness'>
                <img src="\test\슬프미.png" alt="sadness" />
                </Link>
                <Link to='anger'>
                <img src="\test\화나미.PNG" alt="anger" />
                </Link>
                <Link to='fear'>
                <img src="\test\무서미.PNG" alt="fear" />
                </Link>
                <Link to='surprise'>
                <img src="\test\놀라미.png" alt="surprise" />
                </Link>
            </div>
            <Outlet/>

        </div>
    );
}

export default ChildCardMainPage