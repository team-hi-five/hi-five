import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_API_URL; // .env 파일에서 API 주소 가져오기

const instance = axios.create({
    baseURL: API_URL, // 환경 변수에서 API 기본 주소 불러오기
    headers: {
        "Content-Type": "application/json"
    }
});

// 요청 인터셉터 - `Authorization` 헤더 토큰 추가
instance.interceptors.request.use((config) => {
    const accessToken = sessionStorage.getItem("access_token");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
        delete config.headers.Authorization;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default instance;
