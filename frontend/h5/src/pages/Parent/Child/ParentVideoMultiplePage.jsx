// ParentSchedulePage.jsx
import { useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import "/src/pages/Parent/ParentCss/ParentVideoMultiplePage.css";

function ParentVideoMultiplePage() {
  const [dates, setDates] = useState([null, null]);
  const [emotions, setEmotions] = useState([null, null]);
  const [selectedVideos, setSelectedVideos] = useState([null, null]);

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

  return (
    <div className="video-page-container">
      <h1 className="page-title">학습 영상 조회</h1>
      
      <div className="videos-container-m">
        {[0, 1].map((index) => (
          <div key={index} className="video-section-m">
            <div className="controls-row-m">
              <div className="control-item date-picker-m">
                <label>날짜 선택</label>
                <Calendar
                  value={dates[index]}
                  onChange={(e) => {
                    const newDates = [...dates];
                    newDates[index] = e.value;
                    setDates(newDates);
                  }}
                  showIcon={false}
                  className="calendar-input simple-calendar"
                  placeholder="날짜를 선택하세요"
                />
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
                <label>영상 선택</label>
                <Dropdown
                  value={selectedVideos[index]}
                  options={videoOptions}
                  onChange={(e) => {
                    const newVideos = [...selectedVideos];
                    newVideos[index] = e.value;
                    setSelectedVideos(newVideos);
                  }}
                  placeholder="영상"
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

export default ParentVideoMultiplePage;