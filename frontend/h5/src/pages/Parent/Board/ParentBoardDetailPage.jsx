import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import CounselorHeader from "/src/components/Counselor/CounselorHeader";
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert";
import SingleButtonAlert from '../../../components/common/SingleButtonAlert';
import { getNoticeDetail } from '../../../api/boardNotice';
import { getFaqDetail } from '../../../api/boardFaq';
import { getQnaDetail, updateQna, deleteQna } from '../../../api/boardQna';
import { getFileUrl, downloadFile } from '../../../api/file';
import '../../Counselor/Css/CounselorBoardDetailPage.css'

function CounselorBoardDetailPage() {
  const navigate = useNavigate();
  const { type, no } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");

  const [noticeData, setNoticeData] = useState(null);
  const [faqData, setFaqData] = useState(null);
  const [qnaData, setQnaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [answers, setAnswers] = useState([]);
  // const [viewCountUpdated, setViewCountUpdated] = useState(false);

  const [fileUrls, setFileUrls] = useState([]);
  const [fileError, setFileError] = useState(null);


  const viewCountUpdated = useRef(false);

  // HTML 태그를 제거하는 함수 추가
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  // getTimeAgo 함수 추가
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

  // 파일 URL을 가져오는 함수 추가
  const fetchFileUrls = async (type, id) => {
    try {
      const response = await getFileUrl(type, id);
      if (response) {
        setFileUrls(Array.isArray(response) ? response : [response]);
      }
    } catch (error) {
      console.error("파일 URL 조회 실패:", error);
      setFileError("파일을 불러오는데 실패했습니다.");
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditedTitle(postData.title);
    setEditedContent(stripHtml(postData.content));
  };

  const handleEditComplete = async () => {
    try {
      if (!editedContent) {
        await SingleButtonAlert('수정할 내용을 입력해주세요.');
        return;
      }
  
      if (!editedTitle) {
        await SingleButtonAlert('제목을 입력해주세요.');
        return;
      }
  
      if (type === "qna") {
        const updatedQna = await updateQna(no, editedTitle, editedContent);
        
        const formattedData = {
          ...qnaData,
          title: updatedQna.title || editedTitle,
          content: updatedQna.content || editedContent,
          writer: updatedQna.name || qnaData.writer,
          status: updatedQna.answerYn ? "답변완료" : "미답변",
          date: updatedQna.createDttm ? new Date(updatedQna.createDttm).toISOString().split('T')[0] : qnaData.date
        };
  
        setQnaData(formattedData);
      }
      
      setIsEditing(false);
      setEditedTitle("");
      setEditedContent("");
      setSelectedFile(null);
      
    } catch (error) {
      console.error('수정 처리 중 오류 발생:', error);
      await SingleButtonAlert(
        error.response?.data?.message || 'QnA 수정에 실패했습니다.'
      );
    }
  };

  const handleDelete = async () => {
    try {
      const result = await DoubleButtonAlert("정말 삭제 하시겠습니까?");
      if (result.isConfirmed) {
        if (type === "qna") {
          await deleteQna(no);
          await SingleButtonAlert("성공적으로 삭제되었습니다.");
          navigate('/parent/board');
        }
      }
    } catch (error) {
      console.error('삭제 처리 중 오류 발생:', error);
      await SingleButtonAlert(
        error.response?.data?.message || 'QnA 삭제에 실패했습니다.'
      );
    }
  };

  // 상세 데이터 가져오기 (수정된 부분)
  useEffect(() => {
    if (no && !viewCountUpdated.current) {  
      const fetchData = async () => {
        try {
          setIsLoading(true);
          
          if (type === "notice") {
            const response = await getNoticeDetail(no);
            
            const formattedData = {
              no: response.id,
              title: response.title,
              content: response.content,
              writer: response.name || "운영자",
              views: response.viewCnt || 0,
              date: new Date(response.createDttm).toISOString().split('T')[0]
            };
            
            setNoticeData(formattedData);
            // 파일 URL 조회
            await fetchFileUrls('N', response.id);

          } else if (type === "faq") {
            const response = await getFaqDetail(no);
            
            const formattedData = {
              no: response.id,
              title: response.title,
              content: response.faqAnswer,
              type: response.type === "usage"
                ? "이용안내"
                : response.type === "child"
                ? "아동상담/문의"
                : response.type === "center"
                ? "센터이용/문의"
                : "기타"
            };
            
            setFaqData(formattedData);
            // 파일 URL 조회
            await fetchFileUrls('N', response.id);

          } else if (type === "qna") {
            const response = await getQnaDetail(no);

            const formattedData = {
              no: response.id,
              title: response.title,
              content: response.content,
              writer: response.name,
              status: response.answerCnt > 0 ? "답변완료" : "미답변",
              date: new Date(response.createDttm).toISOString().split('T')[0]
            };

            if (response.qnaAnswerResponseList && response.qnaAnswerResponseList.length > 0) {
              const formattedAnswers = response.qnaAnswerResponseList.map(answer => ({
                id: answer.id,
                writer: answer.name || "상담사",
                content: answer.content,
                time: getTimeAgo(answer.createDttm),
                profileImageUrl: answer.profileImageUrl || "/no.png"
              }));
              setAnswers(formattedAnswers);
            } else {
              setAnswers([]);
            }
        
            setQnaData(formattedData);
            // 파일 URL 조회
            await fetchFileUrls('Q', response.id);
          }
        } catch (error) {
          console.error("데이터 조회 실패:", error);
          await SingleButtonAlert(
            error.response?.data?.message || '데이터를 불러오는데 실패했습니다.'
          );
          navigate(-1);
        } finally {
          setIsLoading(false);
        }
        viewCountUpdated.current = true;
      };
      fetchData();
    }
  }, [type, no]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // 게시판 데이터 선택
  let postData;
  if (type === "notice") {
    postData = noticeData;
  } else if (type === "faq") {
    postData = faqData;
  } else if (type === "qna") {
    postData = qnaData;
  }

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="co-detail-page">
        <CounselorHeader />
        <div className="co-detail-container">
          <div className="co-detail-loading">
            <div className="co-detail-loading-spinner"></div>
            <p>데이터를 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    );
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
                {type === "qna" && !isEditing && (
                  <button onClick={handleEdit} className="co-detail-edit-btn">
                    수정
                  </button>
                )}
                {type === "qna" && (
                  isEditing ? (
                    <button onClick={handleEditComplete} className="co-detail-edit-btn">
                      수정완료
                    </button>
                  ) : (
                    <button onClick={handleDelete} className="co-detail-delete-btn">
                      삭제
                    </button>
                  )
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
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={(e) => setEditedContent(e.currentTarget.textContent || "")}
                  className="co-detail-content-editable"
                >
                  {stripHtml(postData.content)}
                </div>
              ) : (
                <div 
                  className="co-detail-content-text"
                  dangerouslySetInnerHTML={{ __html: postData.content }}
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
                <div className="co-detail-file-list">
                  <h4>첨부파일</h4>
                  {fileError ? (
                    <p className="co-detail-file-error">{fileError}</p>
                  ) : fileUrls.length > 0 ? (
                    <div className="co-detail-file-buttons">
                      {fileUrls.map((file, index) => (
                        <button 
                          key={index}
                          onClick={async () => {
                            try {
                              await downloadFile(file.fileId, file.fileName);
                            } catch (error) {
                              console.error("파일 다운로드 실패:", error);
                              await SingleButtonAlert("파일 다운로드에 실패했습니다.");
                            }
                          }}
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
                </div>
                
                {answers.length > 0 ? (
                  answers.map((ans) => (
                    <div key={ans.id} className="co-detail-answer-content">
                      <div className="co-detail-answer-info">
                        <img src="/no.png" alt="프로필" className="co-detail-answer-info-img" />
                        <span className="co-detail-answer-writer">{ans.writer}</span>
                        <span className="co-detail-answer-time">{ans.time}</span>
                      </div>
                      <div className="co-detail-answer-info-content">
                        {ans.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="co-detail-answer-input-area">
                    <p className="co-detail-no-answer">아직 답변이 없습니다.</p>
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