import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_API_URL; // ✅ .env 파일에서 API 주소 가져오기

const instance = axios.create({
    baseURL: API_URL, // ✅ 환경 변수에서 API 기본 주소 불러오기
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true // ✅ 필요에 따라 쿠키 인증 사용 가능
});

// ✅ 요청 인터셉터 - `Authorization` 헤더를 토큰이 있을 때만 추가
instance.interceptors.request.use((config) => {
    const accessToken = sessionStorage.getItem("access_token"); // ✅ sessionStorage에서 Access Token 가져오기
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
        delete config.headers.Authorization; // ✅ 토큰이 없으면 헤더에서 제거
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default instance;
