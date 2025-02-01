import "/src/pages/Parent/ParentCss/ParentVideoCallPage.css";
import { FaVideo, FaMicrophone, FaPhoneSlash } from "react-icons/fa";

function ParentVideoCallPage() {
  return (
    <div className="video-call-container">
      {/* 좌측 상단 로고 */}
      <div className="logo">
        <img src="/logo.png" alt="로고" className="pa-logo" />
      </div>

      <div className="video-layout">
        {/* 메인 비디오 */}
        <div className="main-video">
          <img src="/user.png" alt="Main Video" className="main-video-feed" />
        </div>

        {/* 참여자 비디오 */}
        <div className="participant-videos">
          <div className="participant">
            <img src="/user.png" alt="Participant 1" />
          </div>
          <div className="participant">
            <img src="/user.png" alt="Participant 2" />
          </div>
        </div>
      </div>

      {/* 하단 컨트롤 버튼 */}
      <div className="video-controls">
        <button className="control-btn"><FaVideo /></button>
        <button className="control-btn"><FaMicrophone /></button>
        <button className="control-btn end-call"><FaPhoneSlash /></button>
      </div>
    </div>
  );
}

export default ParentVideoCallPage;