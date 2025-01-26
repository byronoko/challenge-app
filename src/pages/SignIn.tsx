import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Please Sign In</h1>
      <button onClick={() => navigate("/home")} style={{ margin: "10px" }}>
        Pretend to sign in
      </button>
      <footer style={{ marginTop: "50px" }}>
        <a href="/privacy-policy">Privacy Policy</a> |{" "}
        <a href="/terms-of-service">Terms of Service</a>
      </footer>
    </div>
  );
};

export default SignIn;
