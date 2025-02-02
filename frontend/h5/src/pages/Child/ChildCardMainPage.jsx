import "./ChildCss/ChildCardMainPage.css"
import CardMainEmotionCard from "../../components/Child/Card/CardMainEmotionCard";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";


function ChildCardMainPage() {

    const containerRef = useRef(null);
    const [selectedCardId, setSelectedCardId] = useState(null);

    // 페이지 들어왔을 때 스프링 효과
    const container = {
        hidden : { oppacity : 0},
        show : {
            opacity: 1,
            transition: {
                staggerChildren: 0.1  // 낮을 수록 더 빠르게, 자식 간 들어오는 속도도
            }
        }
    };

    const item = {
        hidden: { opacity: 0, x: 200 },  // 오른쪽에서 시작
        show: { opacity: 1, x: 0 }       // 왼쪽으로 이동
    }

    // 스크롤 진행도 트래킹 
    const { scrollYProgress } = useScroll({
        target: containerRef,
        // 요소의 시작이 뷰포트 시작 혹은 끝에 닿았을 때를 정의
        offset:["start start", "end end"],
        axis:"x",
        // 클릭시 스크롤 막기
        enabled: !selectedCardId
    })

    // 스크롤이 x=0 혹은 100 일때 75로 이동
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

    const emotions = [
        { id: 1, name: "기쁘미", image: "/test/기쁘미.png",
          bgColor: "#FCFCD4",textColor: "rgb(246, 96, 145)"},
        { id: 2, name: "슬프미", image: "/test/슬프미.png",
            bgColor: "#B7E1F9",textColor: "rgb(176, 149, 126)" },
        { id: 3, name: "화나미", image: "/test/화나미.PNG",
            bgColor: "#B5ABD8",textColor: "rgb(242, 233, 191)" },
        { id: 4, name: "무서미", image: "/test/무서미.PNG",
            bgColor: "#FB8B32",textColor: "rgb(93, 68, 72)" },
        { id: 5, name: "놀라미", image: "/test/놀라미.png",
            bgColor: "#62A5EB",textColor: "rgb(225, 96, 86)" }
    ]

    // 클릭된 카드를 제외하고 사라지기

        const handleClick = (id) => {
            setSelectedCardId(id);

            // 클릭시 카드가 화면 중앙으로
            // console.log(document.getElementById)
            setTimeout(()=> {
                const seletedElement = document.getElementById(`card-${id}`)
                if (seletedElement) {
                    seletedElement.scrollIntoView({behavior: "smooth", block: "center"})
                }
            },200);
        };

    // 클릭시 스크롤 막기
        useEffect(()=>{
            const backgroundContainer = document.querySelector(".ch-card-big-list");
            // console.log("현재 상태:",selectedCardId)

            if(selectedCardId){
                backgroundContainer.style.overflow = 'hidden';
                // console.log("스크롤 막은 후 overflow 상태", backgroundContainer.style.overflow)
            }else{
                backgroundContainer.style.overflow = 'unset';
            }

            return () => {
                backgroundContainer.style.overflow = 'unset';
                // console.log("실행")
            };
            // 의존성 배열 : selectedCardId가 변화될때만 실행
        },[selectedCardId]);

    return (
        <div className={`ch-card-main-container ${selectedCardId? "selected":""}`}>
            <h1 className={`ch-card-main-title ${selectedCardId? "selected":""}`}>내가 모은 감정 카드</h1>
            <div className={`ch-card-sticky-container ${selectedCardId? "selected":""}`}>
                <motion.div 
                    className={`ch-card-big-list ${selectedCardId? "selected":""}`}
                    ref={containerRef}
                    variants={container}
                    initial="hidden"
                    animate="show"
                    style={{x}}
                >
                    {emotions.map((emotion)=>(
                        <motion.div
                            id={emotion.id}
                            key={emotion.id}
                            variants={item}
                            transition={{
                                type: "spring",
                                stiffness: 150,     // 낮출수록 더 부드러워짐
                                damping: 9,        // 낮출수록 더 많이 튀김
                            }}
                            // 클릭되지 않은 카드는 사라지기
                            // style={{
                            //     opacity: selectedCardId !== null && selectedCardId !== emotion.id ? 0 : 1,
                            //     display: selectedCardId !== null && selectedCardId !== emotion.id ? 'none' : 'block'
                            // }}
                            animate={{
                                opacity: selectedCardId !== null && selectedCardId !== emotion.id ? 0 : 1,
                                display: selectedCardId !== null && selectedCardId !== emotion.id ? 'none': 'block',
                                transition: {duration: 0.3}
                            }}

                        >
                                <CardMainEmotionCard
                                id={emotion.id} 
                                key={emotion.id}
                                image={emotion.image}
                                name={emotion.name}
                                bgColor={emotion.bgColor}
                                textColor={emotion.textColor}
                                onClick={()=>handleClick(emotion.id)}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

export default ChildCardMainPage









// 선택된 카드를 메인 컨텐츠 영역으로 끌어올리기

// 선택된 카드만 메인 컨텐츠 영역 중앙에 크게 보이도록 하고, 나머지 카드들은 작은 썸네일 형태로 별도의 영역에 배치할 수 있습니다.
// 이렇게 하면 메인 컨텐츠 영역의 크기를 조절할 수 있어 스크롤 이슈를 해결할 수 있습니다.
// 선택된 카드가 메인 컨텐츠 영역을 가득 채우도록 CSS로 크기를 조절하면 됩니다.


// 해결하지 못한 문제 : 카드리스트의 크기를 어떻게 중앙으로 옮기는가..? 