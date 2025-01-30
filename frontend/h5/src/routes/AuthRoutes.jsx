import { Route, Routes } from "react-router-dom"
import IdSearch from '../pages/Counselor/IdSearch'


function AuthRoutes(){
    return(
        <Routes>
            <Route path="/find-id2" element={<IdSearch />} />
        </Routes>
    
    )


}

export default AuthRoutes