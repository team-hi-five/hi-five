import axios from "axios";

// 환경 변수에서 서버 URL 불러오기
const API_URL = import.meta.env.VITE_SERVER_API_URL || "https://i12c205.p.ssafy.io:8443";

// ✅ 토큰 갱신이 필요 없는 API 엔드포인트 목록
const noAuthEndpoints = [
  "/auth/login",    // 로그인
  "/auth/logout",   // 로그아웃
  "/auth/parent/find-id",  // 부모 계정 아이디 찾기
];

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ✅ 토큰 재발급 API 요청 함수
export const refreshToken = async () => {
  try {
    console.log("📢 토큰 재발급 요청");

    const response = await api.post("/auth/refresh");

    console.log("✅ 토큰 재발급 성공:", response.data);
    sessionStorage.setItem("access_token", response.data.accessToken);

    return response.data.accessToken;
  } catch (error) {
    console.error("❌ 토큰 재발급 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// 요청 인터셉터 (Access Token 자동 포함)
api.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem("access_token");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 응답 인터셉터 (Access Token 만료 시 자동 갱신, 특정 API는 예외 처리)
api.interceptors.response.use(
  (response) => response, // 정상 응답 시 그대로 반환
  async (error) => {
    const originalRequest = error.config;

    // ✅ 예외 처리: 로그인, 로그아웃, 부모 계정 아이디 찾기는 refreshToken 호출 X
    if (noAuthEndpoints.some(endpoint => originalRequest.url.includes(endpoint))) {
      console.warn(`🔹 예외 처리된 요청 (${originalRequest.url})`);
      return Promise.reject(error);
    }

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지

      try {
        // ✅ 기존 refreshToken 함수 사용하여 새 Access Token 요청
        const newAccessToken = await refreshToken();

        // ✅ 새 Access Token을 저장하고, 원래 요청을 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (err) {
        console.error("❌ 토큰 갱신 실패. 재로그인 필요");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token"); // 혹시 사용하고 있다면 삭제
        window.location.href = "/login"; // 로그인 페이지로 이동
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
