import { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import { Calendar } from 'primereact/calendar';
import ParentHeader from "/src/components/Parent/ParentHeader";
import Footer from "/src/components/common/Footer";
import "/src/pages/Parent/ParentCss/ParentChildPage.css";
import { getParentChildren } from "/src/api/userParent";
import { getChildEmotionData } from "/src/api/childData";


function ParentChildPage() {
  const [selectedChild, setSelectedChild] = useState("박성원");
  const [currentStage, setCurrentStage] = useState(1);
  const [date, setDate] = useState(null);

  const [children, setChildren] = useState([]);
  const [emotionData, setEmotionData] = useState(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const childrenData = await getParentChildren();
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
  

useEffect(() => {
  if (selectedChild) {
    const fetchEmotionData = async () => {
      try {
        const data = await getChildEmotionData(selectedChild.childUserId);
        setEmotionData(data);
      } catch (error) {
        console.error("❌ 감정 데이터 불러오기 실패:", error);
      }
    };
    fetchEmotionData();
  }
}, [selectedChild]); // 🔹 selectedChild 변경 시 API 호출


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
                emotionData["1"].stageCrtRate1,
                emotionData["2"].stageCrtRate2,
                emotionData["3"].stageCrtRate3,
                emotionData["4"].stageCrtRate4,
                emotionData["5"].stageCrtRate5,
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
          <div className="pa-diary-container">
            <div className="pa-diary-calendar">
              <Calendar
                value={date}
                onChange={(e) => setDate(e.value)}
                showIcon
                style={{ width: '300px' }}
                appendTo="self"
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
              <Calendar
                value={date}
                onChange={(e) => setDate(e.value)}
                inline
                style={{ width: '45%' }}
              />
              <Calendar
                value={date}
                onChange={(e) => setDate(e.value)}
                inline
                style={{ width: '45%' }}
              />
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
