import './App.css'
import '@fontsource/noto-sans-kr';
import '@fontsource/jua';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage"
import ChildMainPage from "./pages/Child/ChildMainPage";
import ParentMainPage from "./pages/Parent/ParentMainPage";
import CounselorMainPage from "./pages/Counselor/CounselorMainPage";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* 아동 페이지 */}
        <Route path="/child" element={<ChildMainPage />} />

        {/* 학부모 페이지 */}
        <Route path="/parent" element={<ParentMainPage />} />

        {/* 상담사 페이지 */}
        <Route path="/counselor" element={<CounselorMainPage />} />

      </Routes>
    </Router>
  )
}

export default App