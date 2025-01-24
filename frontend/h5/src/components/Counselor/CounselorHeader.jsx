import './CounselorHeader.css';

function CounselorHeader() {
  return (
    <nav className="navbar">
      <div>
        <img src="/logo.png" alt="로고" className="logo" />
      </div>
      <ul className="nav-list">
        <li className="nav-item">우리아이들</li>
        <li className="nav-item">상담일정</li>
        <li className="nav-item">게시판</li>
        <li className="nav-item">마이데이터</li>
        <li className="nav-item">로그아웃</li>
      </ul>
    </nav>
  );
}

export default CounselorHeader;