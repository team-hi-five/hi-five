import '../Counselor/Css/CounselorHeader.css';
import { Link } from 'react-router-dom';


function CounselorHeader() {
  return (
    <nav className="co_navbar">
      <div>
        <Link to="/counselor">
          <img src="/logo.png" alt="로고" className="co_logo" />
        </Link>
      </div>
      <ul className="co_nav-list">
        <li className="co_nav-item">
          <Link to="/counselor/children">우리아이들</Link>
        </li>
        <li className="co_nav-item">
          <Link to="/counselor/schedule">상담일정</Link>
        </li>
        <li className="co_nav-item">게시판</li>
        <li className="co_nav-item">
          <Link to="/counselor/mypage">마이페이지</Link>
        </li>
        <li className="co_nav-item">
          <Link to="/">로그아웃</Link>
        </li>
      </ul>
    </nav>
  );
}

export default CounselorHeader;