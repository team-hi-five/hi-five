import { useState, useRef } from "react";
import { Toast } from 'primereact/toast';
import { Editor } from "primereact/editor";
import { FileUpload } from 'primereact/fileupload';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from "../../../store/boardStore";
import ParentHeader from "/src/components/Parent/ParentHeader";
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert";
import SingleButtonAlert from "/src/components/common/SingleButtonAlert";
import { createQna } from "../../../api/boardQna";
import "/src/pages/Parent/ParentCss/ParentBoardWritePage.css";

function ParentBoardWritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // text -> content로 변경
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const setPaActiveTab = useBoardStore(state => state.setPaActiveTab);

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
    if (!content.trim()) {
      showToast('warn', '알림', '내용을 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
      try {
        if (!validateForm()) {
          return;
        }
  
        if (isSubmitting) {
          return;
        }
        setIsSubmitting(true);
  
        await createQna(title, content);
        
        // SingleButtonAlert로 성공 메시지 표시
        await SingleButtonAlert('질문이 등록되었습니다.');
        
        setPaActiveTab("qna");
        navigate('/parent/board');
  
      } catch (error) {
        // SingleButtonAlert로 에러 메시지 표시
        await SingleButtonAlert(error.response?.data?.message || '질문문 등록에 실패했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    };
  

    const handleCancel = async () => {
      if (title.trim() || content.trim()) {
        // DoubleButtonAlert로 확인
        const result = await DoubleButtonAlert(
          '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
          '예',
          '아니오'
        );
        
        if (result) {
          setPaActiveTab("qna");
          navigate('/parent/board');
        }
      } else {
        setPaActiveTab("qna");
        navigate('/parent/board');
      }
    };

  return (
    <div className="pa-write-page">
      <ParentHeader />

      <div className="pa-write-container">
        <label className="pa-write-label">제목</label>
        <input
          type="text"
          className="pa-write-input"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="pa-write-label">내용</label>
        <Editor
          value={content}
          onTextChange={(e) => setContent(e.htmlValue)}
          style={{ height: "180px" }}
        />

        {/* Editor와 FileUpload 사이에 10px 공간 추가 */}
        <div style={{ marginTop: "15px" }}>
          <label className="pa-write-label">첨부파일</label>
          <FileUpload 
            name="demo[]" 
            url={'/api/upload'} 
            multiple 
            maxFileSize={1000000}
            emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} 
          />
        </div>

        <div className="pa-write-buttons">
          <button 
            className="pa-write-submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록'}
          </button>
          <button className="pa-write-cancel" onClick={handleCancel}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParentBoardWritePage;
