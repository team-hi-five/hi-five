import { useState, useEffect, useCallback } from "react";
import { Chart } from "primereact/chart";
import { Calendar } from 'primereact/calendar';
import ParentHeader from "/src/components/Parent/ParentHeader";
import Footer from "/src/components/common/Footer";
import "/src/pages/Parent/ParentCss/ParentChildPage.css";
import { getParentChildren } from "/src/api/userParent";
import { getChildEmotionData, getChatBotDate, getVideoDate } from "/src/api/childData";

function ParentChildPage() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);

  const [children, setChildren] = useState([]);
  const [emotionData, setEmotionData] = useState(null);

  const [dateChatBot, setDateChatBot] = useState(new Date());
  const [dateVideo1, setDateVideo1] = useState(new Date());
  const [dateVideo2, setDateVideo2] = useState(new Date());

  const [chatBotDates, setChatBotDates] = useState([]);
  const [videoDates1, setVideoDates1] = useState([]);
  const [videoDates2, setVideoDates2] = useState([]);

  const [prevChatBotMonth, setPrevChatBotMonth] = useState(dateChatBot.getMonth());
  const [prevVideoMonth1, setPrevVideoMonth1] = useState(dateVideo1.getMonth());
  const [prevVideoMonth2, setPrevVideoMonth2] = useState(dateVideo2.getMonth());

  const [currentMonth, setCurrentMonth] = useState(new Date());


  // 🔹 달력이 렌더링된 후, 예약된 날짜에 스타일을 추가하는 함수
  const highlightScheduledDatesInDOM = useCallback((calendarSide) => {
    setTimeout(() => {
      let containerSelector, dates, baseDate;
      if (calendarSide === "left") {
        containerSelector = ".video-calendar-left";
        dates = videoDates1 || [];         // 왼쪽 달력 날짜 배열, 없으면 빈 배열
        baseDate = dateVideo1;               // 왼쪽 달력 기준 날짜
      } else if (calendarSide === "right") {
        containerSelector = ".video-calendar-right";
        dates = videoDates2 || [];
        baseDate = dateVideo2;
      } else if (calendarSide === "chatbot") {
        containerSelector = ".chatbot-calendar";
        dates = chatBotDates || [];
        baseDate = dateChatBot;
      } else {
        // calendarSide가 예상치 않은 값이면 그냥 종료
        console.error("highlightScheduledDatesInDOM: invalid calendarSide", calendarSide);
        return;
      }
      
      // dates가 배열인지 확인
      if (!Array.isArray(dates)) {
        console.error("highlightScheduledDatesInDOM: dates is not an array", dates);
        return;
      }
    
      const calendarCells = document.querySelectorAll(
        `${containerSelector} .p-datepicker td > span`
      );
      calendarCells.forEach((cell) => {
        const dateText = cell.innerText.padStart(2, "0"); // 예: "1" -> "01"
        const selectedDate = `${baseDate.getFullYear()}-${String(
          baseDate.getMonth() + 1
        ).padStart(2, "0")}-${dateText}`;
        if (dates.includes(selectedDate)) {
          cell.classList.add("highlight-circle");
        }
      });
    }, 100);
  }, [videoDates1, videoDates2, chatBotDates, dateVideo1, dateVideo2, dateChatBot]);
  
  
  
  
  


  // ✅ 달력의 월이 변경될 때 API 호출 (onViewDateChange 이벤트 활용)
  const handleMonthChange = (e, calendarType) => {
    const newDate = e.value;
    const newMonth = newDate.getMonth(); // 0 기반
    
    if (calendarType === "chatbot" && newMonth !== prevChatBotMonth) {
      setDateChatBot(newDate);
      fetchChatBotDate(newDate);
      setPrevChatBotMonth(newMonth);
    } else if (calendarType === "video1" && newMonth !== prevVideoMonth1) {
      setDateVideo1(newDate);
      // newDate를 직접 전달
      fetchVideoDates(newDate, 1);
      setPrevVideoMonth1(newMonth);
    } else if (calendarType === "video2" && newMonth !== prevVideoMonth2) {
      setDateVideo2(newDate);
      // newDate를 직접 전달
      fetchVideoDates(newDate, 2);
      setPrevVideoMonth2(newMonth);
    }
  };
  
  

  
  // ✅ 챗봇 날짜 불러오기
  const fetchChatBotDate = useCallback(async (selectedDate) => {
    if (!selectedChild || !selectedChild.childUserId) return;

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth()+1;

    try {
      console.log(`📅 ChatBot 데이터 가져오기: ${year}년 ${month}월, childId: ${selectedChild.childUserId}`);
      const response = await getChatBotDate(selectedChild.childUserId, year, month);
      setChatBotDates(response.data);
    } catch (error) {
      console.error("❌ ChatBot 데이터 불러오기 실패:", error);
    }
  }, [selectedChild]);


  // ✅ 학습 영상 날짜 불러오기 (페이지 로드 시 + 월 변경 시)
  const fetchVideoDates = useCallback(async (selectedDate, calendarIndex) => {
    if (!selectedChild || !selectedChild.childUserId) return;

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth()+1;

    try {
      console.log(`📅 학습 영상 날짜 가져오기: ${year}년 ${month}월, childId: ${selectedChild.childUserId}`);
      const response = await getVideoDate(selectedChild.childUserId, year, month);
    
      // response.dateList의 각 날짜 배열([년도, 월, 일])을 "YYYY-MM-DD" 형식으로 변환
      const formattedDates = response.dateList.map(dateArr => {
        const [year, month, day] = dateArr;
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        return `${year}-${formattedMonth}-${formattedDay}`;
      });
    
      if (calendarIndex === 1) {
        setVideoDates1(formattedDates || []);
      } else {
        setVideoDates2(formattedDates || []);
      }
    } catch (error) {
      console.error(`❌ 학습 영상 ${calendarIndex} 데이터 불러오기 실패:`, error);
    }
    
  }, [selectedChild]);

  // ✅ 챗봇 데이터 가져오기: 처음 로드되었을 때 & month가 바뀌었을 때 실행
  useEffect(() => {
    const currentMonth = dateChatBot.getMonth();
    if (currentMonth !== prevChatBotMonth) {
      fetchChatBotDate();
      setPrevChatBotMonth(currentMonth); // ✅ 상태 업데이트하여 중복 실행 방지
    }
  }, [dateChatBot, fetchChatBotDate, prevChatBotMonth]);

  // ✅ 첫 번째 학습 영상 날짜 가져오기: 처음 로드 & month가 바뀌었을 때 실행
  useEffect(() => {
    const currentMonth = dateVideo1.getMonth();
    if (currentMonth !== prevVideoMonth1) {
      fetchVideoDates(1);
      setPrevVideoMonth1(currentMonth); // ✅ 상태 업데이트하여 중복 실행 방지
    }
  }, [dateVideo1, fetchVideoDates, prevVideoMonth1]);

  // ✅ 두 번째 학습 영상 날짜 가져오기: 처음 로드 & month가 바뀌었을 때 실행
  useEffect(() => {
    const currentMonth = dateVideo2.getMonth();
    if (currentMonth !== prevVideoMonth2) {
      fetchVideoDates(2);
      setPrevVideoMonth2(currentMonth); // ✅ 상태 업데이트하여 중복 실행 방지
    }
  }, [dateVideo2, fetchVideoDates, prevVideoMonth2]);

  useEffect(() => {
    setTimeout(() => {
      highlightScheduledDatesInDOM("chatbot");
    }, 300); // 타이밍은 필요에 따라 조절
  }, [chatBotDates, dateChatBot, highlightScheduledDatesInDOM]);

  useEffect(() => {
    setTimeout(() => {
      highlightScheduledDatesInDOM("left");
    }, 300); // 타이밍은 필요에 따라 조절
  }, [videoDates1, currentMonth, highlightScheduledDatesInDOM]);

  useEffect(() => {
    // videoDates2 또는 currentMonth가 변경될 때마다 highlight 함수 호출
    setTimeout(() => {
      highlightScheduledDatesInDOM("right");
    }, 300); // 필요한 경우 타이밍 조절
  }, [videoDates2, currentMonth, highlightScheduledDatesInDOM]);

  const handleViewDateChangeForChatBot = (e) => {
    handleMonthChange(e, "chatbot");
    setCurrentMonth(e.value);
  };
  const handleViewDateChangeForVideo1 = (e) => {
    handleMonthChange(e, "video1");
    setCurrentMonth(e.value);
  };
  const handleViewDateChangeForVideo2 = (e) => {
    handleMonthChange(e, "video2");
    setCurrentMonth(e.value);
  };
  
  
   // ✅ 부모 계정의 아이 리스트 불러오기기
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const childrenData = await getParentChildren();
        console.log("데이터 : ", childrenData);
        setChildren(childrenData);
  
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0]); // 기본 선택값 설정
        }
      } catch (error) {
        console.error("❌ 아이 목록 불러오기 실패:", error);
      }
    };
  
    fetchChildren();
  }, []);
  
   // ✅ childId로 학습 데이터 api 호출출
  useEffect(() => {
    if (selectedChild) {
      const timeoutId = setTimeout(() => {
        const fetchEmotionData = async () => {
          try {
            console.log("selectedChild : ", selectedChild.childUserId);
            const data = await getChildEmotionData(selectedChild.childUserId);
            setEmotionData(data);
            console.log("감정 데이터 : ", data);
          } catch (error) {
            console.error("❌ 감정 데이터 불러오기 실패:", error);
          }
        };
  
        fetchEmotionData();
      }, 300);
  
      return () => clearTimeout(timeoutId); // ✅ 이전 타이머를 클리어하여 중복 실행 방지
    }
  }, [selectedChild]); // ✅ `selectedChild`가 변경된 후 실행
  


  const handleChildChange = (e) => {
    const selectedChildId = e.target.value;
    const selectedChildObj = children.find((child) => child.childUserId === Number(selectedChildId));
  
    setSelectedChild(selectedChildObj);
    console.log("✅ 선택된 아이의 ID:", selectedChildObj?.childUserId);
  };

  // 주요감정, 보완감정 계산산
  const getMainAndSubEmotion = (stageData) => {
    if (!stageData) return { mainEmotions: ["-"], subEmotions: [] };

    const emotions = [
        { label: "기쁨", value: stageData.chartData.datasets[0].data[0] },
        { label: "슬픔", value: stageData.chartData.datasets[0].data[1] },
        { label: "화남", value: stageData.chartData.datasets[0].data[2] },
        { label: "공포", value: stageData.chartData.datasets[0].data[3] },
        { label: "놀람", value: stageData.chartData.datasets[0].data[4] },
    ];

    // 모든 감정이 동일한 값인지 확인
    const uniqueValues = new Set(emotions.map(e => e.value));
    if (uniqueValues.size === 1) {
        return { 
            mainEmotions: emotions.map(e => e.label), // 모든 감정을 주요 감정으로 설정
            subEmotions: [] // 보완 감정 없음
        };
    }

    // 데이터 개수 기준으로 정렬 (내림차순)
    emotions.sort((a, b) => b.value - a.value);

    const maxValue = emotions[0].value; // 가장 큰 값
    const minValue = emotions[emotions.length - 1].value; // 가장 작은 값

    return {
        mainEmotions: emotions.filter(e => e.value === maxValue).map(e => e.label),
        subEmotions: emotions.filter(e => e.value === minValue).map(e => e.label),
    };
  };



  // 오각형 차트 데이터
  const radarChartData = {
    labels: ["기쁨", "슬픔", "화남", "공포", "놀람"],
    datasets: [
      {
        label: "성공 횟수",
        data: emotionData
          ? [emotionData["1"].rating, emotionData["2"].rating, emotionData["3"].rating, emotionData["4"].rating, emotionData["5"].rating]
          : [0, 0, 0, 0, 0], // 데이터 없을 경우 기본값 설정
        backgroundColor: "rgba(61, 126, 235, 0.3)",
        borderColor: "#3D7EEB",
        borderWidth: 2,
        pointBackgroundColor: "#3D7EEB",
        pointBorderColor: "#fff",
        pointRadius: 4,
      },
    ],
  };
  

  // 오각형 차트 옵션
  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      r: {
        angleLines: { display: false },
        grid: { display: true, color: "#ddd" },
        ticks: { display: true },
      },
    },
  };

  const gameDataByStage = emotionData
  ? {
      1: {
        chartData: {
          labels: ["기쁨", "슬픔", "화남", "공포", "놀람"],
          datasets: [
            {
              label: "성공 횟수",
              data: [
                emotionData["1"].stageCrtCnt1,
                emotionData["2"].stageCrtCnt1,
                emotionData["3"].stageCrtCnt1,
                emotionData["4"].stageCrtCnt1,
                emotionData["5"].stageCrtCnt1,
              ],
              backgroundColor: ["#7DA1FF", "#FF7A7A", "#3C72E3", "#FFB85F", "#7A7AFF"],
              borderRadius: 5,
            },
          ],
        },
      },
      2: {
        chartData: {
          labels: ["기쁨", "슬픔", "화남", "공포", "놀람"],
          datasets: [
            {
              label: "성공 횟수",
              data: [
                emotionData["1"].stageCrtCnt2,
                emotionData["2"].stageCrtCnt2,
                emotionData["3"].stageCrtCnt2,
                emotionData["4"].stageCrtCnt2,
                emotionData["5"].stageCrtCnt2,
              ],
              backgroundColor: ["#7DA1FF", "#FF7A7A", "#3C72E3", "#FFB85F", "#7A7AFF"],
              borderRadius: 5,
            },
          ],
        },
      },
      3: {
        chartData: {
          labels: ["기쁨", "슬픔", "화남", "공포", "놀람"],
          datasets: [
            {
              label: "성공 횟수",
              data: [
                emotionData["1"].stageCrtCnt3,
                emotionData["2"].stageCrtCnt3,
                emotionData["3"].stageCrtCnt3,
                emotionData["4"].stageCrtCnt3,
                emotionData["5"].stageCrtCnt3,
              ],
              backgroundColor: ["#7DA1FF", "#FF7A7A", "#3C72E3", "#FFB85F", "#7A7AFF"],
              borderRadius: 5,
            },
          ],
        },
      },
      4: {
        chartData: {
          labels: ["기쁨", "슬픔", "화남", "공포", "놀람"],
          datasets: [
            {
              label: "성공 횟수",
              data: [
                emotionData["1"].stageCrtCnt4,
                emotionData["2"].stageCrtCnt4,
                emotionData["3"].stageCrtCnt4,
                emotionData["4"].stageCrtCnt4,
                emotionData["5"].stageCrtCnt4,
              ],
              backgroundColor: ["#7DA1FF", "#FF7A7A", "#3C72E3", "#FFB85F", "#7A7AFF"],
              borderRadius: 5,
            },
          ],
        },
      },
      5: {
        chartData: {
          labels: ["기쁨", "슬픔", "화남", "공포", "놀람"],
          datasets: [
            {
              label: "성공 횟수",
              data: [
                emotionData["1"].stageCrtCnt5,
                emotionData["2"].stageCrtCnt5,
                emotionData["3"].stageCrtCnt5,
                emotionData["4"].stageCrtCnt5,
                emotionData["5"].stageCrtCnt5,
              ],
              backgroundColor: ["#7DA1FF", "#FF7A7A", "#3C72E3", "#FFB85F", "#7A7AFF"],
              borderRadius: 5,
            },
          ],
        },
      },
    }
  : {};



  // 바 차트 옵션
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#666" },
        grid: { color: "#ddd" },
      },
      y: {
        suggestedMax: 13,
        ticks: { color: "#666", stepSize: 1 },
        grid: { color: "#ddd" },
      },
    },
  };

  // 단계 이동 핸들러
  const handleNextStage = () => {
    if (currentStage < 4) setCurrentStage(currentStage + 1);
  };

  const handlePrevStage = () => {
    if (currentStage > 1) setCurrentStage(currentStage - 1);
  };

  const handleVideoSearch = () => {
    window.open(
      '/parent/child/video/multiple',
      '_blank',
      'left=0,top=0,width=' + screen.width + ',height=' + screen.height
    );
  };
  

  return (
    <div className="pa-page">
      <ParentHeader />

      {/* 감정 분석 영역 */}
      <div className="pa-container">
        <div className="pa-title">
          <select className="pa-dropdown" value={selectedChild?.childUserId || ""} onChange={handleChildChange}>
            {children.length > 0 ? (
              children.map((child) => (
                <option key={child.childUserId} value={child.childUserId}>
                  {child.childUserName}
                </option>
              ))
            ) : (
              <option>아동 정보 없음</option>
            )}
          </select>
          <span>감정이의 학습 데이터</span>
        </div>

        {/* 감정 분석 섹션 */}
        <div className="pa-section">
          <h3>감정 분석</h3>
          <div className="pa-analysis-container">
            <div className="pa-card-left">
              <h3>통계</h3>
              <div className="pa-radar-chart">
                <Chart
                  type="radar"
                  data={radarChartData}
                  options={radarChartOptions}
                  style={{ width: '260px', height: '260px' }}
                />
              </div>
            </div>
            <div className="pa-card-right">
              <h3>감정 설명</h3>
              <p>
                현재 아이는 <b>‘놀라움’</b>이나 <b>‘두려움’</b> 관련 단어를
                어려워하는 경향이 있습니다.
              </p>
              <p>
                <b>주 감정:</b> 기쁨 <br />
                <b>보완 감정:</b> 분노
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pa-container">
        {/* 게임 분석 섹션 */}
        <div className="pa-section">
          <h3>게임 분석</h3>
          <div className="pa-game-wrapper">
            <button
              className="pa-stage-btn left"
              onClick={handlePrevStage}
              disabled={currentStage === 1}
            >
              ◀
            </button>

            <div className="pa-game-analysis">
              {[currentStage, currentStage + 1].map((stage) => {
                const stageData = gameDataByStage[stage]; // 단계별 데이터 가져오기
                const hasData = !!stageData;             // true/false

                return (
                  <div key={stage} className="pa-game-card">
                    <h3>{stage}단계</h3>
                    <div className="pa-chart" style={{ minHeight: "250px" }}>
                      {/* 데이터가 있으면 차트, 없으면 '데이터 생성 전' */}
                      {hasData ? (
                        <Chart
                          type="bar"
                          data={stageData.chartData}
                          options={barChartOptions}
                          style={{ height: "400px", width: "80%" }}
                        />
                      ) : (
                        <div className="pa-no-data">데이터 생성 전</div>
                      )}
                    </div>

                    {/* 주요 감정, 보완 감정, 시도/성공 횟수 */}
                    {hasData ? (
                      (() => {
                        const { mainEmotions, subEmotions } = getMainAndSubEmotion(stageData);
                        return (
                          <p>
                            <b>주요 감정:</b> {mainEmotions.length > 0 ? mainEmotions.join(", ") : ""} <br />
                            <b>보완 감정:</b> {subEmotions.length > 0 ? subEmotions.join(", ") : ""}
                          </p>
                        );
                      })()
                    ) : (
                      <p>
                        <b>주요 감정:</b>  <br />
                        <b>보완 감정:</b> 
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              className="pa-stage-btn right"
              onClick={handleNextStage}
              disabled={currentStage >= 4}
            >
              ▶
            </button>
          </div>
        </div>

        {/* 감정 일기 섹션 */}
        <div className="pa-section">
          <h3>감정 일기</h3>
          {/* 감정 일기 섹션 (챗봇 달력 적용) */}
          <div className="pa-diary-container">
            <div className="chatbot-calendar pa-diary-calendar">
              <Calendar
                value={dateChatBot}
                onChange={(e) => setDateChatBot(e.value)}
                showIcon
                style={{ width: "400px" }}
                appendTo="self"
                onViewDateChange={handleViewDateChangeForChatBot}
              />
            </div>
            <p>여기에 아이의 감정 일기 기록을 표시하거나 작성할 수 있습니다.</p>
          </div>

        </div>

        {/* 학습 영상 조회 섹션 */}
        <div className="pa-section">
          <h3>학습 영상 조회</h3>
          <div className="pa-videos-container">
            <div className="pa-videos-calendar">
              <div className="video-calendar-left">
                <Calendar
                  value={dateVideo1}
                  onChange={(e) => setDateVideo1(e.value)}
                  inline
                  onViewDateChange={handleViewDateChangeForVideo1}
                  style={{ width: '100%' }}
                  appendTo="self"
                />
              </div>
              
              <div className="video-calendar-right">
                <Calendar
                  value={dateVideo2}
                  onChange={(e) => setDateVideo2(e.value)}
                  inline
                  onViewDateChange={handleViewDateChangeForVideo2}
                  style={{ width: '100%' }}
                  appendTo="self"
                />
              </div>         
            </div>
            <div className="button-wrapper">
              <button className="pa-button" onClick={handleVideoSearch}>
                영상 조회
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default ParentChildPage;
