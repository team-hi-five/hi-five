import { Route, Routes } from "react-router-dom"
import CounselorChildrenPage from "../pages/Counselor/Children/CounselorChildrenPage"
import CounselorChildrenDataPage from "../pages/Counselor/Children/CounselorChildrenDataPage"
import CounselorSchedulePage from "../pages/Counselor/Schedule/CounselorSchedulePage"
import CounselorMyPage from "../pages/Counselor/Profile/CounselorMyPage"


function AppCounselor(){
    return(
        <Routes>
            <Route path="/children" element={<CounselorChildrenPage />} />
            <Route path="/children/data" element={<CounselorChildrenDataPage />} />
            <Route path="/schedule" element={<CounselorSchedulePage />} />
            <Route path="/mypage" element={<CounselorMyPage />} />
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