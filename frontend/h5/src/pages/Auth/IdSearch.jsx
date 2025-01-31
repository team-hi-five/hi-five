import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/logo.png'
import './IdSearch.css';

const memberTypes = [
  { label: '학부모', value: '학부모' },
  { label: '상담사', value: '상담사' },
];

function IdSearch() {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();
  return (
    <>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="auth_logo" />
      </div>
      <div className="app-container">
        <Card className="Id_card-container">
          <h1><strong>아이디 찾기</strong></h1>
          <div className="input-container">
            <p>회원유형</p>
            <Dropdown className="input-field" value={selectedType} options={memberTypes} onChange={(e) => setSelectedType(e.value)} placeholder="회원유형을 선택해주세요" />
          </div>
          <div className="input-container">
            <p>이름</p>
            <InputText className="input-field" id="name" placeholder="이름을 입력해주세요." />
          </div>
          <div className="input-container">
          <p>핸드폰번호</p>
            <InputText className="input-field" id="phone"  placeholder="핸드폰 번호를 입력해주세요." />
            <div className='small-container'>
              <small>*하이픈(-)을 포함하여 작성해주세요.</small>
            </div>
          </div>
          <div className="button-container">
            <Button label="취소" className="cancel-button" onClick={() => navigate('/')} />
            <Link 
              to="/counselor/get-id" 
              className="find-button"
              >
              아이디 찾기
              </Link>
          </div>
        </Card>
      </div>
    </>
  );
}

export default IdSearch;