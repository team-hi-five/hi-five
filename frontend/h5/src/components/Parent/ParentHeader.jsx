import '../Parent/ParentCss/ParentHeader.css';
import { Link, NavLink } from 'react-router-dom';

function ParentHeader() {
  return (
    <nav className="pa-navbar">
      <div>
        <Link to="/parent">
          <img src="/logo.png" alt="로고" className="pa-logo" />
        </Link>
      </div>
      <ul className="pa-nav-list">
        <li className="pa-nav-item">
          <NavLink to="/parent/data">우리아이들</NavLink>
        </li>
        <li className="pa-nav-item">
          <NavLink to="/parent/schedule">상담일정</NavLink>
        </li>
        <li className="pa-nav-item">
          <NavLink to="/parent/board">게시판</NavLink>
        </li>
        <li className="pa-nav-item">
          <NavLink to="/parent/my">마이페이지</NavLink>
        </li>
        <li className="pa-nav-item">
          <Link to="/">로그아웃</Link>
        </li>
      </ul>
    </nav>
  );
}

export default ParentHeader;
