import { useState } from "react";
import { Editor } from "primereact/editor";
import { FileUpload } from 'primereact/fileupload';
import ParentHeader from "/src/components/Parent/ParentHeader";
import SingleButtonAlert from "/src/components/common/SingleButtonAlert";
import "/src/pages/Parent/ParentCss/ParentBoardWritePage.css";

function ParentBoardWritePage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    await SingleButtonAlert('질문 등록이 완료되었습니다.');
  };

  const handleCancel = () => {
    window.history.back(); // 브라우저 내장 뒤로가기
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
          value={text}
          onTextChange={(e) => setText(e.htmlValue)}
          style={{ height: "180px" }}
        />

        {/* Editor와 FileUpload 사이에 10px 공간 추가 */}
        <div style={{ marginTop: "15px" }}>
          <FileUpload 
            name="demo[]" 
            url={'/api/upload'} 
            multiple 
            maxFileSize={1000000}
            emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} 
          />
        </div>

        <div className="pa-write-buttons">
          <button className="pa-write-submit" onClick={handleSubmit}>등록</button>
          <button className="pa-write-cancel" onClick={handleCancel}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParentBoardWritePage;
