import { Route, Routes } from "react-router-dom"
import ParentChildPage from "/src/pages/Parent/ParentChildPage"
import ParentSchedulePage from "/src/pages/Parent/ParentSchedulePage"
import ParentBoardPage from "/src/pages/Parent/ParentBoardPage"
import ParentMyPage from "/src/pages/Parent/ParentMyPage"


function AppParent(){
    return(
        <Routes>
            <Route path="/data" element={<ParentChildPage />} />
            <Route path="/schedule" element={<ParentSchedulePage />} />
            <Route path="/board" element={<ParentBoardPage />} />
            <Route path="/my" element={<ParentMyPage />} />
        </Routes>
    
    )


}

export default AppParent