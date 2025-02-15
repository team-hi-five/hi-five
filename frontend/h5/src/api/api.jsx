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
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshingToken = false;
let failedRequestsQueue = [];

// 토큰 재발급 API 요청
export const refreshToken = async () => {
  try {
    console.log("📢 토큰 재발급 요청");
    
    // refresh token을 헤더에 포함하여 요청
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    const response = await api.post("/auth/refresh", null, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`  // refresh token을 Authorization 헤더에 포함
      }
    });

    console.log("✅ 토큰 재발급 성공:", response.data);
    
    // 새로운 토큰들 저장
    sessionStorage.setItem("access_token", response.data.accessToken);
    if (response.data.refreshToken) {  // 새로운 refresh token이 있다면 저장
      sessionStorage.setItem("refresh_token", response.data.refreshToken);
    }

    // 저장된 요청들 다시 실행
    failedRequestsQueue.forEach((callback) => callback(response.data.accessToken));
    failedRequestsQueue = [];

    return response.data.accessToken;
  } catch (error) {
    console.error("❌ 토큰 재발급 실패:", error.response ? error.response.data : error.message);
    
    // 토큰 관련 데이터 모두 삭제
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    
    // 실패한 요청들 처리
    failedRequestsQueue.forEach((callback) => callback(null));
    failedRequestsQueue = [];
    
    // 로그인 페이지로 리다이렉트
    window.location.href = "/";
    
    throw error;
  } finally {
    refreshingToken = false;
  }
};

// 요청 인터셉터
api.interceptors.request.use((config) => {
  // 예외 처리: 인증 없이 접근 가능한 엔드포인트
  if (noAuthEndpoints.some((endpoint) => config.url.includes(endpoint))) {
    return config;
  }

  const accessToken = sessionStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = "/";
    return Promise.reject(new Error("로그인이 필요합니다."));
  }

  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 디버깅 로그
    console.error("응답 인터셉터 에러:", error);
    if (error.response) {
      console.warn(`에러 상태: ${error.response.status} / 요청 URL: ${originalRequest.url}`);
    }

    // 예외 처리: 인증 제외 엔드포인트
    if (noAuthEndpoints.some((endpoint) => originalRequest.url.includes(endpoint))) {
      return Promise.reject(error);
    }

    // 401 상태 코드이고 재시도하지 않은 요청인 경우 => 현재 403인데 백엔드 수정되면 401로 변경
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshingToken) {
        refreshingToken = true;
        try {
          const newAccessToken = await refreshToken();
          // 새로운 토큰으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("토큰 재발급 실패:", refreshError);
          return Promise.reject(refreshError);
        }
      } else {
        // 이미 토큰 재발급 진행 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;