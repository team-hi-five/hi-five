import api from "./api";

// ✅ 파일 업로드 API 요청
export const uploadFile = async (file, tblType, tblId) => {
    try {
        console.log("📢 파일 업로드 요청:", { file, tblType, tblId });

        // FormData 객체 생성
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tblType', tblType);
        formData.append('tblId', tblId);

        const response = await api.post("/file/upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("✅ 파일 업로드 성공:", response.data);
        return response.data;

    } catch (error) {
        console.error("❌ 파일 업로드 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// tblType ENUM 값 상수 정의
export const TBL_TYPES = {
    PROFILE: 'P', // 프로필
    NOTICE: 'N',  // 공지사항
    QNA: 'Q',     // 질문게시판
    GALLERY: 'G', // 게임영상
    QA: 'QA'      // 질문 답변
};