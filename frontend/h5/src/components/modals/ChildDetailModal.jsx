import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './ChildDetailModal.css'
import DoubleButtonAlert from '../common/DoubleButtonAlert';
import SingleButtonAlert from '../common/SingleButtonAlert';
import ProfileImageModal from './ProfileImageModal';

const ChildDetailModal = ({ isOpen, onClose, childData, onDelete, onUpdate, onCancelRequest, isDeleteRequest  }) => {
    const [profileImage, setProfileImage] = useState(childData.imageUrl);
    const [isEditing, setIsEditing] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editedData, setEditedData] = useState({
      interests: childData.interests,
      notes: childData.notes,
      imageUrl: childData.imageUrl
    });
    const [editingField, setEditingField] = useState(null);

    useEffect(() => {
      if (isOpen) {
          document.body.style.overflow = 'hidden';
      }
      return () => {
          document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

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

    const handleImageChange = (newImage) => {
      setProfileImage(newImage);
      setEditedData(prev => ({
        ...prev,
        imageUrl: newImage
      }));
    };

    const handleSaveClick = () => {
      console.log('Edited Data:', editedData);
      onUpdate(childData.id, editedData);
      setIsEditing(false);
      setEditingField(null);
    };

    const handleClose = () => {
      setIsEditing(false);
      setEditingField(null);
      onClose();
    };

    const handleDelete = async () => {
      try {
          const result = await DoubleButtonAlert('정말 삭제 하시겠습니까?');
          
          if (result.isConfirmed) {
              setIsLoading(true);
              
              try {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  await onDelete(childData.id); 
                  await SingleButtonAlert('성공적으로 삭제되었습니다.');
                  onClose();
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

    if (!isOpen) return null;

    const modalContent = (
      <>
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
        </div>
          {isLoading && (
            <div className="loading-overlay3">
              <div className="loading-spinner3"></div>
            </div>
          )}
      </>
    );

    return ReactDOM.createPortal(
      modalContent,
      document.body
    );
};

export default ChildDetailModal;