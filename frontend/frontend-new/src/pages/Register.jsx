import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", acceptedLegal: false });
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!form.acceptedLegal) { setError("Нужно согласиться с политикой конфиденциальности и пользовательским соглашением"); return; }
    try { const { data } = await registerUser(form); localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user)); navigate("/"); }
    catch (err) { setError(err.response?.data?.message || "Ошибка регистрации"); }
  };
  return <div className="auth-wrap"><form className="auth-card form" onSubmit={handleSubmit}><h2>Регистрация</h2>{error && <div className="alert alert-error">{error}</div>}<input className="input" placeholder="Имя" value={form.username} onChange={(e)=>setForm({...form,username:e.target.value})} required/><input className="input" type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required/><input className="input" type="password" minLength="6" placeholder="Пароль" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required/><label className="check-line"><input type="checkbox" checked={form.acceptedLegal} onChange={(e)=>setForm({...form,acceptedLegal:e.target.checked})}/> <span>Я согласен с <Link to="/privacy">политикой конфиденциальности</Link> и <Link to="/terms">пользовательским соглашением</Link></span></label><button className="btn btn-green" type="submit" disabled={!form.acceptedLegal}>Создать аккаунт</button><p className="muted" style={{textAlign:"center"}}>Уже есть аккаунт? <Link to="/login">Войти</Link></p><Link to="/" className="muted" style={{textAlign:"center"}}>← На главную</Link></form></div>;
}
