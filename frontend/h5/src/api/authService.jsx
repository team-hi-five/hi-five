import api from "./api";

// ✅ 로그인 API 요청
export const login = async (email, password, role) => {
    try {
        console.log("📢 로그인 요청:", { email, password, role });

        const response = await api.post("/auth/login", {
            email: email,
            pwd: password,
            role: role
        });

        console.log("✅ 로그인 성공:", response.data);

        // 쿠키에 토큰 저장 (1시간 유지)
        sessionStorage.setItem("access_token", response.data.accessToken);

        return response.data;
    } catch (error) {
        console.error("❌ 로그인 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};


// ✅ 로그아웃 API 요청
export const logout = async () => {
    try {
        const accessToken = sessionStorage.getItem("access_token");
        if (!accessToken) {
            console.warn("❌ 로그아웃 실패: 토큰이 없습니다.");
            return;
        }

        console.log("📢 로그아웃 요청 보냄: ", accessToken);

        // 서버에 로그아웃 요청 (Request Body에 `accessToken` 포함)
        const response = await api.post("/auth/logout", null, { 
            params:{token: accessToken}
         });

        console.log("✅ 로그아웃 성공:", response.data);

        sessionStorage.removeItem("access_token");

        return response.data;
    } catch (error) {
        console.error("❌ 로그아웃 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};
