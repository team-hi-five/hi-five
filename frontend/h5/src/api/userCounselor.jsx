import api from "./api";

// 상담사 마이페이지 정보 조회 API 요청
export const getCounselorMyPage = async () => {
    try {
        console.log("📢 상담사 마이페이지 정보 요청");
        const response = await api.post("/user/consultant/my-profile");
        return response.data;
    } catch (error) {
        console.error("❌ 상담사 마이페이지 정보 불러오기 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 상담사 계정 비밀번호 변경 API 요청
export const changeConsultantPassword = async ( oldPwd, newPwd) => {
    try {
        console.log("📢 상담사 비밀번호 변경 요청:", {  oldPwd, newPwd });
        const response = await api.post("/user/consultant/change-pwd", {
            oldPwd: oldPwd,
            newPwd: newPwd
        });
        return response.data;
    } catch (error) {
        console.error("❌ 상담사 비밀번호 변경 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 상담사 계정 아이들 정보 가져오기 API 요청
export const getConsultantChildren = async () => {
    try {
        console.log("📢 상담사 아이들 리스트 요청");
        const response = await api.post("/user/consultant/get-my-children");
        console.log("✅ 아이들 리스트 불러오기 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 상담사 아이들 정보 불러오기 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 특정 아이 정보 가져오기 API 요청
export const getConsultantChild = async (childUserId) => {
    try {
        console.log("📢 특정 아이 정보 요청:", { childUserId });
        const response = await api.get("/user/consultant/get-child", {
            params: { childUserId: Number(childUserId) }
        });
        console.log("✅ 특정 아이 정보 불러오기 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 특정 아이 정보 불러오기 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};