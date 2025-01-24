import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <div>
      <h1>로그인 페이지</h1>
      <Link to="/parent">
        <button>학부모 페이지</button>
      </Link>
      <Link to="/counselor">
        <button>상담사 페이지</button>
      </Link>
    </div>
  );
}

export default LoginPage;
