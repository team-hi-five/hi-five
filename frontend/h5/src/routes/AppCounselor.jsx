import { Route, Routes } from "react-router-dom"
import CounselorChildrenPage from "../pages/Counselor/Children/CounselorChildrenPage"
import CounselorChildrenDataPage from "../pages/Counselor/Children/CounselorChildrenDataPage"
import CounselorSchedulePage from "../pages/Counselor/Schedule/CounselorSchedulePage.jsx"
import CounselorMyPage from "../pages/Counselor/Profile/CounselorMyPage"
import CounselorBoardPage from "../pages/Counselor/Board/CounselorBoardPage"
import CounselorBoardDetailPage from "../pages/Counselor/Board/CounselorBoardDetailPage"
import CounselorBoardNoticeWritePage from "../pages/Counselor/Board/CounselorBoardNoticeWritePage"
import CounselorBoardFaqWritePage from "../pages/Counselor/Board/CounselorBoardFaqWritePage"
import CounselorParentVideoCall from "../pages/Counselor/Schedule/CounselorParentVideoCall"
import CounselorChildVideoCall from "../pages/Counselor/Schedule/CounselorChildVideoCall"


function AppCounselor(){
    return(
        <Routes>
            <Route path="/children" element={<CounselorChildrenPage />} />
            <Route path="/children/data" element={<CounselorChildrenDataPage />} />
            <Route path="/schedule" element={<CounselorSchedulePage />} />
            <Route path="/schedule/parent-video-call" element={<CounselorParentVideoCall />} />
            <Route path="/schedule/child-video-call" element={<CounselorChildVideoCall />} />
            <Route path="/mypage" element={<CounselorMyPage />} />
            <Route path="/board" element={<CounselorBoardPage />} />
            <Route path="/board/:type/:no" element={<CounselorBoardDetailPage />} />
            <Route path="/board/notice/write" element={<CounselorBoardNoticeWritePage />} />
            <Route path="/board/faq/write" element={<CounselorBoardFaqWritePage />} />
            {/* <Route path="/video" element={<CounselorVideoPage />} />
            <Route path="/meeting" element={<CounselorMeetingPage />} />
             */}
        </Routes>
    
    )


}

export default AppCounselor