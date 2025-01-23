function ParentHeader() {
  // 간단한 인라인 스타일 정의
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: '10px 20px',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 999,
    fontFamily: "'Noto Sans', sans-serif"
  };

  const logoStyle = {
    height: '40px',
    width: 'auto',
  };

  const navListStyle = {
    listStyle: 'none',
    display: 'flex',
    gap: '20px',
    margin: 0,
    padding: 0,
  };

  const navItemStyle = {
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#1A2A4D', // 글씨색 빨강
  };

  return (
    <nav style={navbarStyle}>
      {/* 왼쪽 영역: 로고 */}
      <div>
        <img src="/logo.png" alt="로고" style={logoStyle} />
      </div>

      {/* 오른쪽 영역: 메뉴 리스트 */}
      <ul style={navListStyle}>
        <li style={navItemStyle}>우리아이들</li>
        <li style={navItemStyle}>상담일정</li>
        <li style={navItemStyle}>게시판</li>
        <li style={navItemStyle}>마이데이터</li>
        <li style={navItemStyle}>로그아웃</li>
      </ul>
    </nav>
  );
}

export default ParentHeader;
