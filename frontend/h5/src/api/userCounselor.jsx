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
        return response.data;
    } catch (error) {
        console.error("❌ 특정 아이 정보 불러오기 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 상담사 계정에서 학부모 계정 등록 API 요청
export const registerParentAccount = async ({
    parentName,
    parentEmail,
    parentPhone,
    childName,
    childBirth,
    childGender,
    firstConsultDt,
    childInterest = "",
    childAdditionalInfo = ""
}) => {
    try {
        console.log("📢 학부모 계정 등록 요청:");

        // API 호출
        const response = await api.post("/user/consultant/register-parent-account", {
            parentName,
            parentEmail,
            parentPhone,
            childName,
            childBirth,
            childGender,
            firstConsultDt,
            childInterest,
            childAdditionalInfo
        });
        return response.data;
    } catch (error) {
        console.error("❌ 학부모 계정 등록 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 상담사 계정 회원 탈퇴 요청 리스트 불러오기 API 요청
export const getParentDeleteRequests = async () => {
    try {
        console.log("📢 상담사 탈퇴 요청 리스트 불러오기 요청");
        const response = await api.post("/user/delete/get-my-delete");

        console.log("✅ 상담사 탈퇴 요청 리스트 불러오기 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 상담사 탈퇴 요청 리스트 불러오기 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 상담사 탈퇴 요청 승인 (회원 삭제 승인)
export const approveDeleteRequest = async (deleteUserRequestID) => {
    try {
        console.log("📢 탈퇴 요청 승인:", deleteUserRequestID);
        const response = await api.get("/user/delete/approve", {
            params: { deleteUserRequestID }
        });
        console.log("✅ 탈퇴 요청 승인 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 탈퇴 요청 승인 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 상담사 탈퇴 요청 거절 (회원 삭제 거절)
export const rejectDeleteRequest = async (deleteUserRequestID) => {
    try {
        console.log("📢 탈퇴 요청 거절:", deleteUserRequestID);
        const response = await api.get("/user/delete/reject", {
            params: { deleteUserRequestID }
        });
        console.log("✅ 탈퇴 요청 거절 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 탈퇴 요청 거절 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};
