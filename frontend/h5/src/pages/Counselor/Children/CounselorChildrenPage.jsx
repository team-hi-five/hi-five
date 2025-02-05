import CounselorHeader from "../../../components/Counselor/CounselorHeader";
import Footer from "../../../components/common/footer";
import CoChildCard from "../../../components/Counselor/CoChildCard"
import ChildRegistrationModal from "../../../components/modals/ChildRegistrationModal"
import '../Css/CounselorChildrenPage.css'
import DeleteChildModal from "../../../components/modals/DeleteChildModal"
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { Dropdown } from 'primereact/dropdown';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

function CounselorChildrenPage() {
  const [isDeleteListModalOpen, setIsDeleteListModalOpen] = useState(false);
  const [deleteRequestCount, setDeleteRequestCount] = useState(0);  // 탈퇴요청 수를 저장할 state 추가

  // 벨 아이콘 클릭 핸들러 추가
  const handleNotificationClick = () => {
    setIsDeleteListModalOpen(true);
  };

  // 탈퇴요청 수가 변경될 때 호출될 핸들러
  const handleDeleteRequestsChange = (count) => {
    setDeleteRequestCount(count);
  };

  const initialChildrenData = [
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
      childName: '최유진',
      age: 7,
      parentName: '최재현',
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
      id: 5,
      childName: '정하은',
      age: 8,
      parentName: '정민석',
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
      id: 6,
      childName: '강도윤',
      age: 6,
      parentName: '강병호',
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
      id: 7,
      childName: '윤서아',
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
    }
  ];

  const [childrenData, setChildrenData] = useState(initialChildrenData);
  const searchOptions = [
    { label: '아동 이름', value: 'child' },
    { label: '학부모 이름', value: 'parent' }
   ];

  const [searchType, setSearchType] = useState('child');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 아동 정보 업데이트 함수 추가
  const handleUpdateChild = (childId, updatedData) => {
    setChildrenData(prevChildren => {
      return prevChildren.map(child => {
        if (child.id === childId) {
          return {
            ...child,
            ...updatedData
          };
        }
        return child;
      });
    });
  };

  // 삭제 핸들러 추가
  const handleDelete = async (childId) => {
    try {
      // 실제 API 호출은 여기에 추가
      // await api.deleteChild(childId);
      
      // 프론트엔드 상태 업데이트
      setChildrenData(prevChildren => 
        prevChildren.filter(child => child.id !== childId)
      );
    } catch (error) {
      console.error('Failed to delete child:', error);
    }
  };

  const filteredChildren = childrenData.filter((child) => {
    const searchValue = searchType === 'child' ? child.childName : child.parentName;
    return searchValue.includes(searchText);
  });

    return (
      <>
        <div className="co-counselor-container">
          <div className="co-cc-fixed-section">
            <CounselorHeader />
            <div className="co_blankdefault" style={{marginTop: '64.49px'}}></div>
            <div className="co-c-title">
              우리아동 한눈보기
            </div>
            <div className="co-search-notification-container">
              <div className="co-search-notification-inner">
                <div className="co-notification" onClick={handleNotificationClick}>
                  <i className="pi pi-bell" style={{ fontSize: '1.7rem', color: '#FF9F1C' }}></i>
                    <span className="co-notification-badge">{deleteRequestCount}</span>
                </div>
                <div className="co-search-section">
                  <Dropdown 
                    value={searchType} 
                    onChange={(e) => setSearchType(e.value)} 
                    options={searchOptions} 
                    className="co-search-dropdown"
                  />
                  <div className="co-c-search-container">
                    <i className="pi pi-search co-search-icon"></i>
                    <InputText 
                      placeholder="이름을 입력하세요" 
                      className="co-search-input2"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div> 
                </div>
              </div>
            </div>
          </div>


          <main className="content-section">
            <div className="counselor-children-container">
              {childrenData.length === 0 ? (
                <div className="no-results">등록된 아동이 없습니다.</div>
              ) : filteredChildren.length > 0 ? (
                <div className="grid-container">
                  <SimpleBar style={{ width: '100%', maxHeight: 500 }} autoHide={false}>
                    <div className="counselor-children-grid">
                      {filteredChildren.map((child) => (
                        <div key={child.id} className={`counselor-children-item ${filteredChildren.length === 1 ? 'single-item' : ''}`}>
                          <CoChildCard
                            id={child.id}
                            childName={child.childName}
                            age={child.age}
                            parentName={child.parentName}
                            imageUrl={child.imageUrl}
                            gender={child.gender}
                            birthDate={child.birthDate}
                            parentPhone={child.parentPhone}
                            parentEmail={child.parentEmail}
                            treatmentPeriod={child.treatmentPeriod}
                            firstConsultDate={child.firstConsultDate}
                            interests={child.interests}
                            notes={child.notes}
                            onDelete={handleDelete}
                            onUpdate={handleUpdateChild}
                          />
                        </div>
                      ))}
                    </div>
                  </SimpleBar>
                </div>
              ) : (
                <div className="no-results">검색 결과가 없습니다.</div>
              )}
              <button className="co-register-button" onClick={openModal}>회원등록</button>
            </div>
          </main>

          <Footer />

          {isModalOpen && <ChildRegistrationModal onClose={closeModal} />}
          <DeleteChildModal 
            isOpen={isDeleteListModalOpen}
            onClose={() => setIsDeleteListModalOpen(false)}
            onDeleteRequestsChange={handleDeleteRequestsChange}
          />
        </div>
      </>

    )
  }
  
  export default CounselorChildrenPage;