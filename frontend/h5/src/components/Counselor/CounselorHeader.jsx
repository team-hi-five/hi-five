import '../Counselor/Css/CounselorHeader.css';
import { Link, NavLink } from 'react-router-dom';

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
          <NavLink to="/counselor/children">우리아이들</NavLink>
        </li>
        <li className="co_nav-item">
          <NavLink to="/counselor/schedule">상담일정</NavLink>
        </li>
        <li className="co_nav-item">
          <NavLink to="/counselor/board">게시판</NavLink>
        </li>
        <li className="co_nav-item">
          <NavLink to="/counselor/mypage">마이페이지</NavLink>
        </li>
        <li className="co_nav-item">
          <Link to="/">로그아웃</Link>
        </li>
      </ul>
    </nav>
  );
}

export default CounselorHeader;