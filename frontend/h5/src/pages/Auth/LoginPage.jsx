import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import './LoginPage.css';
import { login } from "/src/api/authService"; // ✅ 로그인 API 불러오기

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whoRU, setWhoRU] = useState('parent');
  const [error, setError] = useState(null);

  const handleUserTypeChange = (role) => {
    setWhoRU(role);
  };

  const handleLogin = async () => {
    try {
      const role = whoRU === 'parent' ? 'ROLE_PARENT' : 'ROLE_CONSULTANT';
      console.log("📢 로그인 시도:", { email, password, role });

      // ✅ `authService.js`의 `login` 함수 호출
      const data = await login(email, password, role);
      console.log("🎉 로그인 성공!", data);

      // ✅ 로그인 성공 후 페이지 이동
      navigate(whoRU === 'parent' ? '/parent' : '/counselor');
    } catch (err) {
      console.error("❌ 로그인 실패:", err.response ? err.response.data : err.message);
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="clouds">
        <img src="/cloud1-remove.png" alt="cloud1" className="cloud cloud1" />
        <img src="/cloud2-remove.png" alt="cloud2" className="cloud cloud2" />
        <img src="/cloud3-remove.png" alt="cloud3" className="cloud cloud3" />
        <img src="/cloud3-remove.png" alt="cloud1" className="cloud cloud4" />
        <img src="/cloud2-remove.png" alt="cloud2" className="cloud cloud5" />
        <img src="/cloud1-remove.png" alt="cloud3" className="cloud cloud6" />
      </div>
      <div className="login-container">
        <div className="characters-container">
          <img src="test\놀라미.png" alt="Blue character" className="character" style={{ transform: 'translateY(50px)' }}/>
          <img src="test\기쁘미.PNG" alt="Yellow character" className="character" style={{ transform: 'translateY(45px)' }}/>
          <img src="test\화나미.PNG" alt="Gray character" className="character" style={{ transform: 'translateY(38px)' }}/>
        </div>
        
        <div className="login-box">
          <img src="/logo.png" alt="Logo" className="l-logo" />
          <h2 className="subtitle">감정을 배우는 즐거운 여행</h2>
          
          <div className="tabs">
            <button 
              className={`tab ${whoRU === 'parent' ? 'active' : ''}`} 
              onClick={() => handleUserTypeChange('parent')}
            >
              학부모
            </button>
            <button 
              className={`tab ${whoRU === 'counselor' ? 'active' : ''}`}  
              onClick={() => handleUserTypeChange('counselor')}
            >
              상담사
            </button>
          </div>

          <div className="login-form">
            <span className="p-input-icon-left">
              <i className="pi pi-user" />
              <InputText
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="아이디를 입력해주세요"
                className="login-input"
              />
            </span>

            <span className="p-input-icon-left">
              <i className="pi pi-lock" />
              <InputText
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                className="login-input"
              />
            </span>

            <div className="save-id">
              <input type="checkbox" className="save-id-checkbox" />
              <span>아이디 저장하기</span>
            </div>

            {error && <p className="error-message">{error}</p>} {/* 에러 메시지 표시 */}

            <Button label="로그인" className="login-button" onClick={handleLogin} />
            
            <div className="register-link">
              <span>
                <Link to="/login/idsearch">아이디</Link> | <Link to="/login/passwordsearch">비밀번호 찾기</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
