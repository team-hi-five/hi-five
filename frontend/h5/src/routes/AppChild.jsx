import { Route, Routes } from "react-router-dom"
import ChildClassPage from "../pages/Child/ChildClassPage"
import ChildReviewPage from "../pages/Child/ChildReviewPage"
import ChildCardMainPage from "../pages/Child/ChildCardMainPage"
import ChildChatbotPage from "../pages/Child/ChildChatbotPage"
import ChildCardDetailsPage from "../pages/Child/ChildCardDetailsPage"

function AppChild(){
    return(
        <Routes>
            <Route path="todayclass" element={<ChildClassPage/>}/>
            <Route path="review" element={<ChildReviewPage/>}/>
            <Route path="cardmain" element={<ChildCardMainPage/>}/>
            <Route path="cardmain/details" element={<ChildCardDetailsPage/>} />
            <Route path="chatbot" element={<ChildChatbotPage/>}/>
        </Routes>
    
    )


}

export default AppChild