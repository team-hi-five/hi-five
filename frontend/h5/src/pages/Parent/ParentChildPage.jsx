import { useState } from "react";
import { Chart } from "primereact/chart";
import ParentHeader from "/src/components/Parent/ParentHeader";
import "./ParentChildPage.css";

function ParentChildPage() {
  const [selectedChild, setSelectedChild] = useState("박성원");
  const [currentStage, setCurrentStage] = useState(1); // 현재 보이는 단계 시작 번호

  const children = ["박성원", "김한주", "이영희"];

  // 오각형 차트 데이터
  const radarChartData = {
    labels: ["당황", "분노", "기쁨", "슬픔", "공포"],
    datasets: [
      {
        label: "성공 횟수",
        data: [10, 10, 10, 10, 10],
        backgroundColor: "rgba(61, 126, 235, 0.3)", // 반투명 설정
        borderColor: "#3D7EEB", // 선 색상
        borderWidth: 2, // 선 두께
        pointBackgroundColor: "#3D7EEB", // 꼭짓점 색상
        pointBorderColor: "#fff", // 꼭짓점 테두리 색상
        pointRadius: 4, // 꼭짓점 크기
      },
    ],
  };

  // 오각형 차트 옵션
  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 범례 숨기기
      },
    },
    scales: {
      r: {
        angleLines: {
          display: false, // X축, Y축 중심선 제거
        },
        grid: {
          display: true, // 내부 원형 격자는 유지
          color: "#ddd",
        },
        ticks: {
          display: true, // 숫자 눈금 표시
        },
      },
    },
  };

  // 바 차트 데이터 (단계별 게임 분석)
  const barChartData = {
    labels: ["당황", "분노", "기쁨", "슬픔", "공포"],
    datasets: [
      {
        label: "성공 횟수",
        data: [3, 5, 8, 6, 1],
        backgroundColor: ["#7DA1FF", "#FF7A7A", "#3C72E3", "#FFB85F", "#7A7AFF"],
        borderRadius: 5,
      },
    ],
  };

  // 바 차트 옵션
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 범례 숨기기
      },
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

  // 단계 이동 핸들러 (최대 5단계)
  const handleNextStage = () => {
    if (currentStage < 4) setCurrentStage(currentStage + 1);
  };

  const handlePrevStage = () => {
    if (currentStage > 1) setCurrentStage(currentStage - 1);
  };

  return (
    <div className="pc-page">
      <ParentHeader />

      <div className="pc-container">
        {/* 아이 선택 드롭다운 */}
        <div className="pc-title">
          <select
            className="pc-dropdown"
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

        {/* 감정 분석 */}
        <div className="pc-section">
          <h3>감정 분석</h3>
          <div className="pc-analysis-container">
            <div className="pc-card-left">
              <h3>통계</h3>
              <Chart type="radar" data={radarChartData} options={radarChartOptions} />
            </div>
            <div className="pc-card-right">
              <div className="pc-card-right-content">
                <h3>감정 설명</h3>
                <p>
                  현재 아이는 <b>‘놀라움’</b>이나 <b>‘두려움’</b> 관련 단어를
                  어려워하는 경향이 있습니다. 다음 주에는 이 감정들을 더 많이
                  학습하면 좋을 것 같습니다.
                </p>
                <p>
                  <b>주 감정:</b> 기쁨 <br />
                  <b>보완 감정:</b> 분노
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 게임 분석 (단계 이동 가능) */}
        <div className="pc-section">
          <h3>게임 분석</h3>
          <div className="pc-game-wrapper">
            <div className="pc-game-analysis">
                {[currentStage, currentStage + 1].map((stage) => (
                    <div key={stage} className="pc-game-card">
                        <h3>{stage}단계</h3>
                        <div className="pc-chart">
                            <Chart type="bar" data={barChartData} options={barChartOptions} style={{ height: "400px", width: "80%" }} />
                        </div>
                        <p>
                            <b>주요 감정:</b> 기쁨 <br />
                            <b>보완 감정:</b> 분노 <br />
                            <b>시도 횟수 / 성공 횟수</b>
                        </p>
                    </div>
                ))}
            </div>

            <button 
                className="pc-stage-btn left" 
                onClick={handlePrevStage} 
                disabled={currentStage === 1}
            >
                ◀
            </button>
            <button 
                className="pc-stage-btn right" 
                onClick={handleNextStage} 
                disabled={currentStage >= 4}
            >
                ▶
            </button>
          </div>

        </div>
      </div>
      <div className="pc-container2">

      </div>
    </div>
  );
}

export default ParentChildPage;
