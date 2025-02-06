import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentHeader from "../../../components/Parent/ParentHeader";
import Footer from "../../../components/common/footer";
import { getQnaList } from '../../../api/boardQna';
import { getNoticePosts, searchNotices } from '../../../api/boardNotice';
import { getFaqList } from '../../../api/boardFaq';
import SingleButtonAlert from "/src/components/common/SingleButtonAlert";
import "/src/pages/Parent/ParentCss/ParentBoardPage.css";

// FAQ에서 '유형(type)' 사용 (조회수, 작성일 제외)
const faqData = [
  { no: 2, type: "사이트 이용", title: "자주 묻는 질문 TOP5", writer: "운영자", date: "2025-01-21" },
  { no: 1, type: "계정", title: "계정 관련 FAQ", writer: "운영자", date: "2025-01-08" },
];


function ParentBoardPage() {
  // 탭 전환, 검색, 페이지네이션
  const [paActiveTab, setPaActiveTab] = useState("notice");
  const [paSearchCategory, setPaSearchCategory] = useState("title");
  const [isSearching, setIsSearching] = useState(false);
  const [paSearchTerm, setPaSearchTerm] = useState("");
  const [paCurrentPage, setPaCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const paItemsPerPage = 6;

  // 데이터 상태들
  const [noticeData, setNoticeData] = useState([]);
  const [qnaData, setQnaData] = useState([]);
  const [faqData, setFaqData] = useState([]);

  // 로딩 상태들
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [qnaLoading, setQnaLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);

  const navigate = useNavigate();

  // 검색 API 호출 함수 추가
  const handleSearch = async () => {
    if (!paSearchTerm.trim()) {
      await SingleButtonAlert('검색어를 입력해주세요.');
      return;
    }

    try {
      setNoticeLoading(true);
      setIsSearching(true);

      const searchType = paSearchCategory === 'writer' ? 'writer' : 'title';
      const response = await searchNotices(
        paSearchTerm,
        searchType,
        paCurrentPage - 1,
        paItemsPerPage
      );

      const formattedData = response.notices.map(item => ({
        no: item.id || "9999",
        title: item.title,
        writer: item.name || "운영자",
        views: item.viewCnt || 0,
        date: new Date(item.createDttm).toISOString().split('T')[0]
      }));

      setNoticeData(formattedData);
      setTotalPages(response.pagination.totalPages);

    } catch (error) {
      console.error("검색 에러:", error);
      await SingleButtonAlert(
        error.response?.data?.message || '검색 중 오류가 발생했습니다.'
      );
    } finally {
      setNoticeLoading(false);
    }
  };

  // 공지사항 데이터 fetch 함수
const fetchNoticeData = async () => {
  try {
    setNoticeLoading(true);
    setIsSearching(false);  // 검색 모드 해제

    const response = await getNoticePosts(
      paCurrentPage - 1, 
      paItemsPerPage
    );
    
    const formattedData = response.notices.map(item => ({
      no: item.id || "9999",
      title: item.title,
      writer: item.name || "운영자",
      views: item.viewCnt || 0,
      date: new Date(item.createDttm).toISOString().split('T')[0]
    }));

    setNoticeData(formattedData);
    setTotalPages(response.pagination.totalPages);

  } catch (error) {
    console.error("에러 상세:", error);
    await SingleButtonAlert(
      error.response?.data?.message || '공지사항을 불러오는데 실패했습니다.'
    );
  } finally {
    setNoticeLoading(false);
  }
};

// FAQ 데이터 fetch 함수
const fetchFaqData = async () => {
  try {
    setFaqLoading(true);
    const response = await getFaqList(paCurrentPage - 1, paItemsPerPage);
    
    const formattedData = response.faqs.map(item => ({
      no: item.id,
      type: item.type || "일반",
      title: item.title,
      writer: item.name,
    }));

    setFaqData(formattedData);
    setTotalPages(response.pagination.totalPages);

  } catch (error) {
    console.error('FAQ 목록 조회 실패:', error);
    await SingleButtonAlert(
      error.response?.data?.message || 'FAQ를 불러오는데 실패했습니다.'
    );
  } finally {
    setFaqLoading(false);
  }
};

// QnA 데이터 fetch 함수
const fetchQnaData = async () => {
  try {
    setQnaLoading(true);
    
    const response = await getQnaList(paCurrentPage - 1, paItemsPerPage);
    const formattedData = response.qnaList.map(item => ({
      no: item.id,
      title: item.title,
      writer: item.name,
      status: item.answerYn ? "답변완료" : "미답변",  
      date: new Date(item.createDttm).toISOString().split('T')[0]
    }));
    
    setQnaData(formattedData);
    setTotalPages(response.pagination.totalPages);

  } catch (error) {
    console.error('QnA 목록 조회 실패:', error);
    await SingleButtonAlert(
      error.response?.data?.message || 'QnA를 불러오는데 실패했습니다.'
    );
  } finally {
    setQnaLoading(false);
  }
};

// 페이지 변경 시 데이터 fetch
useEffect(() => {
  if (paActiveTab === "notice" && !isSearching) {
    fetchNoticeData();
  } else if (paActiveTab === "qna" && !isSearching) { 
    fetchQnaData();
  } else if (paActiveTab === "faq" && !isSearching) {
    fetchFaqData();
  }
}, [paCurrentPage, paActiveTab, isSearching]);

  // 검색어 입력 시 Enter 키 처리 추가
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


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
    <div>
      <ParentHeader />
      <div className='pa-board-page'>
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
              onKeyPress={handleSearchKeyPress}  // Enter 키 이벤트 추가
            />
            <button className="pa-board-search-button" onClick={handleSearch}>검색</button>
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
                {(paActiveTab === "notice" && noticeLoading) || 
                  (paActiveTab === "qna" && qnaLoading) ||
                  (paActiveTab === "faq" && faqLoading) ? (
                    <tr>
                      <td colSpan={colSpan} className="pa-empty-row">
                        데이터를 불러오는 중...
                      </td>
                    </tr>
                  ) : paPageData.length === 0 ? (
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
                          <td>
                            {item.type === "usage"
                              ? "이용안내"
                              : item.type === "child"
                              ? "아동상담/문의"
                              : item.type === "center"
                              ? "센터이용/문의"
                              : "기타"}
                          </td>
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
      </div>
      <Footer/>
    </div>
  );
}

export default ParentBoardPage;
