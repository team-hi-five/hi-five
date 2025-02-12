import { useState, useEffect } from 'react';
import ChildDetailModal from './ChildDetailModal';
import { getParentDeleteRequests, getConsultantChild } from "/src/api/userCounselor";
import defaultImg from '/child/character/angrymi.png';  // 기본 이미지 import
import './DeleteChildModal.css';
import { getFileUrl, TBL_TYPES } from '../../api/file';

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

  // DeleteChildModal.jsx
const handleChildClick = async (childUserId, deleteUserRequestId) => {
  try {
    const data = await getConsultantChild(childUserId);
    
    // 이미지 URL 가져오기 (CounselorChildrenPage와 동일한 방식으로)
    const imageUrls = await getFileUrl(TBL_TYPES.PROFILE, childUserId);
    let profileImageUrl = data.profileImgUrl; // 기본값
    
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      profileImageUrl = imageUrls[imageUrls.length - 1].url;
    }

    const formattedData = {
      id: data.childUserId,
      name: data.childName,
      age: data.age,
      birthDate: data.birth,
      gender: data.gender,
      imageUrl: profileImageUrl || defaultImg,  // 여기를 수정
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail,
      firstConsultDate: data.firstConsultDate,
      interests: data.interest,
      notes: data.additionalInfo,
      deleteUserRequestId: deleteUserRequestId,
    };

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
          initialChildData={childData}
          isDeleteRequest={true}
        />
      )}
    </div>
  );
};

export default DeleteChildModal;
