import { useState, useEffect } from 'react';
import ChildDetailModal from './ChildDetailModal';
import { getParentDeleteRequests, getConsultantChild } from "/src/api/userCounselor";
import './DeleteChildModal.css';

const DeleteChildModal = ({ isOpen, onClose, onDeleteRequestsChange }) => {
  const [deleteRequests, setDeleteRequests] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState(null);

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
      console.log("데이터~", data.deleteUserRequestId);
      onDeleteRequestsChange?.(data.length);
    } catch (error) {
      console.error("❌ 탈퇴 요청 리스트 불러오기 실패:", error);
    }
  };

  const handleChildClick = async (childUserId, deleteUserRequestId) => {
      try {
        const data = await getConsultantChild(childUserId);
        console.log("📢 변환 전 받아온 Child Data:", data);
    
        // ✅ ChildDetailModal에 맞게 데이터 변환
        const formattedData = {
          id: data.childUserId,
          name: data.childName,
          age: data.age,
          birthDate: data.birth,
          gender: data.gender,
          imageUrl: data.profileImgUrl,
          parentName: data.parentName,
          parentPhone: data.parentPhone,
          parentEmail: data.parentEmail,
          firstConsultDate: data.firstConsultDate,
          interests: data.interest,
          notes: data.additionalInfo,
          deleteUserRequestId: deleteUserRequestId, // ✅ 여기에 넣고싶어~
        };
    
        console.log("✅ 변환 후 Child Data:", formattedData);
    
        setChildData(formattedData);
        setSelectedChild(true);
      } catch (error) {
        console.error("❌ 아이 정보 불러오기 실패:", error);
      }
  };

  

  // ✅ 상세 모달 닫기
  const handleCloseDetail = () => {
    setSelectedChild(null);
    setChildData(null);
    fetchDeleteRequests();
    onClose();
  };

  if (!isOpen) return null;

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
            <div className="delete-request-list">
              <div className="delete-request-header">
                <span>학부모 이름</span>
                <span>아이 수</span>
                <span>요청 날짜</span>
              </div>
              <div className="delete-request-scroll">
              {deleteRequests.map((request) =>
                request.children.map((child) => (
                  <div 
                    key={child.childUserId} 
                    className="delete-request-row"
                    onClick={() => handleChildClick(child.childUserId, request.deleteUserRequestId)} // ✅ 요청 ID도 전달
                    style={{ cursor: "pointer" }}
                  >
                    <span>{request.parentName}</span>
                    <span>{request.children.length} 명</span>
                    <span>{request.joinDate}</span>
                  </div>
                ))
              )}

              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ ChildDetailModal 추가 */}
      {selectedChild && childData && (
        <ChildDetailModal
          isOpen={true}
          onClose={handleCloseDetail}
          childData={childData}
          isDeleteRequest={true}
        />
      )}
    </div>
  );
};

export default DeleteChildModal;
