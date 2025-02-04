import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_API_URL; // ✅ .env 파일에서 API 주소 가져오기

const instance = axios.create({
    baseURL: API_URL, // ✅ 환경 변수에서 API 기본 주소 불러오기
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true // ✅ 필요에 따라 쿠키 인증 사용 가능
});

// ✅ 요청 인터셉터 - `Authorization` 헤더 자동 추가 (LocalStorage에서 가져옴)
instance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access_token"); // ✅ LocalStorage에서 Access Token 가져오기
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default instance;
