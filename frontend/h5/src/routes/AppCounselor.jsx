import { Route, Routes } from "react-router-dom"
import CounselorChildrenPage from "../pages/Counselor/CounselorChildrenPage"
import CounselorChildrenDataPage from "../pages/Counselor/CounselorChildrenDataPage"
import IdSearch from '../pages/Counselor/IdSearch'
import PasswordSearch from "../pages/Counselor/PasswordSearch"
import IdFind from "../pages/Counselor/IdFind"
import PasswordFind from "../pages/Counselor/PasswordFind"
import CounselorSchedulePage from "../pages/Counselor/CounselorSchedulePage"
import CounselorMyPage from "../pages/Counselor/CounselorMyPage"


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
            <Route path="/find-id" element={<IdSearch />} />
            <Route path="/find-password" element={<PasswordSearch />} />
            <Route path="/get-id" element={<IdFind />} />
            <Route path="/get-password" element={<PasswordFind />} />

        </Routes>
    
    )


}

export default AppCounselor