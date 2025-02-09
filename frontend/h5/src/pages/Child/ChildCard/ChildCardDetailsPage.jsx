import { useMemo } from "react";
import CardDetailsLayout from "../../../components/Child/Card/CardDetailsLayout";
import { useLocation } from "react-router-dom";

function ChildCardDetailsPage() {
  // 현재 페이지의 위치 가져오기
  const location = useLocation();
  const emotion = location.state?.emotion;

  const emotionContent = useMemo(() => {
    if (!emotion || !emotion.type) {
      return <div>감정 정보를 찾을 수 없습니다.</div>;
    }
    switch (emotion.type) {
      case "joy":
        return <div className="ch-joy-detail-content"></div>;
      case "sadness":
        return <div className="ch-sadness-detail-content"></div>;
      case "anger":
        return <div className="ch-anger-detail-content"></div>;
      case "fear":
        return <div className="ch-fear-detail-content"></div>;
      case "surprise":
        return <div className="ch-surprise-detail-content"></div>;
    }
  }, [emotion]);

  if (!emotion) {
    return <div>감정 정보를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <div>
      <CardDetailsLayout emotion={emotion} />
      {emotionContent}
    </div>
  );
}

export default ChildCardDetailsPage;
