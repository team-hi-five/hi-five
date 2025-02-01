import { useState, useEffect } from 'react';
import './ChildDetailModal.css'
import DoubleButtonAlert from '../common/DoubleButtonAlert';
import SingleButtonAlert from '../common/SingleButtonAlert';
import ProfileImageModal from './ProfileImageModal';


const ChildDetailModal = ({ isOpen, onClose, childData, onDelete, onUpdate, onCancelRequest, isDeleteRequest  }) => {

    const [profileImage, setProfileImage] = useState(childData.imageUrl); // 이미지 상태 추가
    const [isEditing, setIsEditing] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editedData, setEditedData] = useState({
      interests: childData.interests,
      notes: childData.notes,
      imageUrl: childData.imageUrl  // 이미지 URL도 편집 데이터에 포함
    });
    const [editingField, setEditingField] = useState(null);

    // childData가 변경될 때마다 editedData 업데이트
    useEffect(() => {
      setEditedData({
        interests: childData.interests,
        notes: childData.notes,
        imageUrl: childData.imageUrl
      });
      setProfileImage(childData.imageUrl);
    }, [childData]);

    const handleProfileEdit = () => {
      setIsProfileModalOpen(true);
    };

    // 이미지 변경 시 임시 저장
    const handleImageChange = (newImage) => {
      setProfileImage(newImage);  // 모달 내 미리보기용
      setEditedData(prev => ({
        ...prev,
        imageUrl: newImage  // 편집 데이터에 저장
      }));
    };

    // 수정 완료 시 모든 변경사항 적용
  const handleSaveClick = () => {
    console.log('Edited Data:', editedData);
    onUpdate(childData.id, editedData); // editedData 전체를 전달

    // 편집 모드 종료
    setIsEditing(false);
    setEditingField(null);
  };

    // 모달 닫기 시 편집 모드만 초기화
    const handleClose = () => {
      setIsEditing(false);
      setEditingField(null);
      onClose();
    };

 if (!isOpen) return null;

 const handleDelete = async () => {
  try {
      const result = await DoubleButtonAlert('정말 삭제 하시겠습니까?');
      
      if (result.isConfirmed) {
          setIsLoading(true);
          
          try {
              // API 호출을 시뮬레이션하기 위한 딜레이
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // 실제 삭제 실행
              await onDelete(childData.id); 
              
              // 성공 알림
              await SingleButtonAlert('성공적으로 삭제되었습니다.');
              onClose(); // 모달 닫기
          } catch (error) {
              console.error('삭제 중 오류 발생:', error);
              await SingleButtonAlert('회원 삭제 중 오류가 발생했습니다.');
          } finally {
              setIsLoading(false);
          }
      }
  } catch (error) {
      console.error('삭제 중 오류 발생:', error);
  }
};

   const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleFieldEdit = (field) => {
      setEditingField(field);
  };

    const handleFieldChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // const handleFieldSave = () => {
    //     setEditingField(null);
    //     // 여기에 API 호출하여 데이터 저장하는 로직 추가
    // };
 

 return (
   <div className="modal-overlay">
     <div className="modal-content">
       <div className="modal-header">
         <h2><span>{childData.name}</span>님의 상세정보</h2>
         <button className="close-button" onClick={handleClose}>×</button>
       </div>
       
       <div className="modal-body">
         <div className="profile-section">
          <div className='profile-image-container'>
            <div className="profile-image">
              <img src={profileImage} alt="프로필 사진" />
            </div>
              {isEditing ? <div className="edit-img" onClick={handleProfileEdit}>수정</div> : <div className="edit-img"></div>}
          </div>

            {isProfileModalOpen && (
              <ProfileImageModal onClose={() => setIsProfileModalOpen(false)} onImageChange={handleImageChange} />
            )}
           
           <div className="info-grid">
             <div className="info-row">
               <span className="label">성별</span>
               <span className="value">{childData.gender}</span>
             </div>
             <div className="info-row">
               <span className="label">나이</span>
               <span className="value">{childData.age}세</span>
             </div>
             <div className="info-row">
               <span className="label">부모님 성함</span>
               <span className="value">{childData.parentName}</span>
             </div>
             <div className="info-row">
               <span className="label">생년월일</span>
               <span className="value">{childData.birthDate}</span>
             </div>
           </div>
         </div>

         <div className="contact-info">
           <div className="info-row">
             <span className="label">부모님 연락처</span>
             <span className="value">{childData.parentPhone}</span>
           </div>
           <div className="info-row">
             <span className="label">부모님 이메일</span>
             <span className="value">{childData.parentEmail}</span>
           </div>
           <div className="info-row">
             <span className="label">치료기간</span>
             <span className="value">{childData.treatmentPeriod}</span>
           </div>
           <div className="info-row">
             <span className="label">센터 첫 상담 날짜</span>
             <span className="value">{childData.firstConsultDate}</span>
           </div>
           <div className="info-row">
           <span className="label">관심사</span>
            {isEditing ? (
                <div className="edit-value-container">
                    {editingField === 'interests' ? (
                        <div className="edit-input-container">
                            <input
                                type="text"
                                value={editedData.interests}
                                onChange={(e) => handleFieldChange('interests', e.target.value)}
                                className="edit-input"
                            />
                            <button onClick={() => setEditingField(null)} className="save-btn">저장</button>
                        </div>
                    ) : (
                        <>
                            <span className="value">{editedData.interests}</span>
                            <button onClick={() => handleFieldEdit('interests')} className="edit-text">수정</button>
                        </>
                      )}
                  </div>
              ) : (
                  <span className="value">{editedData.interests}</span>
              )}
           </div>
           <div className="info-row">
             <span className="label">기타사항</span>
             {isEditing ? (
                <div className="edit-value-container">
                    {editingField === 'notes' ? (
                        <div className="edit-input-container">
                            <input
                                type="text"
                                value={editedData.notes}
                                onChange={(e) => handleFieldChange('notes', e.target.value)}
                                className="edit-input"
                            />
                            <button onClick={() => setEditingField(null)} className="save-btn">저장</button>
                        </div>
                    ) : (
                        <>
                            <span className="value">{editedData.notes}</span>
                            <button onClick={() => handleFieldEdit('notes')} className="edit-text">수정</button>
                        </>
                      )}
                  </div>
              ) : (
                  <span className="value">{editedData.notes}</span>
              )}
           </div>
         </div>
       </div>

       <div className="modal-footer">
          {!isEditing ? (
            <div>
              {isDeleteRequest ? (
                <>
                  <button 
                    className="btn-delete1" 
                    onClick={() => onCancelRequest(childData.id)}
                  >
                    <strong>요청취소</strong>
                  </button>
                  <button 
                    className="btn-delete2" 
                    onClick={() => onDelete(childData.id)}
                    disabled={isLoading}
                  >
                    <strong>{isLoading ? '삭제 중...' : '회원삭제'}</strong>
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-submit" onClick={handleEditClick}>
                    <strong>수정</strong>
                  </button>
                  <button 
                    className="btn-delete2" 
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    <strong>{isLoading ? '삭제 중...' : '회원삭제'}</strong>
                  </button>
                </>
              )}
            </div>
          ) : (
            <button className="btn-submit" onClick={handleSaveClick}>
              <strong>수정완료</strong>
            </button>
          )}
        </div>
      </div>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default ChildDetailModal;