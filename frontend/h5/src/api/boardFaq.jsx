import api from "./api";

// ✅ FAQ 글 작성 API 요청
// export const createFaq = async (title, content, faqAnswer) => {
//     try {
//         console.log("📢 FAQ 작성 요청:", { title, content, faqAnswer });

//         // 필수 입력값 검증
//         if (!title || !content || !faqAnswer) {
//             throw new Error("제목, 내용, 답변은 필수 입력값입니다.");
//         }

//         const response = await api.post("/faq/write", {
//             title: title,
//             content: content,
//             faqAnswer: faqAnswer
//         });

//         console.log("✅ FAQ 작성 성공:", response.data);
//         return response.data;

//     } catch (error) {
//         console.error("❌ FAQ 작성 실패:", error.response ? error.response.data : error.message);
//         throw error;
//     }
// };