import { Route, Routes } from "react-router-dom"
import CounselorChildrenPage from "../pages/Counselor/Children/CounselorChildrenPage"
import CounselorChildrenDataPage from "../pages/Counselor/Children/CounselorChildrenDataPage"
import CounselorSchedulePage from "../pages/Counselor/Schedule/CounselorSchedulePage"
import CounselorMyPage from "../pages/Counselor/Profile/CounselorMyPage"
import CounselorBoardPage from "../pages/Counselor/Board/CounselorBoardPage"
import CounselorBoardDetailPage from "../pages/Counselor/Board/CounselorBoardDetailPage"
import CounselorBoardNoticeWritePage from "../pages/Counselor/Board/CounselorBoardNoticeWritePage"
import CounselorBoardFaqWritePage from "../pages/Counselor/Board/CounselorBoardFaqWritePage"


function AppCounselor(){
    return(
        <Routes>
            <Route path="/children" element={<CounselorChildrenPage />} />
            <Route path="/children/data" element={<CounselorChildrenDataPage />} />
            <Route path="/schedule" element={<CounselorSchedulePage />} />
            <Route path="/mypage" element={<CounselorMyPage />} />
            <Route path="/board" element={<CounselorBoardPage />} />
            <Route path="/board/:type/:no" element={<CounselorBoardDetailPage />} />
            <Route path="/board/notice/write" element={<CounselorBoardNoticeWritePage />} />
            <Route path="/board/faq/write" element={<CounselorBoardFaqWritePage />} />
            {/* <Route path="/video" element={<CounselorVideoPage />} />
            <Route path="/meeting" element={<CounselorMeetingPage />} />
            <Route path="/notice" element={<CounselorNoticePage />} />
            <Route path="/notice/detail" element={<CounselorNoticeDetailPage />} />
            <Route path="/notice/create" element={<CounselorNoticeCreatePage />} />
            <Route path="/notice/update" element={<CounselorNoticeUpdatePage />} />
            <Route path="/faq" element={<CounselorFaqPage />} />
            <Route path="/faq/create" element={<CounselorFaqCreatePage />} />
            <Route path="/faq/update" element={<CounselorFaqUpdatePage />} />
            <Route path="/faq/datail" element={<CounselorFaqDetailPage />} />
            <Route path="/qna" element={<CounselorQnaPage />} />
            <Route path="/qna/detail" element={<CounselorQnaDetailPage />} /> */}
        </Routes>
    
    )


}

export default AppCounselor