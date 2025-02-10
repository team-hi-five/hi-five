import { useMemo } from "react";
import CardDetailsLayout from "../../../components/Child/Card/CardDetailsLayout";
import { useLocation } from "react-router-dom";

function ChildCardDetailsPage() {
  // 현재 페이지의 위치 가져오기
  const location = useLocation();
  const emotion = location.state?.emotion;
  const filteredCards = location.state?.filteredCards || []; // 필터링된 카드 리스트

  const emotionContent = useMemo(() => {
    if (!emotion || !emotion.type) {
      return <div>감정 정보를 찾을 수 없습니다.</div>;
    }

    switch (emotion.type) {
      case "joy":
        return <div className="ch-joy-detail-content">기쁨 관련 설명</div>;
      case "sadness":
        return <div className="ch-sadness-detail-content">슬픔 관련 설명</div>;
      case "anger":
        return <div className="ch-anger-detail-content">화남 관련 설명</div>;
      case "fear":
        return <div className="ch-fear-detail-content">두려움 관련 설명</div>;
      case "surprise":
        return <div className="ch-surprise-detail-content">놀람 관련 설명</div>;
      default:
        return <div>감정 정보를 찾을 수 없습니다.</div>;
    }
  }, [emotion]);

  if (!emotion) {
    return <div>감정 정보를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
      <div>
        <CardDetailsLayout emotion={emotion} />
        {emotionContent}

        {/* 필터링된 카드 리스트 렌더링 */}
        <div className="ch-card-list">
          {filteredCards.length > 0 ? (
              <ul>
                {filteredCards.map((card) => (
                    <li key={card.stageId} className="ch-card-item">
                      <img src={card.cardFront} alt="카드 앞면" className="ch-card-image" />
                      <img src={card.cardBack} alt="카드 뒷면" className="ch-card-image" />
                    </li>
                ))}
              </ul>
          ) : (
              <p>해당 감정의 카드가 없습니다.</p>
          )}
        </div>
      </div>
  );
}

export default ChildCardDetailsPage;
