import "../ChildCss/CardDetailsLayout.css";
import PropTypes from "prop-types";
import { useState } from "react";

function CardDetailsLayout({ emotion, filteredCards, emotionType }) {
    const maxCards = 6; // 6개 고정
    const displayedCards = [...filteredCards]; // 기존 데이터 복사

    // 만약 6개보다 적다면 빈 카드 슬롯을 추가
    while (displayedCards.length < maxCards) {
        if (emotionType === "joy") {
            displayedCards.push({ stageId: null, cardFront: "/child/card/Joymi_ChallengeCard.png", cardBack: "/child/card/Joymi_ChallengeCard.png" });
        } else if (emotionType === "sadness") {
            displayedCards.push({ stageId: null, cardFront: "/child/card/Sadmi_ChallengeCard.png", cardBack: "/child/card/Sadmi_ChallengeCard.png" });
        } else if (emotionType === "anger") {
            displayedCards.push({ stageId: null, cardFront: "/child/card/Angrymi_ChallengeCard.png", cardBack: "/child/card/Angrymi_ChallengeCard.png" });
        } else if (emotionType === "fear") {
            displayedCards.push({ stageId: null, cardFront: "/child/card/Scarymi_ChallengeCard.png", cardBack: "/child/card/Scarymi_ChallengeCard.png" });
        } else if (emotionType === "surprise") {
            displayedCards.push({ stageId: null, cardFront: "/child/card/Surprisemi_ChallengeCard.png", cardBack: "/child/card/Surprisemi_ChallengeCard.png" });
        } else {
            displayedCards.push({ stageId: null, cardFront: "/test/happy_front.png", cardBack: "/test/happy_back.png" });
        }
    }

    // 카드 회전 상태 관리 (초기값: 전부 앞면)
    const [flippedCards, setFlippedCards] = useState(new Array(maxCards).fill(false));

    // 마우스 올릴 때 카드 회전
    const handleMouseEnter = (index) => {
        setFlippedCards((prev) => {
            const newFlippedCards = [...prev];
            newFlippedCards[index] = true; // 180도 회전하여 뒷면 보이기
            return newFlippedCards;
        });
    };

    // 마우스 나갈 때 다시 원래대로
    const handleMouseLeave = (index) => {
        setFlippedCards((prev) => {
            const newFlippedCards = [...prev];
            newFlippedCards[index] = false; // 0도로 복귀하여 앞면 보이기
            return newFlippedCards;
        });
    };

    return (
        <div className="ch-card-details-layout-container" style={{ backgroundColor: emotion.bgColor }}>
            <h1 className="ch-card-details-title">🩵 내가 모은 {emotion.name} 카드 🩵</h1>
            <div className="ch-card-details-content">
                <div className="ch-big-main-character">
                    <img src={emotion.image} alt={emotion.name} />
                    <div>{emotion.name}</div>
                </div>

                {/* ✅ 마우스 오버로 카드가 반대로 회전했다가 원래대로 돌아옴 */}
                <div className="ch-card-deatils-list">
                    {displayedCards.slice(0, maxCards).map((card, index) => (
                        <div
                            key={index}
                            className={`ch-card ${flippedCards[index] ? "flipped" : ""}`}
                            onMouseEnter={() => handleMouseEnter(index)} // 마우스 올리면 회전
                            onMouseLeave={() => handleMouseLeave(index)} // 마우스 떼면 원래대로
                        >
                            <img src={card.cardFront} alt="카드 앞면" className="ch-card-front" />
                            <img src={card.cardBack} alt="카드 뒷면" className="ch-card-back" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

CardDetailsLayout.propTypes = {
    emotion: PropTypes.shape({
        name: PropTypes.string.isRequired,
        bgColor: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
    }).isRequired,
    filteredCards: PropTypes.arrayOf(
        PropTypes.shape({
            stageId: PropTypes.number,
            cardFront: PropTypes.string.isRequired,
            cardBack: PropTypes.string.isRequired,
        })
    ).isRequired,
    emotionType: PropTypes.string.isRequired,
};

export default CardDetailsLayout;
