import api from "./api";

export const chapter = async () => {
  try {
    console.log("요청 시작");
    console.log("토큰 확인:", sessionStorage.getItem("access_token"));
    const response = await api.get("/asset/load-chapter-asset");
    console.log("요청 성공:", response);
    return response.data;
  } catch (error) {
    console.error("요청 실패:", error.response?.status, error.response?.data);
    return null;
  }
};
