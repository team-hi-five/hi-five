import "../Css/CounselorChildVideoCall.css"
import { FaStopCircle, FaPhoneSlash } from "react-icons/fa";
import { BsRecordCircle } from "react-icons/bs";
import { IoGameController } from "react-icons/io5";

function ParentVideoCallPage() {
  return (
    <div className="co-video-call-container">
      {/* 좌측 상단 로고 */}
      <img src="/logo.png" alt="로고" className="co-logoo" />

      {/* 하단 컨트롤 버튼 */}
      <div className="co-video-controls">
        <div className="co-control-item">
          <button className="co-control-btn"><IoGameController size={28}/></button>
          <span className="co-control-label">게임시작</span>
        </div>
        <div className="co-control-item">
          <button className="co-control-btn"><BsRecordCircle size={28}/></button>
          <span className="co-control-label">녹화</span>
        </div>
        <div className="co-control-item">
          <button className="co-control-btn"><FaStopCircle size={28}/></button>
          <span className="co-control-label">멈추기</span>
        </div>
        <div className="co-control-item">
          <button className="co-control-btn end-call"><FaPhoneSlash size={28}/></button>
          <span className="co-control-label">나가기</span>
        </div>
      </div>
    </div>
  );
}

export default ParentVideoCallPage;