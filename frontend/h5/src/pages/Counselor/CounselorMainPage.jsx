import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CounselorHeader from "../../components/Counselor/CounselorHeader";
import Footer from "../../components/common/footer";
import '../Counselor/Css/CounselorMainPage.css';

const CounselorMainPage = () => {
  const navigate = useNavigate();
  const notices = [
    { id: 1, type: '공지사항', author: '작성자', isNew: true, content: '새글내ㅇㄹㄴㅁㄹㅇㄴㅁㄹㅇㄴㅁㄹㅇㄴㅁㄹㅇㄴㅁ애낙어래ㅑㅑㅐ 야ㅓ멀 ㅐㅑㅓㅑㅐㄷ ㅁㄹ 러아님 랴댖 ㅁ러ㅑ댐  ㅑㄷㅁㄹ ㅓ댜ㅣㅁ;용', date: '2025.01.18' },
    { id: 2, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 3, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 4, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 5, type: '공지사항', author: '작성자', isNew: true, content: '새글ddddddd내용', date: '2025.01.18' },
    { id: 6, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 7, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 8, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 9, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 10, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 11, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 12, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
  ];

  const noticeTemplate = (notice) => (
    <Card key={notice.id} className="co_notice_card">
      <div className="co_notice_tags">
        <div className="co_tag_group">
          <span className="co_tag co_tag_notice">{notice.type}</span>
          <span className="co_tag co_tag_author">{notice.author}</span>
        </div>
        {notice.isNew && <span className="co_tag co_tag_new">새글</span>}
      </div>
      <h3 className="co_notice_content">{notice.content}</h3>
      <div className="co_notice_date">{notice.date}</div>
    </Card>
  );

  const [numVisible, setNumVisible] = useState(4);
  const [activeIndex, setActiveIndex] = useState(0);

  const totalPages = Math.ceil(notices.length / numVisible);

  useEffect(() => {
    const updateNumVisible = () => {
      const width = window.innerWidth;
      if (width <= 576) {
        setNumVisible(1);
      } else if (width <= 768) {
        setNumVisible(2);
      } else if (width <= 1100) {
        setNumVisible(3);
      } else {
        setNumVisible(4);
      }
    };

    updateNumVisible();
    window.addEventListener('resize', updateNumVisible);

    return () => {
      window.removeEventListener('resize', updateNumVisible);
    };
  }, []);

  const responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 4
    },
    {
      breakpoint: '1100px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '576px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  return (
    <>
      <div className="co_page_wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <CounselorHeader />
        <main className='co_main'>
          <section className="co_hero_section">
            <div className="co_inner_left">
              <div className="co_hero_content">
                <h1 className="co_service_title">
                  안녕하세요.
                </h1>
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
                </div>
                <div className="carousel-container">
                  <Carousel 
                    value={notices} 
                    numVisible={numVisible} 
                    numScroll={numVisible}
                    itemTemplate={noticeTemplate}
                    showNavigators={true}
                    showIndicators={false}
                    className="co_carousel"
                    responsiveOptions={responsiveOptions}
                    autoplayInterval={3000}
                    circular={true}
                    autoPlay={true}
                    // activeIndex={activeIndex}
                    onPageChange={(e) => setActiveIndex(e.page)}
                  />
                  <div className="custom-indicator">
                    {(activeIndex % totalPages) + 1}/{totalPages}
                  </div>
                </div>
              </section>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CounselorMainPage;