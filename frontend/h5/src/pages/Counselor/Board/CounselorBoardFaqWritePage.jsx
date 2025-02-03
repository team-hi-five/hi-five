import { useState } from "react";
import { Editor } from "primereact/editor";
import { FileUpload } from 'primereact/fileupload';
import { Dropdown } from 'primereact/dropdown';
import CounselorHeader from "/src/components/Counselor/CounselorHeader";
import SingleButtonAlert from "/src/components/common/SingleButtonAlert";
import '../Css/CounselorBoardFaqWritePage.css';

function CounselorBoardFaqWritePage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [selectedType, setSelectedType] = useState(null);

  const faqTypeOptions = [
    { label: '이용안내', value: 'usage' },
    { label: '아동상담/문의', value: 'child' },
    { label: '센터이용/문의', value: 'center' }
  ];

  const handleSubmit = async () => {
    await SingleButtonAlert('질문 등록이 완료되었습니다.');
  };

  const handleCancel = () => {
    window.history.back(); // 브라우저 내장 뒤로가기
  };

  return (
    <div className="co-write-page">
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
          <button className="co-write-submit" onClick={handleSubmit}>등록</button>
          <button className="co-write-cancel" onClick={handleCancel}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default CounselorBoardFaqWritePage;