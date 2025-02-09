import api from "./api";

export const reviewGame = async (chapter, stage) => {
  try {
    console.log("📢 게임데이터 요청 시작");
    console.log(typeof chapter, chapter);
    console.log(typeof stage, stage);

    const accessToken = sessionStorage.getItem("access_token");
    console.log(accessToken);

    const response = await api.get("/asset/load-stage-asset", {
      params: {
        chapter: Number(chapter),
        stage: Number(stage),
      },
    });

    console.log("✅ 게임데이터 요청 성공:", response);

    return response.data;
  } catch (error) {
    console.log("📡 전송된 데이터:", error.config?.data); // 요청 데이터 확인
    console.log("📡 전송된 데이터 타입:", typeof error.config?.data);
    console.error("❌ 게임데이터 요청 실패:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config,
    });
    return null;
  }
};
