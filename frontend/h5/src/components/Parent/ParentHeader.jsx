// ParentHeader.jsx
import { Link } from "react-router-dom";
import '/src/components/Parent/ParentCss/ParentHeader.css';

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
          <Link to="/parent/data">우리아이들</Link>
        </li>
        <li className="pa-nav-item">
          <Link to="/parent/schedule">상담일정</Link>
        </li>
        <li className="pa-nav-item">
          <Link to="/parent/board">게시판</Link>
        </li>
        <li className="pa-nav-item">
          <Link to="/parent/my">마이페이지지</Link>
        </li>
        <li className="pa-nav-item">
          <Link to="/">로그아웃</Link>
        </li>
      </ul>
    </nav>
  );
}

export default ParentHeader;
