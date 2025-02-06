import CardDetailsLayout from "../../components/Child/Card/CardDetailsLayout";
import { useLocation } from "react-router-dom";

function ChildCardDetailsPage() {
  // 현재 페이지의 위치 가져오기
  const location = useLocation();
  const emotion = location.state?.emotion;

  const emotionContent = () => {

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
  };

  return (
    <div>
      <CardDetailsLayout emotion={emotion} />
      {emotionContent()}
    </div>
  );
}

export default ChildCardDetailsPage;
