import "../Css/CounselorParentVideoCall.css"
import { FaVideo, FaMicrophone, FaPhoneSlash, FaDesktop } from "react-icons/fa";

function ParentVideoCallPage() {
  return (
    <div className="co-video-call-container">
      {/* 좌측 상단 로고 */}
      <img src="/logo.png" alt="로고" className="co-logoo" />

      <div className="co-video-layout">
        {/* 메인 비디오 */}
        <div className="co-main-video">
          <img src="/user.png" alt="Main Video" className="co-main-video-feed" />
        </div>

        {/* 참여자 비디오 */}
        <div className="co-participant-videos">
          <div className="co-participant">
            <img src="/user.png" alt="Participant 1" />
          </div>
          <div className="co-participant">
            <img src="/user.png" alt="Participant 2" />
          </div>
        </div>
      </div>

      {/* 하단 컨트롤 버튼 */}
      <div className="co-video-controls">
        <button className="co-control-btn"><FaDesktop /></button>
        <button className="co-control-btn"><FaVideo /></button>
        <button className="co-control-btn"><FaMicrophone /></button>
        <button className="co-control-btn end-call"><FaPhoneSlash /></button>
      </div>
    </div>
  );
}

export default ParentVideoCallPage;