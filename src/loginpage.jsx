import { useState } from "react";
import { login, register } from "./auth";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-sub">Login or create an account</p>

        <input
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <div className="login-buttons">
          <button
            className="login-btn primary"
            onClick={() => login(email, password)}
          >
            Login
          </button>

          <button
            className="login-btn secondary"
            onClick={() => register(email, password)}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}