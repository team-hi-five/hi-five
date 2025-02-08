import "../ChildCss/ChildGameList.css";
import { Card } from "primereact/card";
import PropTypes from "prop-types";
// import ChildMainBackground from "../three/Background"

function ChildGameList({ game_chapter_id, chapter_pic, title, onClick }) {
  const handleClick = () => {
    onClick(game_chapter_id);
  };

  return (
    <div>
      {/* <ChildMainBackground/> */}
      <Card className="ch-game-chapter-card" onClick={handleClick}>
        <div className="ch-game-screenshot">
          <img src={chapter_pic} alt="샘플1" />
          <h1 className="ch-game-chapter-title">{title}</h1>
        </div>
      </Card>
    </div>
  );
}

// PropTypes 정의
ChildGameList.propTypes = {
  game_chapter_id: PropTypes.number.isRequired,
  chapter_pic: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default ChildGameList;
