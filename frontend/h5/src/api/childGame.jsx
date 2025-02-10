import api from "./api";

// 게임 챕터 리스트(복습하기)
export const chapter = async () => {
  try {
    console.log("📢 게임리스트 요청 시작");

    const childUserId = sessionStorage.getItem("childId");
    const response = await api.get("/asset/load-chapter-asset",{
      params : {childUserId}
    });
    console.log("✅ 게임 리스트 요청 성공:", response);
    return response.data;
  } catch (error) {
    console.error(
      "❌ 게임 리스트 요청 실패:",
      error.response?.status,
      error.response?.data
    );
    return null;
  }
};

// 카드
// export const GameCard = async () => {
//   try {
//   } catch (error) {
//     console.error(
//       "❌ 요청 실패:",
//       error.response?.status,
//       error.response?.data
//     );
//     return null;
//   }
// };
