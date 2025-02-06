import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import CounselorHeader from "/src/components/Counselor/CounselorHeader";
import SingleButtonAlert from '../../../components/common/SingleButtonAlert';
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert";
import { getNoticeDetail, deleteNotice, updateNotice } from '../../../api/boardNotice';
import '../Css/CounselorBoardDetailPage.css';

// 샘플 데이터

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

  const [noticeData, setNoticeData] = useState(null);  // 공지사항 데이터 state 추가
  const [isLoading, setIsLoading] = useState(false);   // 로딩 상태 추가
  
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const editableRef = useRef(null);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswerContent, setEditedAnswerContent] = useState("");

  useEffect(() => {
    if (editingAnswerId && editableRef.current) {
      editableRef.current.textContent = editedAnswerContent;
      editableRef.current.focus();
      // 커서를 끝으로 이동
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editingAnswerId]);

  useEffect(() => {
    if (isEditing && editableRef.current) {
        editableRef.current.innerHTML = editedContent || postData.content;
    }
  }, [isEditing]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(postData.content);
  };

  const handleEditComplete = async () => {
    try {
        // 수정된 내용이 없으면 경고
        if (!editedContent) {
            await SingleButtonAlert('수정할 내용을 입력해주세요.');
            return;
        }

        await updateNotice(no, postData.title, editedContent);
        await SingleButtonAlert("성공적으로 수정되었습니다.");
        
        // 수정 성공 후 상태 업데이트
        await fetchNoticeDetail(no);  // 데이터 다시 불러오기
        setIsEditing(false);
        setSelectedFile(null);
        
    } catch (error) {
        console.error('수정 처리 중 오류 발생:', error);
        await SingleButtonAlert(
            error.response?.data?.message || '공지사항 수정에 실패했습니다.'
        );
    }
};

  const handleDelete = async () => {
    try {
        // 토큰 확인
        const token = sessionStorage.getItem("access_token");
        if (!token) {
            await SingleButtonAlert("로그인이 필요한 서비스입니다.");
            navigate('/login');
            return;
        }

        const result = await DoubleButtonAlert("정말 삭제 하시겠습니까?");
        if (result.isConfirmed) {
            await deleteNotice(no);
            await SingleButtonAlert("성공적으로 삭제되었습니다.");
            navigate('/counselor/board');
        }
    } catch (error) {
        console.error('삭제 처리 중 오류 발생:', error);
        if (error.response?.status === 403) {
            await SingleButtonAlert('삭제 권한이 없습니다.');
        } else {
            await SingleButtonAlert(
                error.response?.data?.message || '공지사항 삭제에 실패했습니다.'
            );
        }
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
  const targetAnswer = answers.find(a => a.id === id);
  if (targetAnswer) {
    setEditedAnswerContent(targetAnswer.content || ""); // 먼저 내용을 설정
    setEditingAnswerId(id); // 그 다음 editing 상태를 변경
  }
};

  const handleAnswerEditComplete = () => {
    if (editedAnswerContent.trim()) {
      setAnswers(answers.map(answer => 
        answer.id === editingAnswerId 
          ? { ...answer, content: editedAnswerContent }
          : answer
      ));
      setEditingAnswerId(null);
      setEditedAnswerContent("");
    }
  };

  const handleAnswerDelete = (id) => {
    setAnswers(answers.filter(a => a.id !== id));
  };

  // 조회 여부를 추적하기 위한 ref 추가
  const viewCountUpdated = useRef(false);

  // 공지사항 상세 정보 조회 함수
  const fetchNoticeDetail = async (id) => {
    try {
      setIsLoading(true);
      const response = await getNoticeDetail(id);
      
      // API 응답 데이터를 컴포넌트에서 사용하는 형식으로 변환
      const formattedData = {
        no: response.id,
        title: response.title,
        writer: response.consultantUserEmail || "운영자",
        content: response.content,
        views: response.viewCnt,
        date: new Date(response.createDttm).toISOString().split('T')[0]
      };
      
      setNoticeData(formattedData);
    } catch (error) {
      console.error("공지사항 상세 조회 실패:", error);
      await SingleButtonAlert(
        error.response?.data?.message || '공지사항을 불러오는데 실패했습니다.'
      );
      navigate('/counselor/board');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (type === "notice" && no && !viewCountUpdated.current) {
      fetchNoticeDetail(no);
      viewCountUpdated.current = true;  // 조회수 업데이트 완료 표시
    }
  }, [type, no]);

  // 해당하는 게시판 데이터를 가져옴
  let postData;
  if (type === "notice") {
    postData = noticeData;  // API로 받아온 데이터 사용
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

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return (
      <div className="co-detail-page">
        <CounselorHeader />
        <div className="co-detail-container">
          <div className="co-detail-topbar">
            <button className="co-detail-back-btn" onClick={handleBack}>
              ←
            </button>
            <span className="co-detail-top-title">공지사항 상세보기</span>
          </div>
          <div className="co-detail-card">
            <div className="co-detail-loading">로딩 중...</div>
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
                {isEditing ? (
                    <div
                        ref={editableRef}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        className="co-detail-content-editable"
                        onInput={(e) => {
                            const newContent = e.currentTarget.innerHTML;
                            if (newContent !== editedContent) {
                                setEditedContent(newContent);
                            }
                        }}
                    />
                ) : (
                    <div
                        dangerouslySetInnerHTML={{ __html: postData.content }}
                        className="co-detail-content-view"
                    />
                )}
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
                      {editingAnswerId === answers[0].id ? (
                        <button onClick={handleAnswerEditComplete} className="co-detail-answer-edit">
                          수정완료
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleAnswerEdit(answers[0].id)} className="co-detail-answer-edit">
                            수정
                          </button>
                          <button onClick={() => handleAnswerDelete(answers[0].id)} className="co-detail-answer-delete">
                            삭제
                          </button>
                        </>
                      )}
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
                    <div 
                      ref={editableRef}
                      contentEditable={editingAnswerId === answers[0].id}
                      className="co-detail-answer-info-content"
                      onInput={(e) => setEditedAnswerContent(e.target.textContent || "")}
                      suppressContentEditableWarning={true}
                    >
                      {!editingAnswerId && answers[0].content}
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