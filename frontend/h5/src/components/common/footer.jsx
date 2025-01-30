import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className='footer_container'>
        <span>
          <img src="/logo.png" alt="로고" className="co_footer_logo" />
        </span>
        <ul className="footer-links">
          <li>개인정보처리방침</li>
          <li>이용약관</li>
          <li>FAQ</li>
          <li>공지사항</li>
          <li>찬환과아이들</li>
        </ul>
      </div>
      <hr />
      <p className="copyright">©2025 CZ05 ssafy. All rights reserved.</p>
    </footer>
  );
}

export default Footer;