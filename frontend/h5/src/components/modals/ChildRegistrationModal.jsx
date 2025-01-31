import { useState, useRef } from 'react';
import './ChildRegistrationModal.css';
import DoubleButtonAlert from '../common/DoubleButtonAlert';
import SingleButtonAlert from '../common/SingleButtonAlert';

const RegistrationModal = ({ onClose }) => {
  const fileInputRef = useRef(null);  // 파일 입력을 위한 ref 추가
  const [selectedFile, setSelectedFile] = useState(null);  // 선택된 파일 상태
  const [previewUrl, setPreviewUrl] = useState(null);  // 이미지 미리보기 URL 상태
  const [formData, setFormData] = useState({
    studentName: '',
    contactNumber: '',
    email: '',
    childName: '',
    gender: '',
    birthdate: '',
    interests: '',
    otherInfo: '',
    counselor: '',
    center: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  
    await SingleButtonAlert('회원 등록이 완료되었습니다.');
    onClose();  // 폼 제출 후 모달 닫기
  };

  const handleGenderChange = (e) => {
    setFormData({ ...formData, gender: e.target.value });
  };

  // 이메일 중복 확인 함수
const handleEmailCheck = async () => {
  // 실제로는 여기서 서버와 통신하여 중복 여부를 확인해야 합니다
  const isDuplicate = true; // 예시로 중복된 것으로 가정

  if (isDuplicate) {
    const result = await DoubleButtonAlert('이미 있는 계정입니다.<br>아동을 추가하시겠습니까?');
    if (result.isConfirmed) {
      // '네' 버튼 클릭 시 실행할 로직
      console.log('아동 추가 진행');
    } else {
      // '아니오' 버튼 클릭 시 실행할 로직
      console.log('아동 추가 취소');
    }
  }
};

// 파일 선택 핸들러
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    setSelectedFile(file);
    // 이미지 미리보기 URL 생성
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
    setFormData({
      ...formData,
      photoFile: file
    });
  }
};

// 파일 선택 버튼 클릭 핸들러
const handleFileButtonClick = () => {
  fileInputRef.current.click();
};


  return (
    <div className="r-modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="r-modal-header">
          <h2 className="modal-title">회원등록</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          {/* 학부모 정보 섹션 */}
          <section className="info-section">
            <h3 className="section-title">학부모 정보</h3>
            <div className="input-group">
              <div className="input-row">
                <div className="r-input-field">
                  <label>학부모 이름</label>
                  <input 
                    type="text"
                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                  />
                </div>
                <div className="r-input-field">
                  <label>연락처</label>
                  <input 
                    type="text"
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  />
                </div>
              </div>
              <div className="r-input-field">
                <label>이메일</label>
                <div className="email-input-container">
                    <input 
                        type="email"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <button 
                        type="button" 
                        className="email-check-button"
                        onClick={handleEmailCheck}
                    >
                    중복확인
                    </button>
                </div>
              </div>
            </div>
            <hr />
          </section>

          {/* 아동 정보 섹션 */}
          <section className="info-section">
            <h3 className="section-title">아동 정보</h3>
            <div className="cchild-info">
              <div className="photo-upload">
                <div className="photo-circle">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Selected preview" 
                        className="preview-image"
                      />
                    ) : (
                      <span>사진</span>
                    )}
                  </div>
                  <div className="upload-controls">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button" 
                    className="file-select-button"
                    onClick={handleFileButtonClick}
                  >
                    파일선택
                  </button>
                  <span className="file-name">
                    {selectedFile ? selectedFile.name : '선택된 파일 없음'}
                  </span>
                </div>
              </div>
              
              <div className="input-row">
                <div className="r-input-field">
                  <label>아이 이름</label>
                  <input 
                    type="text"
                    onChange={(e) => setFormData({...formData, childName: e.target.value})}
                  />
                </div>
                <div className="r-input-field">
                  <label>성별</label>
                  <select onChange={handleGenderChange}>
                    <option value="">성별을 선택하세요</option>
                    <option value="male">남자</option>
                    <option value="female">여자</option>
                  </select>
                </div>
              </div>
              
              <div className="r-input-field">
                <label>첫 상담날짜</label>
                <div className="date-input">
                  <input 
                    type="date"
                    onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <hr />
          </section>

          {/* 추가 정보 섹션 */}
          <section className="info-section">
            <h3 className="section-title">추가 정보</h3>
            <div className="input-group">
              <div className="r-input-field">
                <label>관심사</label>
                <input 
                  type="text"
                  onChange={(e) => setFormData({...formData, interests: e.target.value})}
                />
              </div>
              <div className="r-input-field">
                <label>기타사항</label>
                <input 
                  type="text"
                  onChange={(e) => setFormData({...formData, otherInfo: e.target.value})}
                />
              </div>
            </div>
            <hr />
          </section>

          {/* 센터 정보 섹션 */}
          <section className="info-section">
            <h3 className="section-title">센터 정보</h3>
            <div className="input-row">
              <div className="r-input-field">
                <label>담당 상담사</label>
                <input 
                  type="text"
                  onChange={(e) => setFormData({...formData, counselor: e.target.value})}
                />
              </div>
              <div className="r-input-field">
                <label>담당 센터</label>
                <input 
                  type="text"
                  onChange={(e) => setFormData({...formData, center: e.target.value})}
                />
              </div>
            </div>
          </section>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button type="submit" className="r-submit-button">
                등록!!
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;