import "/src/pages/Parent/ParentCss/ParentVideoCallPage.css";
import { FaVideo, FaMicrophone, FaPhoneSlash } from "react-icons/fa";

function ParentVideoCallPage() {
  return (
    <div className="pa-video-call-container">
      {/* 좌측 상단 로고 */}
      <img src="/logo.png" alt="로고" className="pa-logoo" />

      <div className="pa-video-layout">
        {/* 메인 비디오 */}
        <div className="pa-main-video">
          <img src="/user.png" alt="Main Video" className="pa-main-video-feed" />
        </div>

        {/* 참여자 비디오 */}
        <div className="pa-participant-videos">
          <div className="pa-participant">
            <img src="/user.png" alt="Participant 1" />
          </div>
          <div className="pa-participant">
            <img src="/user.png" alt="Participant 2" />
          </div>
        </div>
      </div>

      {/* 하단 컨트롤 버튼 */}
      <div className="pa-video-controls">
        <button className="pa-control-btn"><FaVideo /></button>
        <button className="pa-control-btn"><FaMicrophone /></button>
        <button className="pa-control-btn end-call"><FaPhoneSlash /></button>
      </div>
    </div>
  );
}

export default ParentVideoCallPage;