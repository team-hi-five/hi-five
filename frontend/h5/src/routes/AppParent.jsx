import { Route, Routes } from "react-router-dom"
import ParentChildPage from "/src/pages/Parent/Child/ParentChildPage"
import ParentSchedulePage from "/src/pages/Parent/Schedule/ParentSchedulePage"
import ParentBoardPage from "/src/pages/Parent/Board/ParentBoardPage"
import ParentMyPage from "/src/pages/Parent/My/ParentMyPage"
import ParentBoardDetailPage from "/src/pages/Parent/Board/ParentBoardDetailPage"
import ParentBoardWritePage from "/src/pages/Parent/Board/ParentBoardWritePage"


function AppParent(){
    return(
        <Routes>
            {/* 헤더에서 이동가능한 페이지 */}
            <Route path="/data" element={<ParentChildPage />} />
            <Route path="/schedule" element={<ParentSchedulePage />} />
            <Route path="/board" element={<ParentBoardPage />} />
            <Route path="/my" element={<ParentMyPage />} />

            {/* ParertChild에서 이동가능한 페이지지 */}
            <Route path="/child/video/single" element={<ParentBoardDetailPage />} />
            <Route path="child/video/multiple" element={<ParentBoardWritePage />} />

            {/* BoardPage에서 이동가능한 페이지지 */}
            <Route path="/board/:type/:no" element={<ParentBoardDetailPage />} />
            <Route path="board/write" element={<ParentBoardWritePage />} />
        </Routes>
    
    )


}

export default AppParent