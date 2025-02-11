import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Toast } from 'primereact/toast';
import CounselorHeader from "/src/components/Counselor/CounselorHeader";
import SingleButtonAlert from '../../../components/common/SingleButtonAlert';
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert";
import { getNoticeDetail, deleteNotice, updateNotice } from '../../../api/boardNotice';
import { getFaqDetail, updateFaq, deleteFaq } from '../../../api/boardFaq';
import { getQnaDetail, deleteQna, createQnaAnswer, updateQnaComment, deleteQnaComment } from '../../../api/boardQna';
import { getFileUrl, downloadFile, uploadFile, deleteFile} from '../../../api/file';
import '../Css/CounselorBoardDetailPage.css';


function CounselorBoardDetailPage() {
  const navigate = useNavigate();
  const { type, no } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [selectedFile, setSelectedFile] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [noticeData, setNoticeData] = useState(null);  // 공지사항 데이터 state 추가
  const [isLoading, setIsLoading] = useState(false);   // 로딩 상태 추가
  const [faqData, setFaqData] = useState(null);
  const [qnaData, setQnaData] = useState(null);
  
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswerContent, setEditedAnswerContent] = useState("");
  const editableRef = useRef(null);

  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [fileUrls, setFileUrls] = useState([]);
  const [fileError, setFileError] = useState(null);
  
  // 해당하는 게시판 데이터를 가져옴
  let postData;
  if (type === "notice") {
    postData = noticeData;  // API로 받아온 데이터 사용
  } else if (type === "faq") {
    postData = faqData;
  } else if (type === "qna") {
    postData = qnaData;
  }

  const handleFileDelete = async (fileId) => {
    console.log("삭제 시도하는 fileId:", fileId); // 추가
    try {
      // UI에서 먼저 파일을 제거
      setFileUrls(files => files.filter(file => file.fileId !== fileId));
      setDeletedFileIds(prev => {
        const newDeletedFileIds = [...prev, fileId];
        console.log("fileId 추가 후 deletedFileIds:", newDeletedFileIds); // 추가
        return newDeletedFileIds;
      });
      
      // 수정 모드가 아닐 때만 즉시 서버에서 삭제
      if (!isEditing) {
        await deleteFile(fileId);
      }
    } catch (error) {
      console.error('파일 삭제 중 오류:', error);
      toast.current.show({
        severity: 'error',
        summary: '오류',
        detail: '파일 삭제에 실패했습니다.',
        life: 3000
      });
      
      // 삭제 실패 시 UI 상태 복구
      setFileUrls(prevFiles => {
        const deletedFile = prevFiles.find(file => file.fileId === fileId);
        return deletedFile ? [...prevFiles, deletedFile] : prevFiles;
      });
      setDeletedFileIds(prev => prev.filter(id => id !== fileId));
    }
  };

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
      setEditedContent(postData.content);
      setEditedTitle(postData.title);
      if (fileUrls.length > 0) {
        setSelectedFile({
          name: fileUrls[0].fileName,
          id: fileUrls[0].fileId
        });
      }
    }
  }, [isEditing, postData,  editedContent, fileUrls]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedTitle(postData.title);
    setEditedContent(postData.content);
  };

  const fetchFileUrls = async (type, id) => {
    try {
      const response = await getFileUrl(type, id);
      if (response) {
        const filteredFiles = Array.isArray(response) 
          ? response.filter(file => !deletedFileIds.includes(file.fileId))
          : [response];
        setFileUrls(filteredFiles);
      }
    } catch (error) {
      console.error("파일 URL 조회 실패:", error);
      setFileError("파일을 불러오는데 실패했습니다.");
    }
  };

  const handleFileSelect = (event) => {
    const files = event.files;
    const oversizedFiles = files.filter(file => file.size > 1000000);
    
    if (oversizedFiles.length > 0) {
      toast.current.show({
        severity: 'warn',
        summary: '알림',
        detail: '1MB 이상의 파일은 업로드할 수 없습니다.',
        life: 3000
      });
      return;
    }
    
    setSelectedFiles(files);
  };

  const handleEditComplete = async () => {
    try {
      console.log("수정 시작 시점의 deletedFileIds:", deletedFileIds); // 추가

      if (!editedContent) {
        await SingleButtonAlert('수정할 내용을 입력해주세요.');
        return;
      }

      if (!editedTitle) {
        await SingleButtonAlert('제목을 입력해주세요.');
        return;
      }

      // 1. 게시글 수정
      if (type === "notice") {
        await updateNotice(no, editedTitle, editedContent);
      } else if (type === "faq") {
        await updateFaq(no, editedTitle, "GENERAL", editedContent);
      }

      // 2. 삭제된 파일들 처리
      console.log("파일 삭제 직전의 deletedFileIds:", deletedFileIds); // 추가
      const deletePromises = deletedFileIds.map(fileId => deleteFile(fileId));
      await Promise.all(deletePromises);
      console.log("파일 삭제 완료 후 deletedFileIds:", deletedFileIds); // 추가

      // 3. 새로운 파일 업로드
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(file => 
          uploadFile(file, type === "notice" ? 'N' : 'F', no)
        );
        
        try {
          await Promise.all(uploadPromises);
        } catch (error) {
          console.error("일부 파일 업로드 실패:", error);
          await SingleButtonAlert('일부 파일 업로드에 실패했습니다.');
        }
      }

      // 상태 초기화
      setIsEditing(false);
      setEditedTitle("");
      setEditedContent("");
      setSelectedFiles([]);
      setDeletedFileIds([]);

      // 데이터 새로고침
      if (type === "notice") {
        await fetchNoticeDetail(no);
      } else if (type === "faq") {
        await fetchFaqDetail(no);
      }
      await fetchFileUrls(type === "notice" ? 'N' : 'F', no);
      
    } catch (error) {
      console.error('수정 처리 중 오류 발생:', error);
      const errorMessage = type === "notice" ? '공지사항 수정에 실패했습니다.' : 'FAQ 수정에 실패했습니다.';
      await SingleButtonAlert(error.response?.data?.message || errorMessage);
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

  const handleQnaCommentEdit = async (qnaCommentId) => {
    try {
      if (!editedAnswerContent.trim()) {
        await SingleButtonAlert('수정할 내용을 입력해주세요.');
        return;
      }

      console.log(qnaCommentId)
  
      await updateQnaComment(qnaCommentId, editedAnswerContent);
      
      setAnswers(answers.map(answer => 
        answer.id === qnaCommentId 
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

  const handleQnaCommentDelete = async (qnaCommentId) => {
    try {
      const result = await DoubleButtonAlert("정말 댓글을 삭제하시겠습니까?");
      
      if (result.isConfirmed) {
        await deleteQnaComment(qnaCommentId);
        
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
    // dateString이 유효한지 먼저 확인
    if (!dateString) return '방금 전';
  
    try {
      const now = new Date();
      const past = new Date(dateString);
      
      // past가 유효한 날짜인지 확인
      if (isNaN(past.getTime())) {
        return '방금 전';
      }
  
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
    } catch (error) {
      console.error('날짜 변환 중 오류:', error);
      return '방금 전';
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
      // profileImageUrl: response.profileImageUrl || "/no.png"
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
  const fetchNoticeDetail = async (noticeId) => {
    try {
      setIsLoading(true);
      const response = await getNoticeDetail(noticeId);
      
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
      fetchFileUrls('N', no);
    } else if (type === "faq") {
      fetchFaqDetail(no);
      // fetchFileUrls('N', no);
    } else if (type === "qna") {
      fetchQnaDetail(no);  // QnA 상세 조회 추가
      fetchFileUrls('Q', no);
    }
    viewCountUpdated.current = true;
  }
}, [type, no]);

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
                <div className="co-detail-file-upload">
                  <label htmlFor="fileInput" className="co-detail-file-label">
                    파일 추가
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const oversizedFiles = files.filter(file => file.size > 1000000);
                      
                      if (oversizedFiles.length > 0) {
                        toast.current.show({
                          severity: 'warn',
                          summary: '알림',
                          detail: '1MB 이상의 파일은 업로드할 수 없습니다.',
                          life: 3000
                        });
                        return;
                      }
                      setSelectedFiles(prev => [...prev, ...files]);
                    }}
                    accept="image/*,.pdf,.doc,.docx"
                    className="co-detail-file-input"
                  />
                  <div className="co-detail-selected-files">
                    {/* 기존 파일 목록 */}
                    {fileUrls.map((file, index) => (
                      <div key={`existing-${index}`} className="co-detail-file-item">
                        <span>{file.fileName}</span>
                        <button
                          onClick={() => handleFileDelete(file.fileId)}
                          className="co-detail-file-remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {/* 새로 선택한 파일 목록 */}
                    {selectedFiles.map((file, index) => (
                      <div key={`new-${index}`} className="co-detail-file-item">
                        <span>{file.name}</span>
                        <button
                          onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                          className="co-detail-file-remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="co-detail-file-list">
                  <h4>첨부파일</h4>
                  {fileError ? (
                    <p className="co-detail-file-error">{fileError}</p>
                  ) : fileUrls.length > 0 ? (
                    <div className="co-detail-file-buttons">
                      {fileUrls.map((file, index) => (
                        <button 
                          key={index}
                          onClick={() => downloadFile(file.fileId, file.fileName)}
                          className="co-detail-file-download-btn"
                        >
                          <span className="p-file-name">{file.fileName}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p>첨부파일이 없습니다.</p>
                  )}
                </div>
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