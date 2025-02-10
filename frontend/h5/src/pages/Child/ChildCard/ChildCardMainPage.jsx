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

  // 페이지 애니메이션 설정
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, x: 200 },
    show: { opacity: 1, x: 0 },
  };

  // 스크롤 애니메이션 설정
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
    axis: "x",
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

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
          <motion.div className="ch-card-big-list" ref={containerRef} variants={container} initial="hidden" animate="show" style={{ x }}>
            {emotions.map((emotion) => {
              const filteredCards = cards.filter((card) => card.stageId % 5 === (emotion.id % 5));

              return (
                  <motion.div key={emotion.id} variants={item} transition={{ type: "spring", stiffness: 150, damping: 9 }}>
                    <CardMainEmotionCard
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
