import { Route, Routes } from "react-router-dom"
import ChildClassPage from "../pages/Child/ChildClassPage"
import ChildReviewPage from "../pages/Child/ChildReviewPage"
import ChildCardMainPage from "../pages/Child/ChildCardMainPage"
import ChildChatbotPage from "../pages/Child/ChildChatbotPage"
// import JoyCardDetails from "../pages/Child/ChildCardsDetails/JoyCardDetails"
// import SadnessCardsDetails from "../pages/Child/ChildCardsDetails/SadnessCardsDetails"
// import AngerCardDetails from "../pages/Child/ChildCardsDetails/AngerCardDetails"
// import FearCardDetails from "../pages/Child/ChildCardsDetails/FearCardDetails"
// import SurpriseCardDetails from "../pages/Child/ChildCardsDetails/SurpriseCardDetails"

function AppChild(){
    return(
        <Routes>
            <Route path="/todayclass" element={<ChildClassPage/>}/>
            <Route path="/review" element={<ChildReviewPage/>}/>
            <Route path="/cardmain" element={<ChildCardMainPage/>}/>
                {/* <Route path="joy" element={<JoyCardDetails/>} />
                <Route path="sadness" element={<SadnessCardsDetails/>} />
                <Route path="anger" element={<AngerCardDetails/>} />
                <Route path="fear" element={<FearCardDetails/>} />
                <Route path="surprise" element={<SurpriseCardDetails/>} />
            </Route> */}
            <Route path="/chatbot" element={<ChildChatbotPage/>}/>
        </Routes>
    
    )


}

export default AppChild