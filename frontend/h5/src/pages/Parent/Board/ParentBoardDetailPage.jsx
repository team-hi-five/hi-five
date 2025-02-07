import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import CounselorHeader from "/src/components/Counselor/CounselorHeader";
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert";
import SingleButtonAlert from '../../../components/common/SingleButtonAlert';
import { getNoticeDetail } from '../../../api/boardNotice';
import { getFaqDetail } from '../../../api/boardFaq';
import { getQnaDetail, updateQna, deleteQna } from '../../../api/boardQna';
import '/src/pages/Counselor/Css/CounselorBoardDetailPage.css';

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
  const answers = [
    {
      id: 1,
      writer: "김상담",
      content: "문의하신 사항에 대해 답변드립니다. 해당 문제는 설정에서 해결 가능합니다.",
      time: "2시간 전"
    },
    {
      id: 2,
      writer: "이상담",
      content: "추가적인 정보가 필요하면 언제든 문의해주세요!",
      time: "1시간 전"
    },
    {
      id: 3,
      writer: "박상담",
      content: "해당 이슈는 현재 확인 중이며, 빠른 시일 내에 해결하겠습니다.",
      time: "30분 전"
    }
  ];

  // HTML 태그를 제거하는 함수 추가
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditedTitle(postData.title);
    setEditedContent(stripHtml(postData.content));
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
  
      if (type === "qna") {
        const updatedQna = await updateQna(no, editedTitle, editedContent);
        
        // 응답으로 받은 데이터로 상태 업데이트
        const formattedData = {
          ...qnaData,
          title: updatedQna.title || editedTitle,
          content: updatedQna.content || editedContent,
          writer: updatedQna.name || qnaData.writer,
          status: updatedQna.answerYn ? "답변완료" : "미답변",
          date: updatedQna.createDttm ? new Date(updatedQna.createDttm).toISOString().split('T')[0] : qnaData.date
        };
  
        setQnaData(formattedData);
        // await SingleButtonAlert("성공적으로 수정되었습니다.");
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
          navigate('/counselor/board');
        }
      }
    } catch (error) {
      console.error('삭제 처리 중 오류 발생:', error);
      await SingleButtonAlert(
        error.response?.data?.message || 'QnA 삭제에 실패했습니다.'
      );
    }
  };

 // 상세 데이터 가져오기
 useEffect(() => {
  const fetchData = async () => {
    if (type === "notice") {
      try {
        setIsLoading(true);
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
      } catch (error) {
        console.error("공지사항 상세 조회 실패:", error);
        await SingleButtonAlert(
          error.response?.data?.message || '공지사항을 불러오는데 실패했습니다.'
        );
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    } else if (type === "faq") {
      try {
        setIsLoading(true);
        const response = await getFaqDetail(no);
        
        // API 응답 데이터 포맷팅
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
      } catch (error) {
        console.error("FAQ 상세 조회 실패:", error);
        await SingleButtonAlert(
          error.response?.data?.message || 'FAQ를 불러오는데 실패했습니다.'
        );
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    } else if (type === "qna") {
      try {
        setIsLoading(true);
        const response = await getQnaDetail(no);

        // API 응답 데이터 포맷팅
        const formattedData = {
          no: response.id,
          title: response.title,
          content: response.content,
          writer: response.name,
          status: response.answerCnt > 0 ? "답변완료" : "미답변",
          date: new Date(response.createDttm).toISOString().split('T')[0]
        };

        setQnaData(formattedData);
      } catch (error) {
        console.error("QnA 상세 조회 실패:", error);
        await SingleButtonAlert(
          error.response?.data?.message || 'QnA를 불러오는데 실패했습니다.'
        );
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    }
  };

  fetchData();
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

  // 해당하는 게시판 데이터를 가져옴
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
          <p className="co-detail-no-answer">아직 답변이 없습니다.</p>
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
