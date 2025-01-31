import './App.css'
import '@fontsource/noto-sans-kr';
import '@fontsource/jua';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage"
import ChildMainPage from "./pages/Child/ChildMainPage";
import ParentMainPage from "./pages/Parent/ParentMainPage";
import CounselorMainPage from "./pages/Counselor/CounselorMainPage";
import ChildLayout from "./components/Child/ChildLayout"
import AppChild from './routes/AppChild';
import AppParent from './routes/AppParent';
import AppCounselor from "./routes/AppCounselor"
import AuthRoutes from './routes/AuthRoutes';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login/*" element={<AuthRoutes />} />

        {/* 아동 페이지 */}
        <Route path="/child" element={<ChildLayout/>}>
          <Route index element={<ChildMainPage />} />
          {/* 아동 하위 경로 */}
          <Route path="*" element={<AppChild />} />
        </Route>

        {/* 학부모 페이지 */}
        <Route path="/parent" element={<ParentMainPage />} />
        {/* 학부모 하위 경로 */}
        <Route path="/parent/*" element={<AppParent />} />

        {/* 상담사 페이지 */}
        <Route path="/counselor" element={<CounselorMainPage />} /> 
        {/* 상담사 하위 경로 */}
        <Route path="/counselor/*" element={<AppCounselor />} />

      </Routes>
    </Router>
  )
}

export default App