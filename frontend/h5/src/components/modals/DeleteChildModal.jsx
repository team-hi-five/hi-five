import { useState, useEffect } from 'react';
import ChildDetailModal from './ChildDetailModal';
import SingleButtonAlert from '../common/SingleButtonAlert';
import DoubleButtonAlert from '../common/DoubleButtonAlert';
import { getParentDeleteRequests, approveDeleteRequest, rejectDeleteRequest } from "/src/api/userCounselor";
import './DeleteChildModal.css';

const DeleteChildModal = ({ isOpen, onClose, onDeleteRequestsChange }) => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [deleteRequests, setDeleteRequests] = useState([]);

  // ✅ 탈퇴 요청 리스트 불러오기
  useEffect(() => {
    if (isOpen) {
      fetchDeleteRequests();
    }
  }, [isOpen]);

  const fetchDeleteRequests = async () => {
    try {
      const data = await getParentDeleteRequests();
      setDeleteRequests(data);
      onDeleteRequestsChange?.(data.length); // 부모 컴포넌트에 변경된 요청 수 전달
    } catch (error) {
      console.error("❌ 탈퇴 요청 리스트 불러오기 실패:", error);
    }
  };

  if (!isOpen) return null;

  // ✅ 사진 클릭 시 상세 모달 열기
  const handlePhotoClick = (child) => {
    setSelectedChild(child);
  };

  // ✅ 상세 모달 닫기
  const handleCloseDetail = () => {
    setSelectedChild(null);
  };

  // ✅ 탈퇴 요청 승인 (부모 계정 삭제)
  const handleApproveDelete = async (deleteUserRequestID) => {
    try {
        const result = await DoubleButtonAlert("정말 탈퇴 요청을 승인하시겠습니까?");
        if (result.isConfirmed) {
            await approveDeleteRequest(deleteUserRequestID);
            await SingleButtonAlert("회원 탈퇴가 승인되었습니다.");
            fetchDeleteRequests(); // 리스트 갱신
        }
    } catch (error) {
        await SingleButtonAlert("탈퇴 승인 중 오류가 발생했습니다.");
        console.error("탈퇴 승인 오류 발생", error);
    }
};


  // ✅ 요청 취소 (부모의 삭제 요청 철회)
  const handleRejectDelete = async (deleteUserRequestID) => {
    try {
        const result = await DoubleButtonAlert("정말 탈퇴 요청을 거절하시겠습니까?");
        if (result.isConfirmed) {
            await rejectDeleteRequest(deleteUserRequestID);
            await SingleButtonAlert("회원 탈퇴 요청이 거절되었습니다.");
            fetchDeleteRequests(); // 리스트 갱신
        }
    } catch (error) {
        await SingleButtonAlert("탈퇴 거절 중 오류가 발생했습니다.");
        console.error("탈퇴 거절 오류 발생", error);
    }
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
                    <div key={request.deleteUserRequestId} className="delete-request-group">
                      <div 
                        className="delete-photo-box"
                        onClick={() => handlePhotoClick(request)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img 
                          src="/default-profile.png" 
                          alt={request.parentName} 
                          className="delete-photo-image" 
                        />
                      </div>
                      <div className="delete-info-box">
                        {request.parentName} 님 (아이 {request.children.length}명)
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
          onDelete={handleApproveDelete}
          onCancelRequest={handleRejectDelete}
          isDeleteRequest={true}
        />
      )}
    </div>
  );
};

export default DeleteChildModal;