import api from "./api";

// ✅ 부모 마이페이지 정보 조회 API 요청
export const getParentMyPage = async () => {
    try {
        console.log("📢 부모 마이페이지 정보 요청");

        // 서버에 GET 요청
        const response = await api.get("/user/parent/my-page");
        
        console.log("✅ 마이페이지 정보 불러오기 성공:", response.data);

        return response.data; // 마이페이지 데이터 반환
    } catch (error) {
        console.error("❌ 마이페이지 정보 불러오기 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};
