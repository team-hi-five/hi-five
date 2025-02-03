import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentHeader from "../../../components/Parent/ParentHeader";
import Footer from "../../../components/common/footer";
import "/src/pages/Parent/ParentCss/ParentBoardPage.css";

/* 샘플 게시글 데이터 */
const noticeData = [
  { no: 11, title: "새로운 기능 안내", writer: "운영자", views: 128, date: "2025-01-22" },
  { no: 10, title: "새로운 기능 안내", writer: "운영자", views: 128, date: "2025-01-22" },
  { no: 9, title: "새로운 기능 안내", writer: "운영자", views: 128, date: "2025-01-22" },
  { no: 8, title: "새로운 기능 안내", writer: "운영자", views: 128, date: "2025-01-22" },
  { no: 7, title: "새로운 기능 안내", writer: "운영자", views: 128, date: "2025-01-22" },
  { no: 6, title: "새로운 기능 안내", writer: "운영자", views: 128, date: "2025-01-22" },
  { no: 5, title: "새로운 기능 안내", writer: "운영자", views: 128, date: "2025-01-22" },
  { no: 4, title: "점검 공지", writer: "운영자", views: 99, date: "2025-01-18" },
  { no: 3, title: "사이트 사용 가이드", writer: "운영자", views: 64, date: "2025-01-10" },
  { no: 2, title: "새로운 기능 안내", writer: "운영자", views: 128, date: "2025-01-22" },
  { no: 1, title: "계정 관련 FAQ", writer: "운영자", views: 100, date: "2025-01-08" },
];

// FAQ에서 '유형(type)' 사용 (조회수, 작성일 제외)
const faqData = [
  { no: 2, type: "사이트 이용", title: "자주 묻는 질문 TOP5", writer: "운영자", date: "2025-01-21" },
  { no: 1, type: "계정", title: "계정 관련 FAQ", writer: "운영자", date: "2025-01-08" },
];

// QnA: 번호, 제목, 작성자, 답변상태(status), 작성일 (조회수 대신 status)
const qnaData = [
  { no: 3, title: "문의드립니다", writer: "홍길동", status: "미답변", date: "2025-01-23" },
  { no: 2, title: "결제 관련 문의", writer: "김철수", status: "답변완료", date: "2025-01-17" },
  { no: 1, title: "서비스 이용 방법 문의", writer: "이영희", status: "답변완료", date: "2025-01-02" },
];

function ParentBoardPage() {
  // 탭 전환, 검색, 페이지네이션
  const [paActiveTab, setPaActiveTab] = useState("notice");
  const [paSearchCategory, setPaSearchCategory] = useState("title");
  const [paSearchTerm, setPaSearchTerm] = useState("");
  const [paCurrentPage, setPaCurrentPage] = useState(1);
  const paItemsPerPage = 6;

  // 라우터 네비게이트 (상세페이지 이동 시 사용)
  const navigate = useNavigate();

  // 탭별 데이터/타이틀 설정
  let paBoardData;
  let paTitle;
  if (paActiveTab === "notice") {
    paBoardData = noticeData;
    paTitle = "공지사항";
  } else if (paActiveTab === "faq") {
    paBoardData = faqData;
    paTitle = "FAQ";
  } else {
    paBoardData = qnaData;
    paTitle = "질문";
  }

  // 검색 필터
  const paFilteredData = paBoardData.filter((item) =>
    item[paSearchCategory]?.toLowerCase().includes(paSearchTerm.toLowerCase())
  );

  // 페이지네이션 계산
  const paTotalItems = paFilteredData.length;
  const paTotalPages = Math.ceil(paTotalItems / paItemsPerPage);
  const paStartIndex = (paCurrentPage - 1) * paItemsPerPage;
  const paEndIndex = paStartIndex + paItemsPerPage;
  const paPageData = paFilteredData.slice(paStartIndex, paEndIndex);

  // "빈 행" 개수 (테이블 높이를 7행으로 고정하기 위해)
  const emptyRowsCount = paItemsPerPage - paPageData.length;

  // 이벤트 핸들러들
  const handleTabClick = (tabName) => {
    setPaActiveTab(tabName);
    setPaSearchTerm("");
    setPaCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setPaSearchTerm(e.target.value);
    setPaCurrentPage(1);
  };

  const handleCategoryClick = (category) => {
    setPaSearchCategory(category); // "title" or "writer"
    setPaSearchTerm("");
    setPaCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setPaCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    setPaCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPaCurrentPage((prev) => Math.min(prev + 1, paTotalPages));
  };

  const handleWriteClick = () => {
    navigate("/parent/board/write");
  };

  // 테이블 행 클릭 -> 상세 페이지로 이동 (예시: /board/{tab}/{글번호})
  const handleRowClick = (type, item) => {
    // 이동: /board/notice/11 or /board/faq/2 or /board/qna/3 ...
    navigate(`/parent/board/${type}/${item.no}`);
  };

  // 탭별 열 수(FAQ=4, QnA=5, Notice=5)
  const colSpan = paActiveTab === "faq" ? 4 : paActiveTab === "qna" ? 5 : 5;

  return (
    <div className="pa-board-page">
      <ParentHeader />

      {/* ───────────── (위) 탭 영역 ───────────── */}
      <div className="pa-board-top-wrapper">
        <div className="pa-board-tabs">
          <button
            className={`pa-board-tab ${paActiveTab === "notice" ? "pa-active-tab" : ""}`}
            onClick={() => handleTabClick("notice")}
          >
            공지사항
          </button>
          <button
            className={`pa-board-tab ${paActiveTab === "faq" ? "pa-active-tab" : ""}`}
            onClick={() => handleTabClick("faq")}
          >
            FAQ
          </button>
          <button
            className={`pa-board-tab ${paActiveTab === "qna" ? "pa-active-tab" : ""}`}
            onClick={() => handleTabClick("qna")}
          >
            질문
          </button>
        </div>
      </div>

      {/* ───────────── (아래) 검색 + 테이블 영역 ───────────── */}
      <div className="pa-board-bottom-wrapper">
        {/* 검색바 */}
        <div className="pa-board-searchbar">
          <div className="pa-board-search-select">
            <div className="pa-board-search-label">
              {paSearchCategory === "title" ? "제목" : "작성자"} ▼
            </div>
            <div className="pa-board-search-options">
              <div
                className="pa-board-search-option"
                onClick={() => handleCategoryClick("title")}
              >
                제목
              </div>
              <div
                className="pa-board-search-option"
                onClick={() => handleCategoryClick("writer")}
              >
                작성자
              </div>
            </div>
          </div>

          <input
            type="text"
            className="pa-board-search-input"
            placeholder={`${paTitle} 내 검색`}
            value={paSearchTerm}
            onChange={handleSearchChange}
          />
          <button className="pa-board-search-button">검색</button>
        </div>

        {/* 테이블 상단 (타이틀 + 글쓰기버튼) */}
        <div className="pa-board-table-header">
          <h2 className="pa-board-table-title">{paTitle}</h2>
          {paTitle === "질문" && (
            <button className="pa-board-write-button" onClick={handleWriteClick}>
            글쓰기
          </button>
          )}
        </div>

        {/* 테이블 */}
        <div className="pa-board-table-container">
          <table className="pa-board-table">
            <thead>
              <tr>
                {/* 탭별로 컬럼 구성 분기 */}
                {paActiveTab === "faq" ? (
                  <>
                    <th>번호</th>
                    <th>유형</th>
                    <th>제목</th>
                    <th>작성자</th>
                  </>
                ) : paActiveTab === "qna" ? (
                  <>
                    <th>번호</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>답변상태</th>
                    <th>작성일</th>
                  </>
                ) : (
                  // 공지사항
                  <>
                    <th>번호</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>조회수</th>
                    <th>작성일</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* 데이터가 없을 때: 한 행만 표시 */}
              {paPageData.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="pa-empty-row">
                    게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                paPageData.map((item) => {
                  if (paActiveTab === "faq") {
                    return (
                      <tr
                        key={item.no}
                        onClick={() => handleRowClick("faq", item)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{item.no}</td>
                        <td>{item.type}</td>
                        <td>{item.title}</td>
                        <td>{item.writer}</td>
                      </tr>
                    );
                  } else if (paActiveTab === "qna") {
                    return (
                      <tr
                        key={item.no}
                        onClick={() => handleRowClick("qna", item)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{item.no}</td>
                        <td>{item.title}</td>
                        <td>{item.writer}</td>
                        <td>{item.status}</td>
                        <td>{item.date}</td>
                      </tr>
                    );
                  } else {
                    // 공지사항
                    return (
                      <tr
                        key={item.no}
                        onClick={() => handleRowClick("notice", item)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{item.no}</td>
                        <td>{item.title}</td>
                        <td>{item.writer}</td>
                        <td>{item.views}</td>
                        <td>{item.date}</td>
                      </tr>
                    );
                  }
                })
              )}

              {/* 데이터 개수가 7개 미만이면, 빈 행으로 테이블 높이 맞추기 */}
              {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                <tr key={`empty-${idx}`}>
                  <td colSpan={colSpan} className="pa-empty-row">
                    &nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          {paTotalItems > 0 && (
            <div className="pa-board-pagination">
              <button onClick={handlePrevPage} disabled={paCurrentPage === 1}>
                이전
              </button>
              {Array.from({ length: paTotalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    className={paCurrentPage === pageNum ? "pa-active-page" : ""}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={handleNextPage}
                disabled={paCurrentPage === paTotalPages}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default ParentBoardPage;
