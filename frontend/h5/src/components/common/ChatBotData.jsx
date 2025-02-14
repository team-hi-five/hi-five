import "./ChatBotData.css";  // 스타일은 별도의 CSS 파일에서 작성
import { Card } from "primereact/card"; // 필요 시 사용

// 샘플 챗봇 데이터
const sampleData = {
  chatbotDtos: [
    {
      childUserId: 2,
      sender: "gpt",
      messageIndex: 0,
      message: "안녕 한승우 감정아! 만나서 반가워!",
    },
    {
      childUserId: 2,
      sender: "gpt",
      messageIndex: 1,
      message: "오늘 하루 어떤 일이 있었니?",
    },
    {
      childUserId: 2,
      sender: "user",
      messageIndex: 2,
      message: "우가우가",
    },
    {
      childUserId: 2,
      sender: "gpt",
      messageIndex: 3,
      message: "그래서 어떤 감정이 들었어?",
    },
    {
      childUserId: 2,
      sender: "user",
      messageIndex: 4,
      message: "우가우가",
    },
    {
      childUserId: 2,
      sender: "gpt",
      messageIndex: 5,
      message: "오늘 우리 친구의 감정은 기쁨이구나! 너의 행복한 마음이 나에게도 전해져! 내일도 이렇게 기쁜 하루 보내자!",
    },
  ],
};

function ChatBotData() {
  const { chatbotDtos } = sampleData;

  return (
    <div className="chatbot-history-page">
      <div className="chatbot-history-container">
        <Card className="chatbot-history-card">
          <div className="chatbot-box">
            {chatbotDtos.map((msg, index) => {
              const isBot = msg.sender === "gpt";
              return (
                <div
                  key={index}
                  className={`chat-bubble ${isBot ? "bot" : "user"}`}
                >
                  {isBot && (
                    <img
                      src="/child/chatbot/chatbotCh.png"
                      alt="chatbotCh"
                      className="chatbot-icon"
                    />
                  )}
                  <span className={`chat-text ${isBot ? "bot-text" : "user-text"}`}>
                    {msg.message}
                  </span>
                  {!isBot && (
                    <img
                      src="/child/chatbot/chatuser.PNG"
                      alt="chatuser"
                      className="chatuser-icon"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ChatBotData;
