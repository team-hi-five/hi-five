import './CounselorHeader.css';
import { Link } from 'react-router-dom';


function CounselorHeader() {
  return (
    <nav className="co_navbar">
      <div>
        <img src="/logo.png" alt="로고" className="co_logo" />
      </div>
      <ul className="co_nav-list">
        <li className="co_nav-item">
          <Link to="/counselor/children">우리아이들</Link>
        </li>
        <li className="co_nav-item">상담일정</li>
        <li className="co_nav-item">게시판</li>
        <li className="co_nav-item">마이데이터</li>
        <li className="co_nav-item">로그아웃</li>
      </ul>
    </nav>
  );
}

export default CounselorHeader;