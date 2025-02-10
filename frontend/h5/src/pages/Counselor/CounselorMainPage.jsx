import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CounselorHeader from "../../components/Counselor/CounselorHeader";
import Footer from "../../components/common/Footer";
import { getNoticePosts } from '../../../src/api/boardNotice';
import '../Counselor/Css/CounselorMainPage.css';

// 상담사 메인 페이지 컴포넌트
const CounselorMainPage = () => {
  const navigate = useNavigate();  // 페이지 네비게이션을 위한 훅
  const [notices, setNotices] = useState([]); // 공지사항 데이터 상태
  // const [autoplayInterval, setAutoplayInterval] = useState(4000); // 캐러셀 자동 재생 간격 (4초)
  // 자동 재생을 관리하는 ref 추가
  const autoplayRef = useRef(null);

  // 화면에 표시할 공지사항 개수 상태
  const [numVisible, setNumVisible] = useState(4);
  // 현재 활성화된 캐러셀 페이지 인덱스
  const [activeIndex, setActiveIndex] = useState(0);
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(notices.length / numVisible);

  // 자동 재생을 시작하는 함수
  const startAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    
    autoplayRef.current = setInterval(() => {
      const totalPages = Math.ceil(notices.length / numVisible);
      const nextIndex = (activeIndex + 1) % totalPages;
      setActiveIndex(nextIndex);
    }, 4000);
  };

  // 자동 재생을 중지하는 함수
  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  // 컴포넌트 마운트/언마운트 시 자동 재생 관리
  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [notices, numVisible]); // notices나 numVisible이 변경될 때마다 재시작



  // 컴포넌트 마운트 시 공지사항 데이터를 가져오는 useEffect
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // 공지사항 12개를 가져옴
        const response = await getNoticePosts(0, 12);

        // 받아온 데이터를 화면에 표시할 형식으로 변환
        const noticeData = response.notices.map(notice => ({
          id: notice.id,
          type: '공지사항',
          author: notice.name || '작성자',
          content: notice.title || '제목 없음',
          date: formatDate(notice.createDttm)
        }));
        
        console.log("📢 Notices fetched:", noticeData);
        setNotices(noticeData);
      } catch (error) {
        console.error('Failed to fetch notices:', error);
        // 에러 발생 시 빈 배열로 설정
        setNotices([]);
      }
    };
  
    fetchNotices();
  }, []);

  // 날짜 문자열을 'YYYY.MM.DD' 형식으로 변환하는 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 화면 크기에 따라 표시할 공지사항 개수를 조정하는 useEffect
  useEffect(() => {
    const updateNumVisible = () => {
      const width = window.innerWidth;
      if (width <= 576) setNumVisible(1);
      else if (width <= 768) setNumVisible(2);
      else if (width <= 1100) setNumVisible(3);
      else setNumVisible(4);
    };

    updateNumVisible();
    // 윈도우 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', updateNumVisible);
    return () => window.removeEventListener('resize', updateNumVisible);
  }, []);

  // 캐러셀 페이지 변경 시 호출되는 핸들러
  const handlePageChange = (e) => {
    const totalPages = Math.ceil(notices.length / numVisible);
    const newIndex = e.page % totalPages; // totalPages로 나머지 연산을 하여 순환
    setActiveIndex(newIndex);
  };

  // 현재 페이지 인덱스 변경을 로깅하는 useEffect
  useEffect(() => {
    console.log("🎯 현재 페이지 인덱스:", activeIndex);
  }, [activeIndex]);

  // 각 공지사항 카드의 템플릿
  const noticeTemplate = (notice) => (
    <Card key={notice.id} className="co_notice_card">
      <div className="co_notice_tags">
        <div className="co_tag_group">
          <span className="co_tag co_tag_notice">{notice.type}</span>
          <span className="co_tag co_tag_author">{notice.author}</span>
        </div>
        {<span className="co_tag co_tag_new">새글</span>}
      </div>
      <h3 className="co_notice_content">{notice.content}</h3>
      <div className="co_notice_date">{notice.date}</div>
    </Card>
  );


  // 컴포넌트 렌더링
  return (
    <div className="co_page_wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 컴포넌트 */}
      <CounselorHeader />
      <main className='co_main'>
        {/* 히어로 섹션 - 상담사 소개 */}
        <section className="co_hero_section">
          <div className="co_inner_left">
            <div className="co_hero_content">
              <h1 className="co_service_title">안녕하세요.</h1>
              <h2 className="co_counselor_intro">
                <span className="co_highlight">박성원</span> 상담사님.
              </h2>
              <p className="co_service_subtitle">감정을 놀이로 전달하는 <span>HI 서비스</span> 입니다.</p>
              <Button label="상담일정 보러가기" className="co_schedule_btn" onClick={() => navigate('/counselor/schedule')}/>
            </div>
          </div>
          <div className="co_hero_image">
            <img src="/메인이미지.png" alt="description" />
          </div>
        </section>
        {/* 공지사항 섹션 */}
        <section className='co_notice_wrapper'>
          <div className="co_main_container">
            <section className="co_notice_section">
              <div className="co_notice_header">
                <p className="co_notice_title">새소식</p>
                <div className="co_notice_line"></div>
                <button className="co_notice_line_end" onClick={() => navigate('/counselor/board')}>
                  <i className="pi pi-plus"></i>
                  더보기
                </button>
              </div>
              {/* 공지사항 캐러셀 */}
              <div className="c-carousel-container">
                {notices.length === 0 ? (
                  // 공지사항이 없을 때 표시할 메시지
                  <div className="flex justify-center items-center w-full h-48">
                    <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
                  </div>
                ) : (
                  <>
                    <Carousel 
                      value={notices} 
                      numVisible={numVisible} 
                      numScroll={1}
                      itemTemplate={noticeTemplate}
                      // autoplayInterval={autoplayInterval}
                      circular={true}
                      showIndicators={false}
                      showNavigators={true}
                      pauseOnHover={true}
                      responsiveOptions={[
                        { breakpoint: '1400px', numVisible: 4, numScroll: 4 },
                        { breakpoint: '1100px', numVisible: 3, numScroll: 3 },
                        { breakpoint: '768px', numVisible: 2, numScroll: 2 },
                        { breakpoint: '576px', numVisible: 1, numScroll: 1 }
                      ]}
                      className="c-co_carousel"
                      onPageChange={handlePageChange}
                      pt={{
                        container: {
                          onMouseEnter: stopAutoplay,
                          onMouseLeave: startAutoplay
                        }
                      }}
                    />
                    {/* 페이지 인디케이터 */}
                    <div className="c-custom-indicator">
                      {activeIndex + 1}/{totalPages}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
      {/* 푸터 컴포넌트 */}
      <Footer />
    </div>
  );
};

export default CounselorMainPage;