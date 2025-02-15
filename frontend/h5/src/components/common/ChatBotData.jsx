import { useState, useEffect } from "react";
import { Card } from "primereact/card";
import PropTypes from "prop-types";
import { getChatBotData } from "../../api/ai";
import "./ChatBotData.css";

// 기본 샘플 데이터 (API 호출 전 기본값으로 사용)
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
      message:
        "오늘 우리 친구의 감정은 기쁨이구나! 너의 행복한 마음이 나에게도 전해져! 내일도 이렇게 기쁜 하루 보내자!",
    },
  ],
};

function ChatBotData({ selectedDate, selectedChild }) {
  const [chatData, setChatData] = useState(sampleData);

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  

  useEffect(() => {
    async function fetchChatData() {
      try {
        const formattedDate = formatDate(selectedDate);
        const response = await getChatBotData(
          Number(selectedChild.childUserId),
          formattedDate
        );
        console.log("챗봇 데이터 조회 결과:", response);
        setChatData(response);
      } catch (error) {
        console.error("챗봇 데이터 조회 실패:", error);
      }
    }
    if (selectedChild && selectedDate) {
      fetchChatData();
    }
  }, [selectedChild, selectedDate]);

  const { chatbotDtos } = chatData;

  return (
    <div className="chatbot-history-page">
      <p>
        선택된 날짜는 :{" "}
        {selectedDate
          ? selectedDate.toLocaleDateString()
          : "날짜가 선택되지 않았습니다."}
      </p>
      <div className="chatbot-history-container">
        <Card className="chatbot-history-card">
          <div className="chatbot-box">
            {chatbotDtos &&
              chatbotDtos.map((msg, index) => {
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
                    <span
                      className={`chat-text ${
                        isBot ? "bot-text" : "user-text"
                      }`}
                    >
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

ChatBotData.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  selectedChild: PropTypes.object.isRequired,
};

export default ChatBotData;
