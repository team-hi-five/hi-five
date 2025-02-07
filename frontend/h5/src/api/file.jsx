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


// ✅ 파일 URL 조회 API 요청
export const getFileUrl = async (tblType, tblId) => {
    try {
        // 필수값 검증
        if (!tblType) {
            throw new Error("테이블 타입은 필수 입력값입니다.");
        }
        if (!tblId) {
            throw new Error("테이블 ID는 필수 입력값입니다.");
        }
        
        console.log("📢 파일 URL 조회 요청:", { tblType, tblId });
        
        const response = await api.get(`/file/urls/${tblType}/${tblId}`, {
            params: {
                tblType: tblType,
                tblId: tblId
            }
        });
        
        console.log("✅ 파일 URL 조회 성공:", response.data);
        return response.data;
        
    } catch (error) {
        console.error("❌ 파일 URL 조회 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 파일 다운로드 API 요청
export const downloadFile = async (fileId) => {
    try {
        // 필수값 검증
        if (!fileId) {
            throw new Error("파일 ID는 필수 입력값입니다.");
        }

        console.log("📢 파일 다운로드 요청:", { fileId });

        const response = await api.get(`/file/download/${fileId}`, {
            responseType: 'blob', // 파일 다운로드를 위해 responseType을 blob으로 설정
        });

        // 파일 다운로드 처리
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Content-Disposition 헤더에서 파일명 추출
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'download'; // 기본 파일명
        if (contentDisposition) {
            const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (matches && matches[1]) {
                fileName = matches[1].replace(/['"]/g, '');
            }
        }
        
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log("✅ 파일 다운로드 성공");
        return response.data;

    } catch (error) {
        console.error("❌ 파일 다운로드 실패:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ✅ 파일 삭제 API 요청
export const deleteFile = async (fileId) => {
    try {
        // 필수값 검증
        if (!fileId) {
            throw new Error("파일 ID는 필수 입력값입니다.");
        }

        console.log("📢 파일 삭제 요청:", { fileId });

        const response = await api.delete(`/file/${fileId}`);

        console.log("✅ 파일 삭제 성공:", response.data);
        return response.data;

    } catch (error) {
        console.error("❌ 파일 삭제 실패:", error.response ? error.response.data : error.message);
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