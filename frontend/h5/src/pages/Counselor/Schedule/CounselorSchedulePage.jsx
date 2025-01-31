import CounselorHeader from "../../../components/Counselor/CounselorHeader";
import Footer from "../../../components/common/footer";
import MeetingCreateModal from "../../../components/modals/MeetingCreateModal";
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert"
import SingleButtonAlert from "../../../components/common/SingleButtonAlert";
import { Calendar } from 'primereact/calendar';
import { useState } from 'react';
import { addLocale } from 'primereact/api';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../Css/CounselorSchedulePage.css';

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
    const [date, setDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date()); // 현재 선택된 월을 추적
    const [schedules, setSchedules] = useState([
        {
            time: "11:00 ~ 12:00",
            counselor: "박성원",
            counsultation_target: "김현수",
            counsultation_type: "게임",
            date: "2025-01-30",
            isLoading: false,
            isCompleted: false
        },
        {
            time: "11:00 ~ 12:00",
            counselor: "박성원",
            counsultation_target: "김현수",
            counsultation_type: "게임",
            date: "2025-01-29",
            isLoading: false,
            isCompleted: false
        },
        {
            time: "14:00 ~ 15:00",
            counselor: "박성원",
            counsultation_target: "김현수",
            counsultation_type: "게임",
            date: "2025-01-31",
            isLoading: false,
            isCompleted: false
        },
        {
            time: "15:00 ~ 16:00",
            counselor: "박성원",
            counsultation_target: "김도로롱",
            counsultation_type: "아동학습현황상담",
            date: "2025-02-15",
            isLoading: false,
            isCompleted: false
        },
        {
            time: "13:00 ~ 14:00",
            counselor: "박성원",
            counsultation_target: "김현수",
            counsultation_type: "게임",
            date: "2025-05-24",
            isLoading: false,
            isCompleted: false
        },
        {
            time: "16:00 ~ 17:00",
            counselor: "박성원",
            counsultation_target: "김도로롱",
            counsultation_type: "아동학습현황상담",
            date: "2025-05-25",
            isLoading: false,
            isCompleted: false
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

    // 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
    const formatDateToString = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

     // 날짜 선택 핸들러
     const handleDateSelect = (e) => {
        setDate(e.value);
        setCurrentMonth(e.value);
    };

    // 월 변경 핸들러
    const handleViewDateChange = (e) => {
        const newDate = e.value;
        setCurrentMonth(newDate);
        setDate(newDate);
    };

    // 필터링된 스케줄을 계산
    const filteredSchedules = schedules.filter(schedule => {
        if (searchTerm) {
            // 검색어가 있을 때
            const scheduleDate = new Date(schedule.date);
            const currentMonthDate = new Date(currentMonth);
            
            // 연도와 월이 일치하는지 확인
            const isSameMonth = 
                scheduleDate.getFullYear() === currentMonthDate.getFullYear() &&
                scheduleDate.getMonth() === currentMonthDate.getMonth();
    
            return schedule.counsultation_target.toLowerCase().includes(searchTerm.toLowerCase()) 
                   && isSameMonth;
        }
        
        // 검색어가 없을 때는 선택된 날짜의 상담만 보여줌
        const selectedDate = formatDateToString(date);
        return schedule.date === selectedDate;
    }).sort((a, b) => {
        // 날짜순으로 정렬 후, 같은 날짜는 시간순으로 정렬
        if (a.date !== b.date) {
            return new Date(a.date) - new Date(b.date);
        }
        const timeA = a.time.split('~')[0].trim();
        const timeB = b.time.split('~')[0].trim();
        return timeA.localeCompare(timeB);
    });

    // 날짜 표시 포맷 함수 (M/DD)
    const formatDisplayDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };


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

      const handleJoin = (index) => {
        const targetSchedule = filteredSchedules[index];
        setSchedules(prevSchedules => prevSchedules.map(schedule => 
            schedule.date === targetSchedule.date && 
            schedule.time === targetSchedule.time && 
            schedule.counsultation_target === targetSchedule.counsultation_target
                ? { ...schedule, isCompleted: true }
                : schedule
        ));
    };

    return (
        <>
            <main className="co-schedule-container">
                <CounselorHeader />
                <div className="co_blankdefault" style={{marginTop: '64.49px'}}></div>
                <div className="co-schedule-wrapper">
                    <div className="co-calendar-section">
                        <h2 className="co-select-date">날짜를 선택해주세요.</h2>
                        <div className="co-calendar-wrapper">
                            <Calendar 
                                value={date} 
                                onChange={handleDateSelect}
                                onViewDateChange={handleViewDateChange} // 월 변경 이벤트 추가
                                inline 
                                dateFormat="yy년 mm월"
                                locale="ko"
                                view="date"
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
                            <div className="co-schedule-header">
                                <h2 className="co-schedule-title">
                                    상담 일정
                                    {!searchTerm && ( // 검색어가 없을 때만 날짜 표시
                                        <span className="co-selected-date">
                                            ({formatDisplayDate(date)})
                                        </span>
                                    )}
                                </h2>
                                <div className="co-search-container">
                                    <input
                                        type="text"
                                        placeholder="아동 이름으로 검색"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="co-search-input"
                                    />
                                </div>
                            </div>
                            <div className="co-schedule-list">
                                {filteredSchedules.length > 0 ? (
                                    filteredSchedules.map((schedule, index) => (
                                        <div key={index} className="co-schedule-item">
                                            <div className="co-schedule-info">
                                                {searchTerm && (
                                                    <div className="co-schedule-header-row">
                                                        <div className="co-schedule-date">
                                                            {formatDisplayDate(schedule.date)}
                                                        </div>
                                                    </div>
                                                )}
                                                <p>상담 시간 : {schedule.time}</p>
                                                <p>상담유형 : {schedule.counsultation_type}</p>
                                                <p>상담대상(이름) : {schedule.counsultation_target}</p>
                                            </div>
                                            <div className="co-button-group">
                                                {!schedule.isCompleted ? (
                                                    <>
                                                        <button 
                                                            className="co-btn co-btn-join"
                                                            onClick={() => handleJoin(index)}
                                                        >
                                                            참여
                                                        </button>
                                                        <button className="co-btn co-btn-modify">수정</button>
                                                        <button 
                                                            className="co-btn co-btn-delete"
                                                            onClick={() => handleDelete(index)}
                                                            disabled={schedule.isLoading}
                                                        >
                                                            {schedule.isLoading ? '삭제 중...' : '삭제'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="co-btn co-btn-completed" disabled>
                                                        참여완료
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="co-no-schedules">
                                        <p>
                                            {searchTerm ? '해당 아동의 상담내역이 없습니다!' : '상담 일정이 없습니다!'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="co-schedule-create-btn" onClick={() => setShowModal(true)}>
                            상담 생성
                        </button>
                        {showModal && <MeetingCreateModal onClose={() => setShowModal(false)} />}
                    </div>
                </div>
                <Footer />
                {schedules.some(schedule => schedule.isLoading) && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}
            </main>
        </>
    );
}


export default CounselorSchedulePage;