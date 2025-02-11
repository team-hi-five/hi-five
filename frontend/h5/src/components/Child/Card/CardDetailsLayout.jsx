import "../ChildCss/CardDetailsLayout.css";
import PropTypes from "prop-types";
import { useState } from "react";

function CardDetailsLayout({ emotion, filteredCards }) {
  const maxCards = 6; // 6개 고정
  const displayedCards = [...filteredCards]; // 기존 데이터 복사

  // 만약 6개보다 적다면 빈 카드 슬롯을 추가
  while (displayedCards.length < maxCards) {
    displayedCards.push({ stageId: null, cardFront: "/test/happy_front.png", cardBack: "/test/happy_back.png" });
  }

  const [flippedCards, setFlippedCards] = useState(new Array(maxCards).fill(false));

  const handleCardClick = (index) => {
    const newFlippedCards = [...flippedCards];
    newFlippedCards[index] = !newFlippedCards[index];
    setFlippedCards(newFlippedCards);
  };

  return (
      <div className="ch-card-details-layout-container" style={{ backgroundColor: emotion.bgColor }}>
        <h1 className="ch-card-details-title">🩵 내가 모은 {emotion.name} 카드 🩵</h1>
        <div className="ch-card-details-content">
          <div className="ch-big-main-character">
            <img src={emotion.image} alt={emotion.name} />
            <div>{emotion.name}</div>
          </div>

          {/* ✅ 6개의 고정된 카드 슬롯을 채우되, 부족한 부분은 기본 이미지로 채움 */}
          <div className="ch-card-deatils-list">
            {displayedCards.slice(0, maxCards).map((card, index) => (
                <div key={index} className="ch-card" onClick={() => handleCardClick(index)}>
                  <img
                      src={flippedCards[index] ? card.cardBack : card.cardFront}
                      alt="카드 이미지"
                      className="ch-card-image"
                  />
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
};

export default CardDetailsLayout;
