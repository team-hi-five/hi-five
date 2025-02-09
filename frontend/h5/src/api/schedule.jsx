import api from "./api";

// ✅ 부모 계정의 상담 예약 날짜 가져오기
// 🔹 부모 계정의 상담 예약 날짜 가져오기 (수정된 코드)
export const getScheduledDatesByParent = async (year, month) => {
    try {
        console.log(`📢 부모 상담 예약 날짜 요청 (Year: ${year}, Month: ${month})`);
        const response = await api.get("/schedule/dates-by-parent", {
            params: { year, month },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT 인증 추가
            },
            withCredentials: true,
        });

        console.log("✅ 상담 예약 날짜 가져오기 성공:", response.data);

        // 🔹 응답이 배열이라면 그대로 반환
        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.error("❌ 예상치 못한 응답 형식:", response.data);
            return []; // 빈 배열 반환하여 오류 방지
        }
    } catch (error) {
        console.error("❌ 상담 예약 날짜 가져오기 실패:", error.response ? error.response.data : error.message);
        return []; // 오류 발생 시 빈 배열 반환
    }
};



// ✅ 상담 일정 생성
export const createSchedule = async (childId, schdlDttm, type) => {
    try {
        console.log("📢 상담 일정 생성 요청:", { childId, schdlDttm, type });

        const requestBody = {
            childId,
            schdlDttm,
            type,
        };

        const response = await api.post("/schedule/create", requestBody);

        console.log("✅ 상담 일정 생성 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 상담 일정 생성 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// 상담 생성 시 아이 이름으로 검색 API
export const searchChildByName = async (childUserName) => {
    try {
        console.log(`📢 아이 이름 검색 요청: ${childUserName}`);
        const response = await api.get(`/user/consultant/search-child/${encodeURIComponent(childUserName)}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔹 인증 토큰 추가
            },
            withCredentials: true, // 🔹 CORS 관련 쿠키 허용 (필요한 경우)
        });
        console.log("✅ 아이 검색 성공:", response.data);
        return response.data; // 🔹 검색된 아이 정보 반환
    } catch (error) {
        console.error("❌ 아이 검색 실패:", error.response ? error.response.data : error.message);
        return null; // 🔹 실패 시 `null` 반환
    }
};
