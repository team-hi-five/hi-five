import { useState } from "react";
import { Chart } from "primereact/chart";
import { Calendar } from 'primereact/calendar';
import CounselorHeader from '../../../components/Counselor/CounselorHeader'
import Footer from "../../../components/common/Footer";
import '../Css/CounselorChildrenDataPage.css'
import { useNavigate, useLocation } from 'react-router-dom';

function CounselorChildrenDataPage() {
  const location = useLocation();
  // URL로 전달된 아이 이름을 가져오거나, 기본값 설정
  const initialChild = location.state?.selectedChild || "박성원";
  const [selectedChild, setSelectedChild] = useState(initialChild);
  const [currentStage, setCurrentStage] = useState(1);
  const [date, setDate] = useState(null);
  const navigate = useNavigate();
  

  const children = ["박성원", "김한주", "이영희"];

  // 오각형 차트 데이터
  const radarChartData = {
    labels: ["당황", "분노", "기쁨", "슬픔", "공포"],
    datasets: [
      {
        label: "성공 횟수",
        data: [10, 10, 10, 10, 10],
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

  const gameDataByStage = {
    1: {
      chartData: {
        labels: ["당황", "분노", "기쁨", "슬픔", "공포"],
        datasets: [
          {
            label: "성공 횟수",
            data: [3, 5, 8, 6, 1],
            backgroundColor: ["#7DA1FF", "#FF7A7A", "#3C72E3", "#FFB85F", "#7A7AFF"],
            borderRadius: 5
          }
        ]
      },
      mainEmotion: "기쁨",
      subEmotion: "분노",
      successCount: 5,
      attemptCount: 8
    },
    2: {
      chartData: {
        labels: ["당황", "분노", "기쁨", "슬픔", "공포"],
        datasets: [
          {
            label: "성공 횟수",
            data: [2, 3, 7, 2, 0],
            backgroundColor: ["#7DA1FF", "#FF7A7A", "#3C72E3", "#FFB85F", "#7A7AFF"],
            borderRadius: 5
          }
        ]
      },
      mainEmotion: "분노",
      subEmotion: "슬픔",
      successCount: 3,
      attemptCount: 5
    },
    3: {
      chartData: {
        labels: ["당황", "분노", "기쁨", "슬픔", "공포"],
        datasets: [
          {
            label: "성공 횟수",
            data: [5, 4, 9, 1, 2],
            backgroundColor: ["#7DA1FF", "#FF7A7A", "#3C72E3", "#FFB85F", "#7A7AFF"],
            borderRadius: 5
          }
        ]
      },
      mainEmotion: "기쁨",
      subEmotion: "슬픔",
      successCount: 4,
      attemptCount: 5
    },
  };

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
        suggestedMax: 10,
        ticks: { color: "#666", stepSize: 2 },
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
    // 예시: 단일 영상, 다중 영상 중 하나로 이동
    navigate("/parent/child/video/single");
    // navigate("/parent/child/video/muultiple");
  };

  // 레이더 차트 데이터 및 옵션들은 그대로 유지...

  return (
    <>
      <div className="co-page">
        <CounselorHeader />

        <div className="co-container">
          <div className="co-title">
            <select
              className="co-dropdown"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
            >
              {children.map((child) => (
                <option key={child} value={child}>
                  {child}
                </option>
              ))}
            </select>
            <span>감정이의 학습 데이터</span>
          </div>

          <div className="co-section">
            <h3>감정 분석</h3>
            <div className="co-analysis-container">
              <div className="co-card-left">
                <h3>통계</h3>
                <div className="co-radar-chart">
                  <Chart
                    type="radar"
                    data={radarChartData}
                    options={radarChartOptions}
                    style={{ width: '260px', height: '260px' }}
                  />
                </div>
              </div>
              <div className="co-card-right">
                <h3>감정 설명</h3>
                <p>
                  현재 아이는 <b>'놀라움'</b>이나 <b>'두려움'</b> 관련 단어를
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

        <div className="co-container">
          <div className="co-section">
            <h3>게임 분석</h3>
            <div className="co-game-wrapper">
              <button
                className="co-stage-btn left"
                onClick={handlePrevStage}
                disabled={currentStage === 1}
              >
                ◀
              </button>

              <div className="co-game-analysis">
                {[currentStage, currentStage + 1].map((stage) => {
                  const stageData = gameDataByStage[stage];
                  const hasData = !!stageData;

                  return (
                    <div key={stage} className="co-game-card">
                      <h3>{stage}단계</h3>
                      <div className="co-chart" style={{ minHeight: "250px" }}>
                        {hasData ? (
                          <Chart
                            type="bar"
                            data={stageData.chartData}
                            options={barChartOptions}
                            style={{ height: "400px", width: "80%" }}
                          />
                        ) : (
                          <div className="co-no-data">데이터 생성 전</div>
                        )}
                      </div>

                      {hasData ? (
                        <p>
                          <b>주요 감정:</b> {stageData.mainEmotion} <br />
                          <b>보완 감정:</b> {stageData.subEmotion} <br />
                          <b>시도 횟수 / 성공 횟수:</b>{" "}
                          {stageData.attemptCount} / {stageData.successCount}
                        </p>
                      ) : (
                        <p>
                          <b>주요 감정:</b> <br />
                          <b>보완 감정:</b> <br />
                          <b>시도 횟수 / 성공 횟수:</b> 0 / 0
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                className="co-stage-btn right"
                onClick={handleNextStage}
                disabled={currentStage >= 4}
              >
                ▶
              </button>
            </div>
          </div>

          <div className="co-section">
            <h3>감정 일기</h3>
            <div className="co-diary-container">
              <div className="co-diary-calendar">
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

          <div className="co-section">
            <h3>학습 영상 조회</h3>
            <div className="co-videos-container">
              <div className="co-videos-calendar">
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
                <button className="co-button" onClick={handleVideoSearch}>
                  영상 조회
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    <Footer />
    </>
  );
}
  
  export default CounselorChildrenDataPage;