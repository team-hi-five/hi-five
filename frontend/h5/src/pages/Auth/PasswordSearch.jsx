import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '/logo.png'
import './PasswordSearch.css';

const memberTypes = [
  { label: '학부모', value: '학부모' },
  { label: '상담사', value: '상담사' },
];

function PasswordSearch() {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();
  return (
    <div className="app-container">
      <div className="logo-container2">
        <img src={logo} alt="Logo" className="auth_2_logo" />
      </div>
      <Card className="p_card-container3">
        <h1><strong>비밀번호 찾기</strong></h1>
        <div className="input-container">
          <p>회원유형</p>
          <Dropdown className="input-field" value={selectedType} options={memberTypes} onChange={(e) => setSelectedType(e.value)} placeholder="회원유형을 선택해주세요" />
        </div>
        <div className="input-container">
          <p>이름</p>
          <InputText className="input-field" id="name" placeholder="이름을 입력해주세요." />
        </div>
        <div className="input-container">
         <p>아이디</p>
         <InputText className="input-field" id="input_id" placeholder="아이디를 입력해주세요." />
        </div>
        <div className="p_button-container">
          <Button label="취소" className="cancel-button" onClick={() => navigate('/')}/>
          <Button label="비밀번호 찾기" className="find-button" onClick={() => navigate('/login/passwordfind')}/>
        </div>
      </Card>
    </div>
  );
}

export default PasswordSearch;