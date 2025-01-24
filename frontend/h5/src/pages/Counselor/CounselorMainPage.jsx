import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import CounselorHeader from "../../components/Counselor/CounselorHeader";
import Footer from "../../components/common/footer";
import './CounselorMainPage.css';

const CounselorMainPage = () => {
  const notices = [
    { id: 1, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 2, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 3, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
    { id: 4, type: '공지사항', author: '작성자', isNew: true, content: '새글내용', date: '2025.01.18' },
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

  return (
    <div className="co_page_wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CounselorHeader />
      <main style={{ flex: 1 }}>
        <div className="co_main_container">
          <section className="co_hero_section">
            <div className="co_hero_content">
              <h1 className="co_service_title">
                <span>HI</span> 서비스
              </h1>
              <p className="co_service_subtitle">감정을 놀이로 소통을 성장으로</p>
              <h2 className="co_counselor_intro">
                <span className="co_highlight">박성원</span> 상담사님 반갑습니다.
              </h2>
              <Button label="상담일정 보러가기" className="co_schedule_btn" />
            </div>
            <div className="co_hero_image">
                <img src="/메인이미지.png" alt="description" />
            </div>
          </section>

          <section className="co_notice_section">
            <p className="co_notice_title">새소식</p>
            <Carousel 
              value={notices} 
              numVisible={4} 
              numScroll={1} 
              itemTemplate={noticeTemplate}
              className="co_carousel"
            />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CounselorMainPage;