import { useState } from "react";
import { Editor } from "primereact/editor"; // PrimeReact Editor import
import ParentHeader from "/src/components/Parent/ParentHeader";
import "./ParentBoardWritePage.css";

function ParentBoardWritePage() {
  const [title, setTitle] = useState(""); // 제목 상태 관리
  const [text, setText] = useState(""); // Editor 내용 상태 관리

  return (
    <div className="pa-write-page">
      <ParentHeader />

      <div className="pa-write-container">
        {/* 제목 입력 필드 */}
        <label className="pa-write-label">제목</label>
        <input
          type="text"
          className="pa-write-input"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 내용 입력 필드 */}
        <label className="pa-write-label">내용</label>
        <Editor
          value={text}
          onTextChange={(e) => setText(e.htmlValue)}
          style={{ height: "320px" }}
        />

        {/* 등록 버튼 (가운데 정렬) */}
        <div className="pa-write-buttons">
          <button className="pa-write-submit">등록</button>
        </div>
      </div>
    </div>
  );
}

export default ParentBoardWritePage;
