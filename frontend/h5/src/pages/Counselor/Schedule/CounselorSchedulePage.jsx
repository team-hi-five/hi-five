import CounselorHeader from "../../../components/Counselor/CounselorHeader";
import Footer from "../../../components/common/Footer";
import MeetingCreateModal from "../../../components/modals/MeetingCreateModal";
import DoubleButtonAlert from "../../../components/common/DoubleButtonAlert"
import SingleButtonAlert from "../../../components/common/SingleButtonAlert";
import { Calendar } from 'primereact/calendar';
import { useState, useEffect } from 'react';
import { addLocale } from 'primereact/api';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../Css/CounselorSchedulePage.css';
import { searchChildByName, getConsultantScheduleList, getChildScheduleList } from '../../../api/schedule';

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
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [date, setDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date()); // 현재 선택된 월을 추적
    const [selectedChildId, setSelectedChildId] = useState(null);

    const handleChildSelect = (childId) => {
        setSelectedChildId(childId);
        const fetchSchedulesChild = async () => {
            if (!childId) return; // date 값이 없을 경우 요청 안 함
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const response = await getChildScheduleList(selectedChildId, year, month);
            console.log("응답이여 ~ : ", response);
    
            // API 응답 데이터를 화면에 맞게 변환
            const formattedSchedules = response.map(item => {
                const [year, month, day, hour, minute] = item.schdlDttm; 
                const dateTime = new Date(year, month - 1, day, hour, minute); // month는 0부터 시작
    
                return {
                    time: `${String(dateTime.getHours()).padStart(2, "0")}:00 ~ ${String(dateTime.getHours() + 1).padStart(2, "0")}:00`,
                    counselor: item.consultantName,
                    consultation_target: item.childName, // 오타 수정 (counsultation → consultation)
                    consultation_type: item.type,
                    date: "2012",
                    isLoading: false,
                    isCompleted: item.status === 'C' // 완료된 상담 여부
                };
            });
    
            setSchedules(formattedSchedules);
        };
        fetchSchedulesChild();
    };


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    
    const handleSearchKeyDown = async (e) => {
        if (e.key === "Enter") {
            if (!searchTerm.trim()) {
                setSuggestions([]); // 🔹 검색어가 비었으면 드롭다운 초기화
                return;
            }
            const results = await searchChildByName(searchTerm); // 🔹 API 호출해서 데이터 가져오기
            if (results) {
                setSuggestions(results.map(child => ({
                    id: child.childUserId,
                    name: child.childUserName,
                    img: child.childProfileUrl !== "Default Image" ? child.childProfileUrl : "/default-profile.png", // 🔹 기본 이미지 처리
                })));
            }
        }
    };
    
    
    
    const [schedules, setSchedules] = useState([
    ].sort((a, b) => {
        const timeA = a.time.split('~')[0].trim();
        const timeB = b.time.split('~')[0].trim();
        return timeA.localeCompare(timeB);
      })); // 시간순으로 나열해주는 로직


    useEffect(() => {
        const fetchSchedules = async () => {
            if (!date) return; // date 값이 없을 경우 요청 안 함
            const formattedDate = formatDateToString(date);
            const response = await getConsultantScheduleList(formattedDate);
            console.log("응답이여 ~ : ", response);
    
            // API 응답 데이터를 화면에 맞게 변환
            const formattedSchedules = response.map(item => {
                const [year, month, day, hour, minute] = item.schdlDttm; 
                const dateTime = new Date(year, month - 1, day, hour, minute); // month는 0부터 시작
    
                return {
                    time: `${String(dateTime.getHours()).padStart(2, "0")}:00 ~ ${String(dateTime.getHours() + 1).padStart(2, "0")}:00`,
                    counselor: item.consultantName,
                    consultation_target: item.childName, // 오타 수정 (counsultation → consultation)
                    consultation_type: item.type,
                    date: formattedDate,
                    isLoading: false,
                    isCompleted: item.status === 'C' // 완료된 상담 여부
                };
            });
    
            setSchedules(formattedSchedules);
        };
    
        fetchSchedules();
    }, [date]);

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
            const scheduleDate = new Date(schedule.date);
            const currentMonthDate = new Date(currentMonth);
    
            const isSameMonth =
                scheduleDate.getFullYear() === currentMonthDate.getFullYear() &&
                scheduleDate.getMonth() === currentMonthDate.getMonth();
    
            return schedule.consultation_target.toLowerCase().includes(searchTerm.toLowerCase()) 
                   && isSameMonth;
        }
    
        const selectedDate = formatDateToString(date);
        return schedule.date === selectedDate;
    }).sort((a, b) => {
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


    const handleDelete = async (scheduleToDelete) => {
        try {
            const result = await DoubleButtonAlert('상담을 삭제 하시겠습니까?');
            
            if (result.isConfirmed) {
                // 해당 스케줄의 인덱스를 전체 schedules 배열에서 찾기
                const scheduleIndex = schedules.findIndex(schedule => 
                    schedule.date === scheduleToDelete.date &&
                    schedule.time === scheduleToDelete.time &&
                    schedule.counsultation_target === scheduleToDelete.counsultation_target
                );
    
                if (scheduleIndex !== -1) {
                    // 로딩 상태 설정
                    setSchedules(prevSchedules => prevSchedules.map((schedule, idx) => 
                        idx === scheduleIndex ? { ...schedule, isLoading: true } : schedule
                    ));
    
                    try {
                        // API 호출을 시뮬레이션하기 위한 딜레이
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // 성공적으로 삭제된 경우 화면에서도 제거
                        setSchedules(prevSchedules => 
                            prevSchedules.filter((_, idx) => idx !== scheduleIndex)
                        );
    
                        // 성공 알림
                        await SingleButtonAlert('성공적으로 삭제되었습니다.');
                    } catch (error) {
                        console.error('삭제 중 오류 발생:', error);
                        // 실패 알림
                        await SingleButtonAlert('상담 삭제 중 오류가 발생했습니다.');
                        setSchedules(prevSchedules => prevSchedules.map((schedule, idx) => 
                            idx === scheduleIndex ? { ...schedule, isLoading: false } : schedule
                        ));
                    }
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

    const handleModalClose = () => {
        setShowModal(false);
        setEditingSchedule(null);
    };

    const handleEditClick = (schedule) => {
        setEditingSchedule(schedule);
        setShowModal(true);
    };

    const handleScheduleUpdate = (updatedSchedule, originalSchedule) => {
        setSchedules(prevSchedules => prevSchedules.map(schedule => {
            if (
                schedule.date === originalSchedule.date &&
                schedule.time === originalSchedule.time &&
                schedule.counsultation_target === originalSchedule.counsultation_target
            ) {
                return updatedSchedule;
            }
            return schedule;
        }));
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
                                    <span className="co-selected-date">
                                            ({formatDisplayDate(date)})
                                    </span>
                                </h2>
                                <div className="co-search-container">
                                    <span className="p-input-icon-right">                                        
                                    <div className="co-search-container">
                                        <input
                                            type="text"
                                            placeholder="아동 이름으로 검색"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            onKeyDown={handleSearchKeyDown}
                                            className="co-search-input"
                                        />
                                        {suggestions.length > 0 && (
                                            <ul className="co-search-dropdown">
                                                {suggestions.map((child) => (
                                                    <li 
                                                        key={child.id} 
                                                        className="co-search-item"
                                                        onClick={() => handleChildSelect(child.id)}
                                                    >
                                                        <img 
                                                            src={child.img} 
                                                            alt={child.name} 
                                                            className="co-search-img"
                                                            style={{ width: "20px", height: "20px", objectFit: "cover", borderRadius: "4px", marginRight: "8px" }} 
                                                        />
                                                        {child.name} (ID: {child.id})
                                                    </li>
                                                ))}

                                            </ul>
                                        )}
                                    </div>
                                    </span>
                                </div>
                            </div>
                            <div className="co-schedule-list">
                                {filteredSchedules.length > 0 ? (
                                    filteredSchedules.map((schedule, index) => (
                                        <div key={index} className="co-schedule-item">
                                            <div className="co-schedule-info">
                                                <div className="co-schedule-info-first">

                                                    <p>상담 시간 : {schedule.time}</p>
                                                    {searchTerm && (
                                                        <div className="co-schedule-header-row">
                                                            <div className="co-schedule-date">
                                                                {formatDisplayDate(schedule.date)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p>상담유형 : {schedule.consultation_type}</p>
                                                <p>상담대상(이름) : {schedule.consultation_target}</p>
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
                                                        <button className="co-btn co-btn-modify" onClick={() => handleEditClick(schedule)}>수정</button>
                                                        <button 
                                                            className="co-btn co-btn-delete"
                                                            onClick={() => handleDelete(schedule)}
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
                        <button 
                            className="co-schedule-create-btn" 
                            onClick={() => {
                                setEditingSchedule(null);  // 생성 시에는 editingSchedule을 null로
                                setShowModal(true);
                            }}
                        >
                            상담 생성
                        </button>
                        {showModal && (
                            <MeetingCreateModal 
                                onClose={handleModalClose}
                                isEdit={!!editingSchedule}
                                editData={editingSchedule}
                                onScheduleUpdate={handleScheduleUpdate}
                                bookedSlots={schedules}
                            />
                        )}
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