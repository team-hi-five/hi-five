import { useState, useEffect } from 'react';
import ChildDetailModal from './ChildDetailModal';
import DoubleButtonAlert from '../common/DoubleButtonAlert';
import './DeleteChildModal.css'

const DeleteChildModal = ({ isOpen, onClose,  onDeleteRequestsChange }) => {
  // 선택된 아이의 정보를 저장할 state
  const [selectedChild, setSelectedChild] = useState(null);
  const [deleteRequests, setDeleteRequests] = useState([
    {
      id: 1,
      childName: '김민준',
      age: 7,
      parentName: '이영희',
      imageUrl: '/test/kid.png',
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
      imageUrl: '/test/kid.png',
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
      imageUrl: '/test/kid.png',
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
      imageUrl: '/test/kid.png',
      gender: '남',
      birthDate: '1997.06.10',
      parentPhone: '010-1111-1111',
      parentEmail: 'dksajfie@naver.com',
      treatmentPeriod: '6개월(2024.06.01 ~ 2025.01.01)',
      firstConsultDate: '2024.05.06',
      interests: 'ex) 좋아하는 것, 싫어하는 것, 취미 등..',
      notes: 'ex) 참고해야 할 사항 등..'
    }
  ]);

  // deleteRequests가 변경될 때마다 부모 컴포넌트에 알림
  useEffect(() => {
    if (onDeleteRequestsChange) {
      onDeleteRequestsChange(deleteRequests.length);
    }
  }, [deleteRequests, onDeleteRequestsChange]);

  if (!isOpen) return null;


  // 사진 클릭 시 상세 모달 열기
  const handlePhotoClick = (child) => {
    setSelectedChild(child);
  };

  // 상세 모달 닫기
  const handleCloseDetail = () => {
    setSelectedChild(null);
  };

  // 회원 삭제 처리
  const handleDeleteRequest = async (childId) => {
    try {
      const result = await DoubleButtonAlert('정말 삭제 하시겠습니까?');
      
      if (result.isConfirmed) {
        setDeleteRequests(prev => {
          const newRequests = prev.filter(request => request.id !== childId);
          onDeleteRequestsChange?.(newRequests.length); // 삭제 후 수 업데이트
          return newRequests;
        });
        setSelectedChild(null);
      }
    } catch (error) {
      console.error('삭제 처리 중 오류 발생:', error);
    }
  };

  // 요청 취소 처리
  const handleCancelRequest = (childId) => {
    setDeleteRequests(prev => {
      const newRequests = prev.filter(request => request.id !== childId);
      onDeleteRequestsChange?.(newRequests.length); // 취소 후 수 업데이트
      return newRequests;
    });
    setSelectedChild(null);
  };

  return (
    <div className="delete-modal-overlay">
        <div className="delete-modal-content">
            <div className="delete-modal-header">
              <div className="header-title">탈퇴요청 리스트</div>
              <button className="delete-close-button" onClick={onClose}>×</button>
            </div>
            <div className="delete-modal-body">
              {deleteRequests.length === 0 ? (
                <div className="no-requests-container">
                <img 
                  src="/no.png" 
                  alt="요청 없음" 
                  className="no-requests-image"
                />
                <div className="no-requests-message">들어온 요청이 없습니다.</div>
              </div>
              ) : (
                <div className="delete-requests-grid">
                  {deleteRequests.map((request) => (
                    <div key={request.id} className="delete-request-group">
                      <div 
                        className="delete-photo-box"
                        onClick={() => handlePhotoClick(request)}
                        style={{ cursor: 'pointer' }}
                      >
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
        {selectedChild && (
        <ChildDetailModal 
          isOpen={true}
          onClose={handleCloseDetail}
          childData={selectedChild}
          onDelete={handleDeleteRequest}
          onCancelRequest={handleCancelRequest}
          isDeleteRequest={true}
        />
      )}
    </div>
  );
};

export default DeleteChildModal;