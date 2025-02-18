import { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { useLocation } from 'react-router-dom';
import { getVideoDate } from "/src/api/childData";
import "/src/pages/Parent/ParentCss/ParentVideoMultiplePage.css";

function CounselorVideoMultiplePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // URL 쿼리 파라미터에서 childUserId 및 날짜를 읽어옴
  const childUserId = params.get('childUserId') || "";
  const getInitialDate = (paramName) => {
    const dateStr = params.get(paramName); // "YYYY-MM-DD"
    return dateStr ? new Date(dateStr) : new Date();
  };

  // 두 달력의 선택된 날짜 (왼쪽: dateVideo1, 오른쪽: dateVideo2)
  const [dates, setDates] = useState([
    getInitialDate('dateVideo1'),
    getInitialDate('dateVideo2')
  ]);
  const [emotions, setEmotions] = useState([null, null]);
  const [selectedVideos, setSelectedVideos] = useState([null, null]);

  // API 호출 결과를 저장할 상태 (각 달력에 해당하는 "YYYY-MM-DD" 형식의 문자열 배열)
  const [videoDates1, setVideoDates1] = useState([]);
  const [videoDates2, setVideoDates2] = useState([]);

  const emotionOptions = [
    { label: '기쁨', value: 'joy' },
    { label: '슬픔', value: 'sadness' },
    { label: '놀람', value: 'surprise' },
    { label: '화남', value: 'anger' },
    { label: '공포', value: 'fear' }
  ];

  const videoOptions = [
    { label: '첫번째 영상', value: 'video1' },
    { label: '두번째 영상', value: 'video2' },
    { label: '세번째 영상', value: 'video3' }
  ];

  // API에서 받은 데이터의 dateList를 "YYYY-MM-DD" 문자열 배열로 변환하는 함수
  const getFormattedDates = (data) => {
    return data.dateList.map(dateArr => {
      const [year, month, day] = dateArr;
      const formattedMonth = String(month).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      return `${year}-${formattedMonth}-${formattedDay}`;
    });
  };

  // 달력 오버레이(팝업)에 highlight를 적용하는 함수
  // ※ Calendar의 팝업은 appendTo={document.body} 때문에 document.body 내에서 찾습니다.
  const highlightDates = useCallback((baseDate, formattedDates) => {
    setTimeout(() => {
      const overlay = document.body.querySelector('.p-datepicker');
      if (!overlay) return;
      const dateCells = overlay.querySelectorAll('td > span');
      dateCells.forEach(cell => {
        // 셀의 텍스트를 두 자리 문자열로 만듦 (예: "1" → "01")
        const dayText = cell.innerText.padStart(2, '0');
        const year = baseDate.getFullYear();
        const month = String(baseDate.getMonth() + 1).padStart(2, '0');
        const cellDateStr = `${year}-${month}-${dayText}`;
        if (formattedDates.includes(cellDateStr)) {
          cell.classList.add("highlight");
        } else {
          cell.classList.remove("highlight");
        }
      });
    }, 100);
  }, []);

  // 날짜 변경 또는 달이 바뀔 때 API를 호출해 날짜 데이터를 받아오고 highlight 적용
  useEffect(() => {
    if (childUserId) {
      const year = dates[0].getFullYear();
      const month = dates[0].getMonth() + 1; // 1~12
      getVideoDate(childUserId, year, month)
        .then(response => {
          const formatted = getFormattedDates(response);
          setVideoDates1(formatted);
          // 오버레이가 열려 있다면 highlight 적용
          highlightDates(dates[0], formatted);
        })
        .catch(error => {
          console.error("❌ 왼쪽 비디오 날짜 불러오기 실패:", error);
        });
    }
  }, [childUserId, dates, highlightDates]);

  useEffect(() => {
    if (childUserId) {
      const year = dates[1].getFullYear();
      const month = dates[1].getMonth() + 1;
      getVideoDate(childUserId, year, month)
        .then(response => {
          const formatted = getFormattedDates(response);
          setVideoDates2(formatted);
          highlightDates(dates[1], formatted);
        })
        .catch(error => {
          console.error("❌ 오른쪽 비디오 날짜 불러오기 실패:", error);
        });
    }
  }, [childUserId, dates, highlightDates]);

  // onMonthChange 이벤트 핸들러: 달이 바뀌면 해당 달의 1일로 업데이트하고 API 재호출 + highlight 적용
  const handleMonthChange = (index, e) => {
    const { month, year } = e; // month: 0부터 시작 (0 = 1월)
    const firstDayOfNewMonth = new Date(year, month, 1);
    const newDates = [...dates];
    newDates[index] = firstDayOfNewMonth;
    setDates(newDates);

    // 새 달에 대해 API 호출 (API가 month 값을 1~12로 받으므로 month+1)
    getVideoDate(childUserId, year, month + 1)
      .then(response => {
        const formatted = getFormattedDates(response);
        if (index === 0) {
          setVideoDates1(formatted);
        } else {
          setVideoDates2(formatted);
        }
        // 달력 오버레이가 열려 있다면 highlight 적용
        highlightDates(firstDayOfNewMonth, formatted);
      })
      .catch(error => {
        console.error(`❌ ${index === 0 ? "왼쪽" : "오른쪽"} 비디오 날짜 불러오기 실패:`, error);
      });
  };

  return (
    <div className="video-page-container">
      <h1 className="page-title">학습 영상 조회</h1>
      <div className="videos-container-m">
        {[0, 1].map((index) => (
          <div key={index} className="video-section-m">
            <div className="controls-row-m">
              <div className="control-item date-picker-m">
                <label>날짜 선택</label>
                <div>
                  <Calendar
                    value={dates[index]}
                    onChange={(e) => {
                      const newDates = [...dates];
                      newDates[index] = e.value;
                      setDates(newDates);
                    }}
                    // 기본 헤더의 좌우 화살표 또는 드롭다운 선택 시 실행됨
                    onMonthChange={(e) => handleMonthChange(index, e)}
                    showMonthNavigator
                    showYearNavigator
                    appendTo={document.body}
                    onShow={() => {
                      // 오버레이(팝업)가 열리면 해당 달의 날짜를 highlight 적용
                      const formatted = index === 0 ? videoDates1 : videoDates2;
                      highlightDates(dates[index], formatted);
                    }}
                    className="simple-calendar"
                    placeholder="날짜를 선택하세요"
                  />
                </div>
              </div>
              
              <div className="control-item emotion-picker-m">
                <label>감정 선택</label>
                <Dropdown
                  value={emotions[index]}
                  options={emotionOptions}
                  onChange={(e) => {
                    const newEmotions = [...emotions];
                    newEmotions[index] = e.value;
                    setEmotions(newEmotions);
                  }}
                  placeholder="감정"
                  className="dropdown-input"
                />
              </div>
              
              <div className="control-item video-picker-m">
                <label>회차 선택</label>
                <Dropdown
                  value={selectedVideos[index]}
                  options={videoOptions}
                  onChange={(e) => {
                    const newVideos = [...selectedVideos];
                    newVideos[index] = e.value;
                    setSelectedVideos(newVideos);
                  }}
                  placeholder="회차"
                  className="dropdown-input"
                />
              </div>
            </div>
            
            <div className="video-container-m">
              <img 
                src="/user.png" 
                alt={`Video ${index + 1}`}
                className="video-placeholder"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CounselorVideoMultiplePage;
