import "./ChildCss/ChildReviewPage.css";
import ChildGameList from "../../components/Child/Game/ChildGameList";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { chapter } from "../../api/childGame";
import { Carousel } from 'primereact/carousel';

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

  const chapterTemplate = (item) => (
    <ChildGameList
      gameChapterId={item.gameChapterId}
      chapterPic={item.chapterPic}
      title={item.title}
      isLocked={item.isLocked}
      onClick={() => {
        if (item.isLocked) {
          alert("아직 개발 중인 챕터입니다!");
          return;
        }
        navigate(`/child/${childId}/review/${item.gameChapterId}`, {
          state: { chapterId: item.gameChapterId },
        });
      }}
    />
  );
 
  return (
    <div 
      className="ch-child-game-list-container"
      style={{ 
        width: '100%', 
        height: '520px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Carousel 
        value={chapterData} 
        numVisible={1} 
        numScroll={1} 
        orientation="vertical" 
        verticalViewPortHeight="720px"
        itemTemplate={chapterTemplate} 
        circular
        showNavigators
        style={{
          width: '160%',
          maxWidth: '800px', // 최대 너비 제한
          maxHeight:'800px',
          height: '700px'
        }}
      />
    </div>
  );
 }
 export default ChildReviewPage;
 