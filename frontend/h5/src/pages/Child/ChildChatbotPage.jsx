// import chatbot from 'react-chatbot-kit'
// import {createChatBotMessage} from 'react-chatbot-kit'
import ChildMainBackground from "../../components/Child/ChildMainBackground";
import "./ChildCss/ChildChatbotPage.css";

function ChildChatbotPage() {
  // 랜덤이미지 설정
  // const randomImages = [
  //     "/test/"
  // ]

  // // 초기 메세지 설정
  // const config = {
  //     initialMessage:[
  //         createChatBotMessage("")
  //     ]
  // }

  return (
    <div className="ch-chatbot-container">
      <ChildMainBackground />
      <div className="ch-chatbot-box"></div>
    </div>
  );
}

export default ChildChatbotPage;

// 챗봇 대화
// 아동 대화
//
// 스타트 버튼
// 종료()
