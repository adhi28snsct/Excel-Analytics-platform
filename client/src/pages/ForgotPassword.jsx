import { useState } from "react";
import api from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.error || "Request failed");
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Token</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default ForgotPassword;
