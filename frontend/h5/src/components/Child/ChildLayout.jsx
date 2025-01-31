import './ChildCss/ChildLayout.css'
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

function Header(){

    const navigate = useNavigate()
    // 현재 경로 확인용
    const location = useLocation()

    // 뒤로가기 경로 막을 곳
    const preventBackPaths = ['/child', '/child/todayclass'];

    const handleBack = () => {
        if(preventBackPaths.includes(location.pathname)) {
            return;
        }else {
            navigate('.');
        }
    }

    return(
        <>
            <div className="ch-header">
                <img src="/logo.png" alt="로고" className="ch-logo" />
                <h4 className={`ch-header-back ${preventBackPaths.includes(location.pathname)? 'disabled':''}`}
                 onClick={handleBack}>뒤로가기</h4>
            </div>
            <Outlet/>
        </>
    );
}

export default Header