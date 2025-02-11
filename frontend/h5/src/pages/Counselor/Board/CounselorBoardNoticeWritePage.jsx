import { useState, useRef } from "react";
import { Toast } from 'primereact/toast';
import { Editor } from "primereact/editor";
import { FileUpload } from 'primereact/fileupload';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../../../store/boardStore';
import CounselorHeader from "/src/components/Counselor/CounselorHeader";
import SingleButtonAlert from "/src/components/common/SingleButtonAlert";
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert";
import { createNotice } from "../../../api/boardNotice";
import { uploadFile, TBL_TYPES } from "../../../api/file";
import '../Css/CounselorBoardNoticeWritePage.css';

function CounselorBoardNoticeWritePage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const setPaActiveTab = useBoardStore(state => state.setPaActiveTab);
  // selectedFiles state 추가
  const [selectedFiles, setSelectedFiles] = useState([]);

  const showToast = (severity, summary, detail) => {
    toast.current.show({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 3000
    });
  };

  const validateForm = () => {
    if (!title.trim()) {
      showToast('warn', '알림', '제목을 입력해주세요.');
      return false;
    }
    if (!text.trim()) {
      showToast('warn', '알림', '내용을 입력해주세요.');
      return false;
    }
    return true;
  };

  // 파일 선택 핸들러 추가
  const handleFileSelect = (event) => {
    const files = event.files;
    // 파일 크기 검증
    const oversizedFiles = files.filter(file => file.size > 1000000);
    
    if (oversizedFiles.length > 0) {
      showToast('warn', '알림', '1MB 이상의 파일은 업로드할 수 없습니다.');
      return;
    }
    
    setSelectedFiles(files);
  };

  // handleSubmit 함수 수정
  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;
      if (isSubmitting) return;
      setIsSubmitting(true);

      // 1. 공지사항 생성
      const noticeResponse = await createNotice(title, text);
      const noticeId = noticeResponse.noticeId || noticeResponse.data?.noticeId;

      // 2. 파일 업로드
      if (noticeId && selectedFiles.length > 0) {
        let uploadedFiles = [];
        let failedUploads = 0;
        
        for (const file of selectedFiles) {
          try {
            const response = await uploadFile(file, TBL_TYPES.NOTICE, noticeId);
            
            if (Array.isArray(response)) {
              uploadedFiles = [...uploadedFiles, ...response];
            } else if (response) {
              uploadedFiles.push(response);
            }
          } catch (uploadError) {
            console.error("파일 업로드 실패:", uploadError);
            failedUploads++;
          }
        }
        
        // 업로드 결과 확인
        if (failedUploads > 0) {
          await SingleButtonAlert(
            `${uploadedFiles.length}개 파일 업로드 완료, ${failedUploads}개 파일 업로드 실패`
          );
        }
      }

      await SingleButtonAlert('공지사항이 등록되었습니다.');
      setPaActiveTab("notice");
      navigate('/counselor/board');

    } catch (error) {
      await SingleButtonAlert(error.response?.data?.message || '공지사항 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (title.trim() || text.trim()) {
      // DoubleButtonAlert로 확인
      const result = await DoubleButtonAlert(
        '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
        '예',
        '아니오'
      );
      
      if (result) {
        setPaActiveTab("notice");
        navigate('/counselor/board');
      }
    } else {
      setPaActiveTab("notice");
      navigate('/counselor/board');
    }
  };

  return (
    <div className="co-write-page">
      <Toast ref={toast} />
      <CounselorHeader />
      <div className="co-write-container">
        <label className="co-write-label">제목</label>
        <input
          type="text"
          className="co-write-input"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
          
        <label className="co-write-label">내용</label>
        <Editor
          value={text}
          onTextChange={(e) => setText(e.htmlValue)}
          style={{ height: "180px" }}
        />

        {/* Editor와 FileUpload 사이에 10px 공간 추가 */}
        <div style={{ marginTop: "15px" }}>
          <label className="co-write-label">첨부파일</label>
          <FileUpload 
            name="files" 
            customUpload={true}
            onSelect={handleFileSelect}
            multiple 
            maxFileSize={1000000}
            accept="image/*,.pdf,.doc,.docx"
            emptyTemplate={<p className="m-0">파일을 드래그하거나 선택하여 업로드하세요. (최대 1MB)</p>} 
            auto={false}
          />
        </div>

        <div className="co-write-buttons">
          <button 
            className="co-write-submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록'}
          </button>
          <button className="co-write-cancel" onClick={handleCancel}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default CounselorBoardNoticeWritePage;