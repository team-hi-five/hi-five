// import api from "./api";

export const saveChatBotData = async (logData) => {
  try {
    console.log("📢 챗봇 데이터 저장 : ", logData);
    /*
    const response = await api.post("/chatbot/insert-chatbot", {
        logData
    });
    console.log("✅ 챗봇 데이터 저장장 성공:", response.data);
    return response.data;
    */
  } catch (error) {
    console.error(
      "❌ 챗봇봇 데이터 저장 실패:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};