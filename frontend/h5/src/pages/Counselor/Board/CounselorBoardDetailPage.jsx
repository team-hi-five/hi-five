import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import CounselorHeader from "/src/components/Counselor/CounselorHeader";
import SingleButtonAlert from '../../../components/common/SingleButtonAlert';
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert";
import { getNoticeDetail, deleteNotice, updateNotice } from '../../../api/boardNotice';
import { getFaqDetail, updateFaq, deleteFaq } from '../../../api/boardFaq';
import { getQnaDetail, deleteQna, createQnaAnswer, updateQnaComment, deleteQnaComment } from '../../../api/boardQna';
import '../Css/CounselorBoardDetailPage.css';


function CounselorBoardDetailPage() {
  const navigate = useNavigate();
  const { type, no } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [noticeData, setNoticeData] = useState(null);  // 공지사항 데이터 state 추가
  const [isLoading, setIsLoading] = useState(false);   // 로딩 상태 추가
  const [faqData, setFaqData] = useState(null);
  const [qnaData, setQnaData] = useState(null);
  
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswerContent, setEditedAnswerContent] = useState("");
  const editableRef = useRef(null);

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
    setEditedTitle(postData.title);
    setEditedContent(postData.content);
  };

  const handleEditComplete = async () => {
    try {
        // 수정된 내용이 없으면 경고
        if (!editedContent) {
            await SingleButtonAlert('수정할 내용을 입력해주세요.');
            return;
        }

        // 제목이 비어있으면 경고
        if (!editedTitle) {
          await SingleButtonAlert('제목을 입력해주세요.');
          return;
        }

        if (type === "notice") {
            await updateNotice(no, editedTitle, editedContent);
            // await SingleButtonAlert("성공적으로 수정되었습니다.");
            await fetchNoticeDetail(no);
        } else if (type === "faq") {
            await updateFaq(no, editedTitle, "GENERAL", editedContent); // type은 임시로 "GENERAL"로 설정
            // await SingleButtonAlert("성공적으로 수정되었습니다.");
            await fetchFaqDetail(no);
        }
        
        setIsEditing(false);
        setEditedTitle("");
        setEditedContent("");
        setSelectedFile(null);
        
    } catch (error) {
        console.error('수정 처리 중 오류 발생:', error);
        const errorMessage = type === "notice" 
            ? '공지사항 수정에 실패했습니다.' 
            : 'FAQ 수정에 실패했습니다.';
            
        await SingleButtonAlert(
            error.response?.data?.message || errorMessage
        );
    }
};

const handleDelete = async () => {
  try {
      const result = await DoubleButtonAlert("정말 삭제 하시겠습니까?");
      if (result.isConfirmed) {
          if (type === "notice") {
              await deleteNotice(no);
              await SingleButtonAlert("성공적으로 삭제되었습니다.");
              navigate('/counselor/board');
          } else if (type === "faq") {
              await deleteFaq(no);
              await SingleButtonAlert("성공적으로 삭제되었습니다.");
              navigate('/counselor/board');
          } else if (type === "qna") {  // QnA 삭제 로직 추가
              await deleteQna(no);
              await SingleButtonAlert("성공적으로 삭제되었습니다.");
              navigate('/counselor/board');
          }
      }
  } catch (error) {
      console.error('삭제 처리 중 오류 발생:', error);
      if (error.response?.status === 403) {
          await SingleButtonAlert('삭제 권한이 없습니다.');
      } else {
          const errorMessage = type === "notice" 
              ? '공지사항 삭제에 실패했습니다.' 
              : type === "faq"
              ? 'FAQ 삭제에 실패했습니다.'
              : 'QnA 삭제에 실패했습니다.';  // QnA 에러 메시지 추가
          await SingleButtonAlert(
              error.response?.data?.message || errorMessage
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

  const handleQnaCommentEdit = async (commentId) => {
    try {
      if (!editedAnswerContent.trim()) {
        await SingleButtonAlert('수정할 내용을 입력해주세요.');
        return;
      }

      console.log(commentId)
  
      await updateQnaComment(commentId, editedAnswerContent);
      
      setAnswers(answers.map(answer => 
        answer.id === commentId 
          ? { ...answer, content: editedAnswerContent }
          : answer
      ));
  
      setEditingAnswerId(null);
      setEditedAnswerContent("");
      await SingleButtonAlert('댓글이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('댓글 수정 중 오류 발생:', error);
      await SingleButtonAlert(
        error.response?.data?.message || 'QnA 댓글 수정에 실패했습니다.'
      );
    }
  };

  const handleQnaCommentDelete = async (commentId) => {
    try {
      const result = await DoubleButtonAlert("정말 댓글을 삭제하시겠습니까?");
      
      if (result.isConfirmed) {
        await deleteQnaComment(commentId);
        
        // 답변 목록에서 해당 댓글 제거
        setAnswers([]);
        
        // QnA 상태를 답변 대기로 변경
        setQnaData(prev => ({
          ...prev,
          status: "답변대기"
        }));
  
        await SingleButtonAlert('댓글이 성공적으로 삭제되었습니다.');
      }
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
      await SingleButtonAlert(
        error.response?.data?.message || 'QnA 댓글 삭제에 실패했습니다.'
      );
    }
  };

  // 상대적 시간을 계산하는 함수
const getTimeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInMilliseconds = now - past;
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return '방금 전';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  } else {
    return past.toLocaleDateString();
  }
};

const handleAnswerSubmit = async () => {
  try {
    if (!answer.trim()) {
      await SingleButtonAlert('답변 내용을 입력해주세요.');
      return;
    }

    if (answers.length > 0) {
      await SingleButtonAlert('이미 답변이 작성되었습니다.');
      return;
    }

    const response = await createQnaAnswer(no, answer);
    
    // 서버 응답의 createDttm 사용
    setAnswers([{
      id: response.id,
      content: answer,
      writer: response.name || "상담사",
      createDttm: response.createDttm, // 서버에서 받은 시간 사용
      time: getTimeAgo(response.createDttm), // 서버 시간 기준으로 계산
      profileImageUrl: response.profileImageUrl || "/no.png"
    }]);

    setQnaData(prev => ({
      ...prev,
      status: "답변완료"
    }));
    
    await SingleButtonAlert('답변이 등록되었습니다.');
    setAnswer('');
    
  } catch (error) {
    console.error('답글 작성 중 오류 발생:', error);
    await SingleButtonAlert(
      error.response?.data?.message || 'QnA 답글 작성에 실패했습니다.'
    );
  }
};

  const handleAnswerEdit = (id) => {
  const targetAnswer = answers.find(a => a.id === id);
  if (targetAnswer) {
    setEditedAnswerContent(targetAnswer.content || ""); // 먼저 내용을 설정
    setEditingAnswerId(id); // 그 다음 editing 상태를 변경
  }
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
        writer: response.name || "운영자",
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

  // FAQ 상세 정보 조회 함수 
const fetchFaqDetail = async (id) => {
  try {
    setIsLoading(true);
    const response = await getFaqDetail(id);
    
    // API 응답 데이터를 컴포넌트에서 사용하는 형식으로 변환
    const formattedData = {
      no: response.id,
      title: response.title,
      content: response.faqAnswer
    };
  
    setFaqData(formattedData);
  } catch (error) {
    console.error("FAQ 상세 조회 실패:", error);
    await SingleButtonAlert(
      error.response?.data?.message || 'FAQ를 불러오는데 실패했습니다.'
    );
    navigate('/counselor/board');
  } finally {
    setIsLoading(false);
  }
};
  // Qna 상세 정보 조회 함수
  const fetchQnaDetail = async (id) => {
    try {
      setIsLoading(true);
      const response = await getQnaDetail(id);
      
      // API 응답 데이터를 컴포넌트에서 사용하는 형식으로 변환
      const formattedData = {
        no: response.id,
        title: response.title,
        writer: response.name || "익명",
        content: response.content,
        status: response.qnaAnswerResponseList?.length > 0 ? "답변완료" : "답변대기",
        date: new Date(response.createDttm).toISOString().split('T')[0]
      };
  
      // 답변이 있으면 첫 번째 답변만 사용
      if (response.qnaAnswerResponseList && response.qnaAnswerResponseList.length > 0) {
        const firstAnswer = response.qnaAnswerResponseList[0];
        setAnswers([{
          id: firstAnswer.id,
          content: firstAnswer.content,
          writer: firstAnswer.name || "상담사",
          createDttm: firstAnswer.createDttm, // 원본 시간 저장
          time: getTimeAgo(firstAnswer.createDttm), // 상대적 시간으로 변환
          profileImageUrl: firstAnswer.profileImageUrl || "/no.png"
        }]);
      } else {
        setAnswers([]);
      }
    
      setQnaData(formattedData);
    } catch (error) {
      console.error("QnA 상세 조회 실패:", error);
      await SingleButtonAlert(
        error.response?.data?.message || 'QnA를 불러오는데 실패했습니다.'
      );
      navigate('/counselor/board');
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  if (no && !viewCountUpdated.current) {
    if (type === "notice") {
      fetchNoticeDetail(no);
    } else if (type === "faq") {
      fetchFaqDetail(no);
    } else if (type === "qna") {
      fetchQnaDetail(no);  // QnA 상세 조회 추가
    }
    viewCountUpdated.current = true;
  }
}, [type, no]);

  // 해당하는 게시판 데이터를 가져옴
  let postData;
  if (type === "notice") {
    postData = noticeData;  // API로 받아온 데이터 사용
  } else if (type === "faq") {
    postData = faqData;
  } else if (type === "qna") {
    postData = qnaData;
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
              {isEditing ? (
                  <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="co-detail-post-title-input"
                  />
              ) : (
                  <h2 className="co-detail-post-title">{postData.title}</h2>
              )}
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

            {(type === "notice" || type === "qna") && (
              <div className="co-detail-info-text">
                <span><strong>작성자:</strong> {postData.writer}</span>
                {type === "qna" && <span> | <strong>답변 상태:</strong> {postData.status}</span>}
                <span> | <strong>작성일:</strong> {postData.date}</span>
                {type === "notice" && <span> | <strong>조회수:</strong> {postData.views}회</span>}
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
                      <>
                        <button 
                          onClick={() => handleQnaCommentEdit(answers[0].id)} 
                          className="co-detail-answer-edit"
                        >
                          수정완료
                        </button>
                        <button 
                          onClick={() => {
                            setEditingAnswerId(null);
                            setEditedAnswerContent("");
                          }} 
                          className="co-detail-answer-delete"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleAnswerEdit(answers[0].id)} 
                          className="co-detail-answer-edit"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => handleQnaCommentDelete(answers[0].id)} 
                          className="co-detail-answer-delete"
                        >
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
                      <img 
                        src={answers[0].profileImageUrl} 
                        alt="프로필" 
                        className='co-detail-answer-info-img' 
                      />
                      <span className="co-detail-answer-writer">{answers[0].writer}님</span>
                      <span className="co-detail-answer-time">{answers[0].time}</span>
                    </div>
                    <div 
                      className="co-detail-answer-info-content"
                      ref={editingAnswerId === answers[0].id ? editableRef : null}
                      contentEditable={editingAnswerId === answers[0].id}
                      onInput={(e) => editingAnswerId === answers[0].id && setEditedAnswerContent(e.target.textContent || "")}
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