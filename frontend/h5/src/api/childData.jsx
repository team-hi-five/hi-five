import api from "./api"; // 🔹 axios 인스턴스 (기본 API 설정)

export const getChildEmotionData = async (childUserId) => {
    try {
        console.log(`📢 아동(${childUserId}) 감정 데이터 요청`);
        const response = await api.get(`/statistic/data-analysis`, {
            params: { childUserId } // 🔹 요청 파라미터 추가
        });
        console.log("✅ 감정 데이터 조회 성공:", response.data);
        return response.data; // 🔹 데이터 반환
    } catch (error) {
        console.error("❌ 감정 데이터 조회 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};
