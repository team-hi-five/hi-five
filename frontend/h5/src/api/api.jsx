import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_API_URL;

const noAuthEndpoints = [
  "/auth/login",
  "/auth/parent/find-id",
  "/user/parent/temp-pwd",
  "/user/consultant/find-id",
  "/user/consultant/temp-pwd",
];

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 토큰 재발급 요청 상태 관리 (무한 루프 방지)
let refreshingToken = false;
let failedRequestsQueue = [];

// 토큰 재발급 API 요청
export const refreshToken = async () => {
  try {
    console.log("📢 토큰 재발급 요청");

    const response = await api.post("/auth/refresh");

    console.log("✅ 토큰 재발급 성공:", response.data);
    sessionStorage.setItem("access_token", response.data.accessToken);

    // 저장된 요청들 다시 실행
    failedRequestsQueue.forEach((callback) => callback(response.data.accessToken));
    failedRequestsQueue = [];

    return response.data.accessToken;
  } catch (error) {
    console.error("❌ 토큰 재발급 실패:", error.response ? error.response.data : error.message);

    // 모든 대기 중인 요청을 실패 처리
    failedRequestsQueue.forEach((callback) => callback(null));
    failedRequestsQueue = [];

    throw error;
  } finally {
    refreshingToken = false; // 상태 초기화
  }
};

// 요청 인터셉터 (Access Token 자동 포함 및 로그인 체크)
api.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem("access_token");

  // 예외 처리: 인증 없이 접근 가능한 엔드포인트라면 체크하지 않음
  if (noAuthEndpoints.some(endpoint => config.url.includes(endpoint))) {
    console.warn(`🔹 예외 처리된 요청 (${config.url}) - 토큰 확인 건너뜀`);
    return config;
  }

  // 토큰이 없으면 로그인 페이지로 이동
  if (!accessToken) {
    console.warn("🔹 인증되지 않은 접근 감지. 로그인 페이지로 이동합니다.");
    window.location.href = "/";
    return Promise.reject(new Error("로그인이 필요합니다."));
  }

  // 정상적인 요청은 토큰을 포함하여 보냄
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});



// 응답 인터셉터 (Access Token 만료 시 자동 갱신)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 예외 처리: 특정 API는 refreshToken 호출 X
    if (noAuthEndpoints.some(endpoint => originalRequest.url.includes(endpoint))) {
      console.warn(`🔹 예외 처리된 요청 (${originalRequest.url})`);
      return Promise.reject(error);
    }

    // 403 오류 (Access Token 만료) && 무한 루프 방지
    if (error.response?.status === 401) {
      if (refreshingToken) {
        console.log("🔄 기존 토큰 갱신 요청이 진행 중... 요청을 큐에 저장");
        
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axios(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      refreshingToken = true; // 토큰 갱신 요청 플래그 설정

      try {
        const newAccessToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest); // 원래 요청 재시도
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
