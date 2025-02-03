import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import CounselorHeader from "/src/components/Counselor/CounselorHeader";
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert";
import '../Css/CounselorBoardDetailPage.css';

// 샘플 데이터
const noticeData = [
  { no: 11, title: "새로운 기능 안내", writer: "운영자", views: 128, date: "2025-01-22", content: "새로운 기능에 대한 공지사항 내용입니다." },
  { no: 10, title: "점검 공지", writer: "운영자", views: 99, date: "2025-01-18", content: "사이트 점검 관련 공지사항 내용입니다." },
];

const faqData = [
  { no: 2, title: "자주 묻는 질문 TOP5", writer: "운영자", content: "자주 묻는 질문에 대한 답변입니다." },
  { no: 1, title: "계정 관련 FAQ", writer: "운영자", content: "계정 관련 질문에 대한 답변입니다." },
];

const qnaData = [
  { no: 3, title: "문의드립니다", writer: "홍길동", status: "미답변", date: "2025-01-23", content: "문의드립니다." },
  { no: 2, title: "결제 관련 문의", writer: "김철수", status: "답변완료", date: "2025-01-17", content: "결제 관련 문의입니다." },
];

function CounselorBoardDetailPage() {
  const navigate = useNavigate();
  const { type, no } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [isAnswerEditing, setIsAnswerEditing] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(postData.content);
  };

  const handleEditComplete = async () => {
    try {
      // API 호출이 들어갈 자리
      // 예: await updatePost(type, no, { content: editedContent, file: selectedFile });
      
      // 임시로 데이터 직접 수정 (API 연동 시 제거)
      if (type === "notice") {
        const postIndex = noticeData.findIndex(post => post.no === Number(no));
        if (postIndex !== -1) {
          noticeData[postIndex] = {
            ...noticeData[postIndex],
            content: editedContent
          };
        }
      } else if (type === "faq") {
        const postIndex = faqData.findIndex(post => post.no === Number(no));
        if (postIndex !== -1) {
          faqData[postIndex] = {
            ...faqData[postIndex],
            content: editedContent
          };
        }
      }

      setIsEditing(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('수정 처리 중 오류 발생:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await DoubleButtonAlert("정말 삭제 하시겠습니까?");
      if (result.isConfirmed) {
        // 삭제 API 호출이 들어갈 자리
        // 예: await deletePost(type, no);
        navigate(`/counselor/board`);
      }
    } catch (error) {
      console.error('삭제 처리 중 오류 발생:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnswerSubmit = () => {
    if (answer.trim()) {
      const newAnswer = {
        id: Date.now(),
        content: answer,
        writer: "ooo 상담사님",
        time: "10분전"
      };
      setAnswers([...answers, newAnswer]);
      setAnswer('');
    }
  };

  const handleAnswerEdit = (id) => {
    setIsAnswerEditing(true);
    const targetAnswer = answers.find(a => a.id === id);
    if (targetAnswer) {
      setAnswer(targetAnswer.content);
    }
  };

  const handleAnswerDelete = (id) => {
    setAnswers(answers.filter(a => a.id !== id));
  };

  // 해당하는 게시판 데이터를 가져옴
  let postData;
  if (type === "notice") {
    postData = noticeData.find((post) => post.no === Number(no));
  } else if (type === "faq") {
    postData = faqData.find((post) => post.no === Number(no));
  } else if (type === "qna") {
    postData = qnaData.find((post) => post.no === Number(no));
  }

  // 데이터가 없을 경우 처리
  if (!postData) {
    return (
      <div className="co-detail-page">
        <CounselorHeader />
        <div className="co-detail-container">
          <div className="co-detail-topbar">
            <button className="co-detail-back-btn" onClick={handleBack}>
              ←
            </button>
            <span className="co-detail-top-title">게시글 상세보기</span>
          </div>
          <div className="co-detail-card">
            <h2 className="co-detail-post-title">게시글을 찾을 수 없습니다.</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="co-detail-page">
      <CounselorHeader />
      <div className="co-detail-container">
        {/* 질문 영역 */}
        <div className="question-section">
          {!isEditing ? (
            <div className="co-detail-topbar">
              <button className="co-detail-back-btn" onClick={handleBack}>
                ←
              </button>
              <span className="co-detail-top-title">
                {type === "notice" ? "공지사항" : type === "faq" ? "FAQ" : "질문"}
              </span>
            </div> 
          ) : <div className="co-detail-topbar2">
          </div>}

          <div className="co-detail-card">
            <div className="co-detail-title-section">
              <h2 className="co-detail-post-title">{postData.title}</h2>
              <div className="co-detail-buttons">
                {!isEditing && type !== "qna" && (
                  <button onClick={handleEdit} className="co-detail-edit-btn">
                    수정
                  </button>
                )}
                {isEditing ? (
                  <button onClick={handleEditComplete} className="co-detail-edit-btn">
                    수정완료
                  </button>
                ) : (
                  <button onClick={handleDelete} className="co-detail-delete-btn">
                    삭제
                  </button>
                )}
              </div>
            </div>

            {type === "notice" || type === "qna" ? (
              <div className="co-detail-info-text">
                <span><strong>작성자:</strong> {postData.writer}</span>
                {type === "qna" && <span> | <strong>답변 상태:</strong> {postData.status}</span>}
                <span> | <strong>작성일:</strong> {postData.date}</span>
                {type === "notice" && <span> | <strong>조회수:</strong> {postData.views}회</span>}
              </div>
            ) : (
              <div className="co-detail-info-text">
                <strong>작성자:</strong> {postData.writer}
              </div>
            )}

            <div className="co-detail-content">
              <div
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onInput={(e) => setEditedContent(e.currentTarget.textContent || "")}
                className={isEditing ? "co-detail-content-editable" : ""}
              >
                {postData.content}
              </div>
            </div>

            <div className="co-detail-file">
              {isEditing ? (
                <>
                  <input
                    type="file"
                    id="fileInput" 
                    onChange={handleFileChange}
                    className="co-detail-file-input"
                  />
                  <label htmlFor="fileInput" className="co-detail-file-label">파일 선택</label>
                  <span className="co-detail-file-name">
                    {selectedFile ? selectedFile.name : '선택된 파일 없음'}
                  </span>
                </>
              ) : (
                "첨부파일"
              )}
            </div>
          </div>
        </div>

        {/* 답변 영역 */}
        {type === "qna" && (
          <div className="answer-section">
            <div className="co-detail-card">
              <div className="co-detail-answer">
                <div className="co-detail-answer-header">
                  <h3 className="co-detail-answer-title">답변</h3>
                  {answers.length > 0 && (
                    <div className="co-detail-answer-buttons">
                      <button onClick={() => handleAnswerEdit(answers[0].id)} className="co-detail-answer-edit">
                        수정
                      </button>
                      <button onClick={() => handleAnswerDelete(answers[0].id)} className="co-detail-answer-delete">
                        삭제
                      </button>
                    </div>
                  )}
                </div>
                {answers.length === 0 ? (
                  <div className='co-detail-answer-input-area-full'>
                    <div className="co-detail-answer-input-area">
                      <div 
                        contentEditable={true}
                        className="co-detail-answer-input"
                        onInput={(e) => setAnswer(e.currentTarget.textContent || "")}
                        suppressContentEditableWarning={true}
                        placeholder="질문에 대한 답변을 남겨주세요."
                      />
                    </div>
                    <button 
                      onClick={handleAnswerSubmit}
                      className="co-detail-answer-submit"
                    >
                      답글작성하기
                    </button>
                  </div>
                ) : (
                  <div className="co-detail-answer-content">
                    <div className="co-detail-answer-info">
                      <img src="/no.png" alt="" className='co-detail-answer-info-img' />
                      <span className="co-detail-answer-writer">{answers[0].writer}</span>
                      <span className="co-detail-answer-time">{answers[0].time}</span>
                    </div>
                    <div className="co-detail-answer-info-content">
                      {answers[0].content}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CounselorBoardDetailPage;