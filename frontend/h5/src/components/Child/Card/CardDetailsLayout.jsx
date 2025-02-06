import "../ChildCss/CardDetailsLayout.css";
import PropTypes from "prop-types";
import { useState } from "react";

function CardDetailsLayout({ emotion }) {
  {
    /* 지금은 6개로 고정 다만 데이터가 들어오면 carddata 를 순회하는걸로 수정 */
  }
  const [flippedCards, SetFlippedCards] = useState(new Array(6).fill(false));
  const handleCardClick = (index) => {
    // 기존 배열 복사
    const newFlippedCards = [...flippedCards];
    // true 뒤집힌 상태, false 안뒤집힌 상태
    newFlippedCards[index] = !newFlippedCards[index];
    setFlippedCards(newFlippedCards);
  };

  return (
    <div
      className="ch-card-details-layout-container"
      style={{ backgroundColor: emotion.bgColor }}
    >
      <h1 className="ch-card-details-title">
        {" "}
        🩵 내가 모은 {emotion.name}카드 🩵{" "}
      </h1>
      <div className="ch-card-details-content">
        <div className="ch-big-main-character">
          <img src={emotion.image} alt={emotion.name} />
          <div>{emotion.name}</div>
        </div>

        {/* 지금은 6개로 고정 다만 데이터가 들어오면 carddata 를 순회하는걸로 수정 */}
        <div className="ch-card-deatils-list">
          {/*  뒤집는 카드  */}

          <img src="/test/happy_front.png" alt="샘플카드" />
          <img src="/test/happy_front.png" alt="샘플카드" />
          <img src="/test/happy_front.png" alt="샘플카드" />
          <img src="/test/happy_front.png" alt="샘플카드" />
          <img src="/test/happy_front.png" alt="샘플카드" />
          <img src="/test/happy_front.png" alt="샘플카드" />
        </div>
      </div>
    </div>
  );
}

CardDetailsLayout.propTypes = {
  emotion: PropTypes.shape({
    name: PropTypes.string.isRequired,
    bgColor: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired, // 이미지 src URL은 문자열이므로 string 타입
  }),
};
export default CardDetailsLayout;
