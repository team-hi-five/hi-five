import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '/logo.png'
import SingleButtonAlert from '../../components/common/SingleButtonAlert';
import './PasswordChange.css';

function PasswordSearch() {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordChange = async () => {
        // 여기에 실제 비밀번호 변경 로직을 구현하세요
        // API 호출 등의 작업 수행

        // 비밀번호 변경 성공 시 알림창 표시
    const result = await SingleButtonAlert('비밀번호가 변경되었습니다.');

        // 알림창의 확인 버튼을 눌렀을 때
        if (result.isConfirmed) {
            // 로그인 페이지로 이동
            navigate('/');
        }
        
        // 입력 필드 초기화
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

  return (
    <div className="app-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="auth_2_logo" />
      </div>
      <Card className="p_card-container">
        <h1><strong>비밀번호 변경</strong></h1>
        <div className="input-container">
          <p>현재 비밀번호</p>
          <InputText 
            className="input-field" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="임시 비밀번호를 입력해주세요." 
          />
        </div>
        <div className="input-container">
          <p>새 비밀번호</p>
          <InputText 
            className="input-field" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요." 
          />
        </div>
        <div className="input-container">
          <p>새 비밀번호 확인</p>
          <InputText 
            className="input-field" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 한번 더 입력해주세요." 
          />
        </div>
        <div className="p_button-container">
          <Button 
            label="변경하기" 
            className="find-button2"
            onClick={handlePasswordChange}
          />
        </div>
      </Card>
    </div>
  );
}

export default PasswordSearch;