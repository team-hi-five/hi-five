import { Outlet, Link } from 'react-router-dom';
import "./ChildCss/ChildCardMainPage.css"

function ChildCardMainPage() {

    return (
        <div className='ch-card-main-container'>
            <div className='ch-card-details-nav'>
                <Link to='joy'>
                <img src="\test\기쁘미.PNG" alt="" />
                joy</Link>
                <Link to='sadness'>sadness</Link>
                <Link to='anger'>anger</Link>
                <Link to='fear'>fear</Link>
                <Link to='surprise'>surprise</Link>
            </div>
            <Outlet/>

        </div>
    );
}

export default ChildCardMainPage