import { useNavigate, useParams } from "react-router-dom";
import ParentHeader from "/src/components/Parent/ParentHeader";
import "./ParentBoardDetailPage.css";

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

function ParentBoardDetailPage() {
  const navigate = useNavigate();
  const { type, no } = useParams();

  // 뒤로 가기 버튼 클릭 시
  const handleBack = () => {
    navigate(-1);
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
      <div className="pa-detail-page">
        <ParentHeader />
        <div className="pa-detail-container">
          <div className="pa-detail-topbar">
            <button className="pa-detail-back-btn" onClick={handleBack}>
              ←
            </button>
            <span className="pa-detail-top-title">게시글 상세보기</span>
          </div>
          <div className="pa-detail-card">
            <h2 className="pa-detail-post-title">게시글을 찾을 수 없습니다.</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pa-detail-page">
      <ParentHeader />

      <div className="pa-detail-container">
        {/* 상단 바 */}
        <div className="pa-detail-topbar">
          <button className="pa-detail-back-btn" onClick={handleBack}>
            ←
          </button>
          <span className="pa-detail-top-title">{type === "notice" ? "공지사항" : type === "faq" ? "FAQ" : "질문"}</span>
        </div>

        {/* 게시글 상세 */}
        <div className="pa-detail-card">
          <h2 className="pa-detail-post-title">{postData.title}</h2>

          {/* 공지사항 & 질문은 작성일 표시 / FAQ는 작성자만 표시 */}
          {type === "notice" || type === "qna" ? (
            <table className="pa-detail-info-table">
              <thead>
                <tr>
                  <th>작성자</th>
                  {type === "qna" && <th>답변 상태</th>}
                  <th>작성일</th>
                  {type === "notice" && <th>조회수</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{postData.writer}</td>
                  {type === "qna" && <td>{postData.status}</td>}
                  <td>{postData.date}</td>
                  {type === "notice" && <td>{postData.views}</td>}
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="pa-detail-info-text">
              <strong>작성자:</strong> {postData.writer}
            </div>
          )}

          {/* 본문 내용 */}
          <div className="pa-detail-content">
            <p>{postData.content}</p>
          </div>

          {/* 첨부파일 영역 (예시) */}
          <div className="pa-detail-file">첨부파일</div>
        </div>
      </div>
    </div>
  );
}

export default ParentBoardDetailPage;
