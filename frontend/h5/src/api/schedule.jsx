import api from "./api";

// ✅ 부모 계정의 상담 예약 날짜 가져오기
export const getScheduledDatesByParent = async () => {
    try {
        console.log("📢 부모 상담 예약 날짜 요청");
        const response = await api.get("/schedule/dates-by-parent");
        console.log("✅ 상담 예약 날짜 가져오기 성공:", response.data);
        return response.data.dates; // 상담이 있는 날짜 리스트 반환
    } catch (error) {
        console.error("❌ 상담 예약 날짜 가져오기 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 상담 일정 생성
export const createSchedule = async (childId, schdlDttm, type, parentUserId = null) => {
    try {
        console.log("📢 상담 일정 생성 요청:", { childId, parentUserId, schdlDttm, type });

        const requestBody = {
            childId,
            schdlDttm,
            type,
        };

        // 부모 ID가 있는 경우 추가 (게임 일정이면 생략)
        if (parentUserId) {
            requestBody.parentUserId = parentUserId;
        }

        const response = await api.post("/schedule/create", requestBody);

        console.log("✅ 상담 일정 생성 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 상담 일정 생성 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};