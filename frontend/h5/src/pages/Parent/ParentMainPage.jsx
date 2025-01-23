import { Link } from "react-router-dom";

function ParentMainPage() {
    return (
        <div>
            <h1>학부모페이지</h1>
            <Link to="/child">
            <button>아동 페이지</button>
        </Link>
        </div>
    )
}

export default ParentMainPage