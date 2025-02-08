import "./ChildCss/ChildReviewPage.css";
import ChildGameList from "../../components/Child/Game/ChildGameList";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { chapter } from "../../api/childReview";

function ChildReviewPage() {
  const navigate = useNavigate();
  const [chapterData, setChapterData] = useState(null);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await chapter();
        console.log("api응답", data);
        setChapterData(data);
      } catch (error) {
        console.error("api요청실패", error);
      }
    };
    fetchdata();
  }, []);

  const items = [
    {
      game_chapter_id: 1,
      chapter_pic: "/Child/chapter1Scene.png",
      title: "학교가는길",
    },
    {
      game_chapter_id: 2,
      chapter_pic: "/Child/chapter1.png",
      title: "집가는길",
    },
    {
      game_chapter_id: 3,
      chapter_pic: "/test/sample3.jpg",
      title: "싸피피가는길",
    },
  ];

  return (
    <div className="ch-child-game-list-container">
      {items.map((item) => (
        <div key={item.game_chapter_id}>
          <ChildGameList
            game_chapter_id={item.game_chapter_id}
            chapter_pic={item.chapter_pic}
            title={item.title}
            onClick={() => {
              console.log("clicked:", item.game_chapter_id);
              navigate("game", {
                state: { item },
              });
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default ChildReviewPage;
