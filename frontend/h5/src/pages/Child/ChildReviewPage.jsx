import "./ChildCss/ChildReviewPage.css";
import ChildGameList from "../../components/Child/Game/ChildGameList";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { chapter } from "../../api/childGame";

function ChildReviewPage() {
  const navigate = useNavigate();
  // 세션스토리지에서 childId 가져오기
  const childId = sessionStorage.getItem("childId");
  const [chapterData, setChapterData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await chapter();
      const chapterlist = response.chapterAssetDtoList;
      // console.log("응답데이터", response);

      // 개발 중 더미데이터
      // 가상의 데이터 (개발 중)
      const chapterdummyData = [
        {
          gameChapterId: 3,
          chapterPic: "/child/chapterdummyimg.jpg", // 개발 중 이미지
          title: "개발 중",
          isLocked: true,
        },
        {
          gameChapterId: 4,
          chapterPic: "/child/chapterdummyimg.jpg",
          title: "개발 중",
          isLocked: true,
        },
        {
          gameChapterId: 5,
          chapterPic: "/child/chapterdummyimg.jpg",
          title: "개발 중",
          isLocked: true,
        },
      ];

      setChapterData([...chapterlist, ...chapterdummyData]);
    };
    fetchData();
  }, []);

  return (
    <div className="ch-child-game-list-container">
      {chapterData?.map((item) => (
        // console.log("1번 이미지 URL:", item.chapterPic),
        console.log("2번 이미지 URL:", item.chapterPic),
        <ChildGameList
          key={item.gameChapterId}
          gameChapterId={item.gameChapterId}
          chapterPic={item.chapterPic}
          title={item.title}
          isLocked={item.isLocked}
          onClick={() => {
            if (item.isLocked) {
              // 잠금 상태 체크
              alert("아직 개발 중인 챕터입니다!");
              return;
            }
            // console.log("clicked:", item.gameChapterId);
            navigate(`/child/${childId}/reveiw/${item.gameChapterId}`, {
              state: { item },
            });
          }}
        />
      ))}
    </div>
  );
}
export default ChildReviewPage;
