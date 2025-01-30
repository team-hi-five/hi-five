import { Route, Routes } from "react-router-dom"
import ParentChildPage from "/src/pages/Parent/ParentChildPage"
import ParentSchedulePage from "/src/pages/Parent/ParentSchedulePage"
import ParentBoardPage from "/src/pages/Parent/ParentBoardPage"
import ParentMyPage from "/src/pages/Parent/ParentMyPage"
import ParentBoardDetailPage from "/src/pages/Parent/ParentBoardDetailPage"
import ParentBoardWritePage from "/src/pages/Parent/ParentBoardWritePage"


function AppParent(){
    return(
        <Routes>
            {/* 헤더에서 이동가능한 페이지 */}
            <Route path="/data" element={<ParentChildPage />} />
            <Route path="/schedule" element={<ParentSchedulePage />} />
            <Route path="/board" element={<ParentBoardPage />} />
            <Route path="/my" element={<ParentMyPage />} />

            {/* BoardPage에서 이동가능한 페이지지 */}
            <Route path="/board/:type/:no" element={<ParentBoardDetailPage />} />
            <Route path="board/write" element={<ParentBoardWritePage />} />
        </Routes>
    
    )


}

export default AppParent