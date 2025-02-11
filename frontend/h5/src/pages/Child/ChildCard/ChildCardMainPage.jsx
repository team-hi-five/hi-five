import "../ChildCss/ChildCardMainPage.css";
import CardMainEmotionCard from "../../../components/Child/Card/CardMainEmotionCard";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChildCards } from "../../../api/childCard.jsx";

function ChildCardMainPage() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const childCards = async () => {
      try {
        const childId = sessionStorage.getItem("childId");
        if (!childId) {
          console.warn("❌ childUserId 없음. 데이터를 불러오지 못함.");
          return;
        }

        const data = await getChildCards(childId);
        setCards(data.cardAssetList); // API에서 받아온 카드 목록 저장
      } catch (error) {
        console.error("❌ 감정 카드 데이터 로딩 실패:", error);
      }
    };

    childCards();
  }, []);

  // 감정 캐릭터 데이터
  const emotions = [
    { id: 1, name: "기쁘미", image: "/child/character/joymi.png", type: "joy", bgColor: "#FCFCD4", textColor: "rgb(246, 96, 145)" },
    { id: 2, name: "슬프미", image: "/child/character/sadmi.png", type: "sadness", bgColor: "#B7E1F9", textColor: "rgb(176, 149, 126)" },
    { id: 3, name: "화나미", image: "/child/character/angrymi.png", type: "anger", bgColor: "#B5ABD8", textColor: "rgb(242, 233, 191)" },
    { id: 4, name: "무서미", image: "/child/character/scarymi.png", type: "fear", bgColor: "#FB8B32", textColor: "rgb(93, 68, 72)" },
    { id: 5, name: "놀라미", image: "/child/character/surprimi.png", type: "surprise", bgColor: "#62A5EB", textColor: "rgb(225, 96, 86)" },
  ];

  return (
      <div className="ch-card-main-container">
        <h1 className="ch-card-main-title">내가 모은 감정 카드</h1>
        <div className="ch-card-sticky-container">
          <motion.div className="ch-card-big-list" ref={containerRef}>
            {emotions.map((emotion) => {
              // ✅ 감정별 필터링된 카드 리스트 생성
              const filteredCards = cards.filter((card) => card.stageId % 5 === (emotion.id % 5));

              return (
                  <motion.div key={emotion.id}>
                    <CardMainEmotionCard
                        id={emotion.id} // ✅ id 전달 추가 (경고 해결)
                        image={emotion.image}
                        name={emotion.name}
                        bgColor={emotion.bgColor}
                        textColor={emotion.textColor}
                        onClick={() => {
                          navigate(`details/${emotion.type}`, { state: { emotion, filteredCards } });
                        }}
                    />
                  </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
  );
}

export default ChildCardMainPage;
