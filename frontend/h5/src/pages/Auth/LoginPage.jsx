import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [whoRU, setwhoRU] = useState('parent');

  const handleLogin = () => {
    if (whoRU === 'parent') {
      navigate('/parent');
    } else {
      navigate('/counselor');
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
          <img src="/logo.png" alt="Logo" className="logo" />
          <h2 className="subtitle">감정을 배우는 즐거운 여행</h2>
          
          <div className="tabs">
            <button 
              className={`tab ${whoRU === 'parent' ? 'active' : ''}`} 
              onClick={() => setwhoRU('parent')}
            >
              학부모
            </button>
            <button 
              className={`tab ${whoRU === 'counselor' ? 'active' : ''}`}  
              onClick={() => setwhoRU('counselor')}
            >
              상담사
            </button>
          </div>

          <div className="login-form">
            <span className="p-input-icon-left">
              <i className="pi pi-user" />
              <InputText
                value={id}
                onChange={(e) => setId(e.target.value)}
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