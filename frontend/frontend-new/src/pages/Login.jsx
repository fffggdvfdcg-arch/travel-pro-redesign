import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    try { const { data } = await loginUser(form); localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user)); navigate(["manager", "admin", "superadmin"].includes(data.user.role) ? "/admin" : "/"); }
    catch (err) { setError(err.response?.data?.message || "Ошибка входа"); }
  };
  return <div className="auth-wrap"><form className="auth-card form" onSubmit={handleSubmit}><h2>Вход</h2>{error && <div className="alert alert-error">{error}</div>}<input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required/><input className="input" name="password" type="password" placeholder="Пароль" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required/><button className="btn btn-primary" type="submit">Войти</button><p className="muted" style={{textAlign:"center"}}>Нет аккаунта? <Link to="/register">Регистрация</Link></p><Link to="/" className="muted" style={{textAlign:"center"}}>← На главную</Link></form></div>;
}
