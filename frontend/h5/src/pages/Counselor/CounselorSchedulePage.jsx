import CounselorHeader from "../../components/Counselor/CounselorHeader";
import Footer from "../../components/common/footer";
import MeetingCreateModal from "../../components/modals/MeetingCreateModal";
import DoubleButtonAlert from "../../components/common/DoubleButtonAlert";
import SingleButtonAlert from "../../components/common/SingleButtonAlert";
import { Calendar } from 'primereact/calendar';
import { useState } from 'react';
import { addLocale } from 'primereact/api';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import './CounselorSchedulePage.css';

addLocale('ko', {
    firstDayOfWeek: 0,
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    today: '오늘',
    clear: '초기화',
    dateFormat: 'yy년 mm월',  // 날짜 포맷 추가
    yearSuffix: '년'  // 연도 접미사 추가
});

function CounselorSchedulePage() {
    const [showModal, setShowModal] = useState(false);
    const [date, setDate] = useState(null);
    // const [isLoading] = useState(false);
    const [schedules, setSchedules] = useState([
        {
            time: "11:00 ~ 12:00",
            counselor: "박성원",
            isLoading: false
        },
        {
            time: "15:00 ~ 16:00",
            counselor: "박성원",
            isLoading: false
        },
        {
            time: "13:00 ~ 14:00",
            counselor: "박성원",
            isLoading: false
        },
        {
            time: "16:00 ~ 16:30",
            counselor: "박성원",
            isLoading: false
        }
    ].sort((a, b) => {
        const timeA = a.time.split('~')[0].trim();
        const timeB = b.time.split('~')[0].trim();
        return timeA.localeCompare(timeB);
      })); // 시간순으로 나열해주는 로직

     //상담일정 추가하는 로직
    // const addSchedule = (newSchedule) => {
        // setSchedules(prevSchedules => 
        //     [...prevSchedules, newSchedule].sort((a, b) => {
        //     const timeA = a.time.split('~')[0].trim();
        //     const timeB = b.time.split('~')[0].trim();
        //     return timeA.localeCompare(timeB);
        //     })
        // );
    // };

    const handleDelete = async (index) => {
        try {
          const result = await DoubleButtonAlert('상담을 삭제 하시겠습니까?');
          
          if (result.isConfirmed) {
            setSchedules(prevSchedules => prevSchedules.map((schedule, idx) => 
              idx === index ? { ...schedule, isLoading: true } : schedule
            ));
      
            try {
              // API 호출을 시뮬레이션하기 위한 딜레이
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // 성공적으로 삭제된 경우 화면에서도 제거
              setSchedules(prevSchedules => prevSchedules.filter((_, idx) => idx !== index));
      
              // 성공 알림
              await SingleButtonAlert('성공적으로 삭제되었습니다.');
            } catch (error) {
              console.error('삭제 중 오류 발생:', error);
              // 실패 알림
              await SingleButtonAlert('상담 삭제 중 오류가 발생했습니다.');
              setSchedules(prevSchedules => prevSchedules.map((schedule, idx) => 
                idx === index ? { ...schedule, isLoading: false } : schedule
              ));
            }
          }
        } catch (error) {
          console.error('삭제 중 오류 발생:', error);
        }
      };

    return (
        <>
            <main className="co-schedule-container" >
                <CounselorHeader />
                <div className="co_blankdefault" style={{marginTop: '64.49px'}}></div>
                <div className="co-schedule-wrapper">
                    <div className="co-calendar-section">
                        <h2 className="co-select-date">날짜를 선택해주세요.</h2>
                        <div className="co-calendar-wrapper">
                        <Calendar 
                            value={date} 
                            onChange={(e) => setDate(e.value)}
                            inline 
                            dateFormat="yy년 mm월"
                            locale="ko"
                            view="date"  // "month"에서 "date"로 변경
                            monthNavigator
                            yearNavigator
                            yearRange="2000:2040"
                            templates={{
                                decade: (options) => {
                                    return `${options.value}년`;
                                }
                            }}
                        />
                        </div>
                    </div>
                    <div className="co-notcalendar">
                        <div className="co-schedule-section">
                            <h2 className="co-schedule-title">상담 일정</h2>
                            <div className="co-schedule-list">
                                {schedules.length > 0 ? (
                                    schedules.map((schedule, index) => (
                                    <div key={index} className="co-schedule-item">
                                        <div className="co-schedule-info">
                                            <p>상담 일정 : {schedule.time}</p>
                                            <p>상담자 : {schedule.counselor}</p>
                                        </div>
                                        <div className="co-button-group">
                                            <button className="co-btn co-btn-join">참여</button>
                                            <button className="co-btn co-btn-modify">수정</button>
                                            <button 
                                                className="co-btn co-btn-delete"
                                                onClick={() => handleDelete(index)}
                                                disabled={schedule.isLoading}
                                                >
                                                {schedule.isLoading ? '삭제 중...' : '삭제'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="co-no-schedules">
                                    <p>날짜를 선택해주세요!</p>
                                </div>
                            )}
                            </div>
                        </div>
                        <button className="co-schedule-create-btn" onClick={() => setShowModal(true)}>상담 생성</button>
                        {showModal && <MeetingCreateModal onClose={() => setShowModal(false)} />}
                    </div>
                </div>
                <Footer />
                {/* 로딩 오버레이 */}
                {schedules.some(schedule => schedule.isLoading) && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}
            </main>
        </>
    );
};

export default CounselorSchedulePage;