import ParentHeader from "../../../components/Parent/ParentHeader";
import "/src/pages/Parent/ParentCss/ParentMyPage.css";
import PasswordChangeModal from "/src/components/modals/PasswordChangeModal";
import DoubleButtonAlert from "/src/components/common/DoubleButtonAlert";
import SingleButtonAlert from "/src/components/common/SingleButtonAlert";
import { useState } from "react";

function ParentMyPage() {
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);

  const childData = {
    name: "박성원",
    age: 7,
    gender: "남아",
    profileImage: "/images/child-profile.jpg",
  };

  const parentData = {
    name: "김한주",
    phone: "010-1234-5678",
    email: "parent@example.com",
  };

  const counselorData = {
    name: "이영희",
    phone: "010-9876-5432",
    email: "counselor@example.com",
    institution: "행복 상담센터",
  };

  const handleDelete = async () => {
    const result = await DoubleButtonAlert('탈퇴 요청을 보내시겠습니까?');
    if(result.isConfirmed){
      await SingleButtonAlert('탈퇴 요청이 완료되었습니다.');
    }
  };

  return (
    <div className="mypage">
      <ParentHeader />
      <div className="mypage-container">
        <h2>마이 페이지</h2>

        {/* 정보 섹션을 가로로 배치 */}
        <div className="mypage-info-container">
          {/* 아이 정보 */}
          <div className="mypage-card">
            <h3>아이 정보</h3>
            <div className="mypage-child">
              <img src={childData.profileImage} alt="아동 사진" className="child-profile" />
              <div className="child-info">
                <p><b>이름:</b> {childData.name}</p>
                <p><b>연령:</b> {childData.age}세</p>
                <p><b>성별:</b> {childData.gender}</p>
              </div>
            </div>
          </div>

          {/* 학부모 정보 */}
          <div className="mypage-card">
            <h3>학부모 정보</h3>
            <div className="mypage-info">
              <p><b>이름:</b> {parentData.name}</p>
              <p><b>휴대폰 번호:</b> {parentData.phone}</p>
              <p><b>이메일:</b> {parentData.email}</p>
            </div>
          </div>

          {/* 상담사 정보 */}
          <div className="mypage-card">
            <h3>상담사 정보</h3>
            <div className="mypage-info">
              <p><b>이름:</b> {counselorData.name}</p>
              <p><b>휴대폰 번호:</b> {counselorData.phone}</p>
              <p><b>이메일:</b> {counselorData.email}</p>
              <p><b>상담기관명:</b> {counselorData.institution}</p>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="mypage-buttons">
          <button className="btn btn-primary" onClick={() => setIsPwdModalOpen(true)}>
            비밀번호 변경
          </button>                                      
          <button className="btn btn-danger" onClick={() => handleDelete()}>
            회원 탈퇴
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {isPwdModalOpen && <PasswordChangeModal isOpen={isPwdModalOpen} onClose={() => setIsPwdModalOpen(false)} />}
    </div>
  );
}

export default ParentMyPage;
