import api from "./api";

// 부모 마이페이지 정보 조회 API 요청
export const getParentMyPage = async () => {
    try {
        console.log("📢 부모 마이페이지 정보 요청");

        const response = await api.post("/user/parent/my-page");
        
        console.log("✅ 마이페이지 정보 불러오기 성공:", response.data);

        return response.data;
    } catch (error) {
        console.error("❌ 마이페이지 정보 불러오기 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 학부모 계정 비밀번호 변경 API 요청
export const changeParentPassword = async (email, oldPwd, newPwd) => {
    try {
        console.log("📢 학부모 비밀번호 변경 요청:", { email, oldPwd, newPwd });

        const response = await api.post("/user/parent/change-pwd", {
            email: email,
            oldPwd: oldPwd,
            newPwd: newPwd
        });

        console.log("✅ 학부모 비밀번호 변경 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 학부모 비밀번호 변경 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};