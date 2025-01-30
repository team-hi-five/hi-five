import './DeleteChildModal.css'

const DeleteChildModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const deleteRequests = [
    {
        id: 1,
        childName: '김민준',
        age: 7,
        parentName: '이영희',
        imageUrl: '/kid.png',
        gender: '여',
        birthDate: '1997.06.10',
        parentPhone: '010-1111-1111',
        parentEmail: 'dksajfie@naver.com',
        treatmentPeriod: '6개월(2024.06.01 ~ 2025.01.01)',
        firstConsultDate: '2024.05.06',
        interests: 'ex) 좋아하는 것, 싫어하는 것, 취미 등..',
        notes: 'ex) 참고해야 할 사항 등..'
      },
      {
        id: 2,
        childName: '박지우',
        age: 8,
        parentName: '이영희',
        imageUrl: '/kid.png',
        gender: '여',
        birthDate: '1997.06.10',
        parentPhone: '010-1111-1111',
        parentEmail: 'dksajfie@naver.com',
        treatmentPeriod: '6개월(2024.06.01 ~ 2025.01.01)',
        firstConsultDate: '2024.05.06',
        interests: 'ex) 좋아하는 것, 싫어하는 것, 취미 등..',
        notes: 'ex) 참고해야 할 사항 등..'
      },
      {
        id: 3,
        childName: '박지우',
        age: 6,
        parentName: '이영희',
        imageUrl: '/kid.png',
        gender: '여',
        birthDate: '1997.06.10',
        parentPhone: '010-1111-1111',
        parentEmail: 'dksajfie@naver.com',
        treatmentPeriod: '6개월(2024.06.01 ~ 2025.01.01)',
        firstConsultDate: '2024.05.06',
        interests: 'ex) 좋아하는 것, 싫어하는 것, 취미 등..',
        notes: 'ex) 참고해야 할 사항 등..'
      },
      {
        id: 4,
        childName: '박지웅',
        age: 6,
        parentName: '이영희',
        imageUrl: '/kid.png',
        gender: '남',
        birthDate: '1997.06.10',
        parentPhone: '010-1111-1111',
        parentEmail: 'dksajfie@naver.com',
        treatmentPeriod: '6개월(2024.06.01 ~ 2025.01.01)',
        firstConsultDate: '2024.05.06',
        interests: 'ex) 좋아하는 것, 싫어하는 것, 취미 등..',
        notes: 'ex) 참고해야 할 사항 등..'
      }
  ];

  return (
    <div className="delete-modal-overlay">
        <div className="delete-modal-content">
            <div className="delete-modal-header">
              <div className="header-title">탈퇴요청 리스트</div>
              <button className="delete-close-button" onClick={onClose}>×</button>
            </div>
            <div className="delete-modal-body">
              {deleteRequests.length === 0 ? (
                <div className="no-requests-message">들어온 요청이 없습니다.</div>
              ) : (
                <div className="delete-requests-grid">
                  {deleteRequests.map((request) => (
                    <div key={request.id} className="delete-request-group">
                      <div className="delete-photo-box">
                        <img 
                          src={request.imageUrl} 
                          alt={request.childName} 
                          className="delete-photo-image" 
                        />
                      </div>
                      <div className="delete-info-box">
                        {request.childName}({request.gender})&nbsp; {request.age}살
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
    </div>
  );
};

export default DeleteChildModal;