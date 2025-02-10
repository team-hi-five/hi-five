import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CounselorHeader from "../../components/Counselor/CounselorHeader";
import Footer from "../../components/common/Footer";
import { getNoticePosts } from '../../../src/api/boardNotice';
import '../Counselor/Css/CounselorMainPage.css';

const CounselorMainPage = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoplayInterval, setAutoplayInterval] = useState(4000); // 상태로 관리

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await getNoticePosts(0, 12);
        const noticeData = response.notices.map(notice => ({
          id: notice.id,
          type: '공지사항',
          author: notice.name || '작성자',
          content: notice.title,
          date: formatDate(notice.createDttm)
        }));
        setNotices(noticeData);
        console.log("📢 Notices fetched:", noticeData);  // ✅ 확인용 로그 추가
      } catch (error) {
        console.error('Failed to fetch notices:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchNotices();
  }, []);

  // const isNewNotice = (createdAt) => {
  //   if (!createdAt) return false;
  //   const noticeDate = new Date(createdAt);
  //   const now = new Date();
  //   return (now - noticeDate) / (1000 * 60 * 60) <= 24;
  // };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const [numVisible, setNumVisible] = useState(4);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalPages = Math.ceil(notices.length / numVisible);

  useEffect(() => {
    const updateNumVisible = () => {
      const width = window.innerWidth;
      if (width <= 576) setNumVisible(1);
      else if (width <= 768) setNumVisible(2);
      else if (width <= 1100) setNumVisible(3);
      else setNumVisible(4);
    };

    updateNumVisible();
    window.addEventListener('resize', updateNumVisible);
    return () => window.removeEventListener('resize', updateNumVisible);
  }, []);

  // 페이지 변경 핸들러 (자동 재생 리셋)
  const handlePageChange = (e) => {
    console.log("📌 Page Changed:", e.page);  // ✅ 현재 페이지 확인
    setActiveIndex(e.page);

    setAutoplayInterval(null);
    setTimeout(() => {
      setAutoplayInterval(4000);
    }, 100);

    setActiveIndex(e.page);  
    console.log("🔹 setActiveIndex 호출 후 activeIndex 값:", activeIndex);
  };

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

  useEffect(() => {
    console.log("🎯 현재 페이지 인덱스:", activeIndex);
  }, [activeIndex]);


  return (
    <div className="co_page_wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CounselorHeader />
      <main className='co_main'>
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
              <div className="c-carousel-container">
                <Carousel 
                  value={notices} 
                  numVisible={numVisible} 
                  numScroll={numVisible}
                  itemTemplate={noticeTemplate}
                  autoplayInterval={autoplayInterval}  // 수정된 autoplayInterval 사용
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
                      onMouseEnter: () => setAutoplayInterval(null),
                      onMouseLeave: () => setAutoplayInterval(4000)
                    }
                  }}
                />
                <div className="c-custom-indicator">
                  {(activeIndex % totalPages) + 1}/{totalPages}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CounselorMainPage;
