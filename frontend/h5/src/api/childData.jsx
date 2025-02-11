import api from "./api"; // 🔹 axios 인스턴스 (기본 API 설정)

export const getChildEmotionData = async (childUserId) => {
  try {
    // console.log(`📢 아동(${childUserId}) 감정 데이터 요청`);
    const response = await api.get(`/statistic/data-analysis`, {
      params: { childUserId }, // 🔹 요청 파라미터 추가
    });
    // console.log("✅ 감정 데이터 조회 성공:", response.data);
    return response.data; // 🔹 데이터 반환
  } catch (error) {
    console.error(
      "❌ 감정 데이터 조회 실패:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getChatBotDate = async (childUserId, year, month) => {
  try {
    console.log(`📢 아동(${childUserId}) 챗봇 날짜 불러오기`, year, month);
    const response = await api.get(`/chatbot/get-dates/chatbot`, {
      params: { childUserId, year, month },
    });
    console.log("✅ 챗봇 날짜 불러오기기 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ 챗봇 날짜 조회 실패:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getVideoDate = async (childUserId, year, month) => {
  try {
    console.log(`📢 아동(${childUserId}) 비디오 날짜 불러오기`);
    const response = await api.get(`/statistic/get-dates/video`, {
      params: { childUserId, year, month },
    });
    console.log("✅ 비디오오 날짜 불러오기 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ 비디오 날짜 조회 실패:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

