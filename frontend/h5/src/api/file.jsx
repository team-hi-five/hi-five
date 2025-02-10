import api from "./api";

export const TBL_TYPES = {
    PROFILE: 'P',
    NOTICE: 'N', 
    QNA: 'Q',    
    GALLERY: 'G',
    QA: 'QA'     
};

export const uploadFile = async (file, tblType, tblId) => {
    try {
        // 파라미터 유효성 검사
        if (!file) throw new Error('File is required');
        if (!tblType) throw new Error('tblType is required');
        if (!Object.values(TBL_TYPES).includes(tblType)) {
            throw new Error(`Invalid tblType: ${tblType}. Valid types are: ${Object.values(TBL_TYPES).join(', ')}`);
        }
        if (!tblId) throw new Error('tblId is required');

        const formData = new FormData();
        formData.append('file', file);
        
        // metaData를 JSON 배열 형태로 변환하여 추가
        const metaData = JSON.stringify({ tblType: [tblType], tblId: [tblId] });
        formData.append('metaData', new Blob([metaData], { type: 'application/json' }));

        const response = await api.post("/file/upload", formData, {
            headers: {
                // Content-Type은 FormData 사용 시 자동 설정됨
            },
        });

        return response.data;

    } catch (error) {
        console.error("❌ 파일 업로드 실패:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
            method: error.config?.method,
        });
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
            headers: {
                'Content-Type': 'application/json'
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
export const downloadFile = async (fileId, fileName) => {
    try {
        if (!fileId) {
            throw new Error("파일 ID는 필수 입력값입니다.");
        }

        console.log("📢 파일 다운로드 요청:", { fileId });

        const response = await api.get(`/file/download/${fileId}`, {
            params: { fileId },
            responseType: 'blob'
        });

        const blob = new Blob([response.data], { 
            type: response.headers['content-type'] || 'application/octet-stream'
        });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 전달받은 원본 파일명 사용
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