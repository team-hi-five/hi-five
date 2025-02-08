import "../ChildCss/ChildCardMainPage.css";
import CardMainEmotionCard from "../../../components/Child/Card/CardMainEmotionCard";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

function ChildCardMainPage() {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // 페이지 들어왔을 때 스프링 효과
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // 낮을 수록 더 빠르게, 자식 간 들어오는 속도도
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: 200 }, // 오른쪽에서 시작
    show: { opacity: 1, x: 0 }, // 왼쪽으로 이동
  };

  // 스크롤 진행도 트래킹
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // 요소의 시작이 뷰포트 시작 혹은 끝에 닿았을 때를 정의
    offset: ["start start", "end end"],
    axis: "x",
  });

  // 스크롤이 x=0 혹은 100 일때 75로 이동
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  const emotions = [
    {
      id: 1,
      name: "기쁘미",
      image: "/test/기쁘미.PNG",
      type: "joy",
      bgColor: "#FCFCD4",
      textColor: "rgb(246, 96, 145)",
    },
    {
      id: 2,
      name: "슬프미",
      image: "/test/슬프미.png",
      type: "sadness",
      bgColor: "#B7E1F9",
      textColor: "rgb(176, 149, 126)",
    },
    {
      id: 3,
      name: "화나미",
      image: "/test/화나미.PNG",
      type: "anger",
      bgColor: "#B5ABD8",
      textColor: "rgb(242, 233, 191)",
    },
    {
      id: 4,
      name: "무서미",
      image: "/test/무서미.PNG",
      type: "fear",
      bgColor: "#FB8B32",
      textColor: "rgb(93, 68, 72)",
    },
    {
      id: 5,
      name: "놀라미",
      image: "/test/놀라미.png",
      type: "surprise",
      bgColor: "#62A5EB",
      textColor: "rgb(225, 96, 86)",
    },
  ];

  return (
    <div className="ch-card-main-container">
      <h1 className="ch-card-main-title">내가 모은 감정 카드</h1>
      <div className="ch-card-sticky-container">
        <motion.div
          className="ch-card-big-list"
          ref={containerRef}
          variants={container}
          initial="hidden"
          animate="show"
          style={{ x }}
        >
          {emotions.map((emotion) => (
            <motion.div
              id={emotion.id}
              key={emotion.id}
              variants={item}
              transition={{
                type: "spring",
                stiffness: 150, // 낮출수록 더 부드러워짐
                damping: 9, // 낮출수록 더 많이 튀김
              }}
            >
              <CardMainEmotionCard
                image={emotion.image}
                name={emotion.name}
                bgColor={emotion.bgColor}
                textColor={emotion.textColor}
                onClick={() => {
                  navigate("details", {
                    state: { emotion: emotion },
                  });
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default ChildCardMainPage;
