import ParentHeader from "../../components/Parent/ParentHeader";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { Button } from 'primereact/button';

function ParentMainPage() {
  const handleOpenChildPage = () => {
    window.open(
        '/child',
        'ChildPage',
        'left=0,top=0,width=' + screen.width + ',height=' + screen.height
      );
  };

  return (
    <div>
      <ParentHeader />
      <h1>학부모페이지</h1>
      <h1>학부모페이지</h1>
      <Button onClick={handleOpenChildPage}>아동 페이지</Button>
    </div>
  );
}

export default ParentMainPage;
