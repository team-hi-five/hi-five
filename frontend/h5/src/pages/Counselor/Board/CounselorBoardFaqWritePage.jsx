import { useState, useRef } from "react";
import { Toast } from 'primereact/toast';
import { Editor } from "primereact/editor";
import { FileUpload } from 'primereact/fileupload';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../../../store/boardStore';
import CounselorHeader from "/src/components/Counselor/CounselorHeader";
import SingleButtonAlert from "/src/components/common/SingleButtonAlert";
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert";
import { createFaq } from "../../../api/boardFaq";
import { uploadFile, TBL_TYPES } from "../../../api/file";
import '../Css/CounselorBoardFaqWritePage.css';

function CounselorBoardFaqWritePage() {
  const [title, setTitle] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const setPaActiveTab = useBoardStore(state => state.setPaActiveTab);
  const [selectedFiles, setSelectedFiles] = useState([]); // 선택된 파일 state 추가

  const faqTypeOptions = [
    { label: '이용안내', value: 'usage' },
    { label: '아동상담/문의', value: 'child' },
    { label: '센터이용/문의', value: 'center' }
  ];

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
    if (!selectedType) {
      showToast('warn', '알림', '유형을 선택해주세요.');
      return false;
    }
    if (!faqAnswer.trim()) {
      showToast('warn', '알림', '답변을 입력해주세요.');
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

      // 1. FAQ 생성
      const faqResponse = await createFaq(title, selectedType, faqAnswer);
      const faqId = faqResponse.faqId || faqResponse.data?.faqId;

      // 2. 파일 업로드
      if (faqId && selectedFiles.length > 0) {
        let uploadedFiles = [];
        let failedUploads = 0;
        
        for (const file of selectedFiles) {
          try {
            const response = await uploadFile(file, TBL_TYPES.FAQ_FILE, faqId);
            
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

      await SingleButtonAlert('FAQ가 등록되었습니다.');
      setPaActiveTab("faq");
      navigate('/counselor/board');

    } catch (error) {
      console.error('FAQ 등록 실패:', error);
      await SingleButtonAlert(error.response?.data?.message || 'FAQ 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = async () => {
    if (title.trim() || faqAnswer.trim() || selectedType) {
      const result = await DoubleButtonAlert(
        '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
        '예',
        '아니오'
      );
      
      if (result) {
        setPaActiveTab("faq");
        navigate('/counselor/board');
      }
    } else {
      setPaActiveTab("faq");
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
        
        <label className="co-write-label">유형</label>
        <Dropdown
          value={selectedType}
          onChange={(e) => setSelectedType(e.value)}
          options={faqTypeOptions}
          placeholder="유형 선택"
          className="co-write-dropdown"
        />
          
        <label className="co-write-label">답변</label>
        <Editor
          value={faqAnswer}
          onTextChange={(e) => setFaqAnswer(e.htmlValue)}
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

export default CounselorBoardFaqWritePage;