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
import '../Css/CounselorBoardNoticeWritePage.css';

function CounselorBoardNoticeWritePage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
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
    if (!text.trim()) {
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

      await createNotice(title, text);
      
      // SingleButtonAlert로 성공 메시지 표시
      await SingleButtonAlert('공지사항이 등록되었습니다.');
      
      setPaActiveTab("notice");
      navigate('/counselor/board');

    } catch (error) {
      // SingleButtonAlert로 에러 메시지 표시
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
            name="demo[]"
            url={'/api/upload'}
            multiple
            maxFileSize={1000000}
            emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>}
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