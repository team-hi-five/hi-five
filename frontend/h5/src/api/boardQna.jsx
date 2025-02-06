import api from "./api";

// ✅ QnA 작성 API 요청
export const createQna = async (title, content) => {
    try {
        console.log("📢 QnA 작성 요청:", { title, content });

        // 필수 입력값 검증
        if (!title || !content) {
            throw new Error("제목과 내용은 필수 입력값입니다.");
        }

        const response = await api.post("/qna/write", {
            title: title,
            content: content
        });

        console.log("✅ QnA 작성 성공:", response.data);
        return response.data;

    } catch (error) {
        console.error("❌ QnA 작성 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};