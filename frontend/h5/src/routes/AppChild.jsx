import { Route, Routes } from "react-router-dom";
import ChildMainPage from "../pages/Child/ChildMainPage";
import ChildClassPage from "../pages/Child/ChildClassPage";
import ChildReviewPage from "../pages/Child/ChildReviewPage";
import ChildReviewGamePage from "../pages/Child/ChildReviewGamePage";
import ChildCardMainPage from "../pages/Child/ChildCard/ChildCardMainPage";
import ChildChatbotPage from "../pages/Child/ChildChatbotPage";
import ChildCardDetailsPage from "../pages/Child/ChildCard/ChildCardDetailsPage";


function AppChild() {
  return (
    <Routes>
      <Route path=":childId" element={<ChildMainPage />} />
      <Route path="todayclass" element={<ChildClassPage />} />
      <Route path="review" element={<ChildReviewPage />} />
      <Route path="review/game" element={<ChildReviewGamePage />} />
      <Route path="cardmain" element={<ChildCardMainPage />} />
      <Route path="cardmain/details" element={<ChildCardDetailsPage />} />
      <Route path="chatbot" element={<ChildChatbotPage />} />
    </Routes>
  );
}

export default AppChild;
