import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { banUser, changeUserRole, createCruise, createTour, deleteBooking, deleteCruise, deleteTour, deleteUser, getBookings, getCruises, getTours, getUsers, unbanUser, updateBookingStatus, updateCruise, updateTour } from "../api";

const emptyTour = { title: "", description: "", price: "", duration: "", location: "", country: "", image: "", maxPeople: 10, type: "package", stars: 4, tags: "", lowPrice: false, discountPercent: 35 };
const emptyCruise = { title: "", description: "", route: "", ports: "", liner: "", cabin: "Balcony", country: "", price: "", duration: "", departureDate: "", image: "", maxPeople: 20, stars: 5, tags: "", lowPrice: false, discountPercent: 35 };
const toCsv = (value) => Array.isArray(value) ? value.join(", ") : value || "";
const rank = { user: 1, manager: 2, admin: 3, superadmin: 4 };

export default function AdminPanel() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isManager = currentUser?.role === "manager";
  const isAdmin = currentUser?.role === "admin";
  const isSuperAdmin = currentUser?.role === "superadmin";
  const canManageCatalog = isAdmin || isSuperAdmin;
  const canManageUsers = isAdmin || isSuperAdmin;

  const [users, setUsers] = useState([]), [tours, setTours] = useState([]), [cruises, setCruises] = useState([]), [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState(canManageCatalog ? "tours" : "bookings"), [tourForm, setTourForm] = useState(emptyTour), [cruiseForm, setCruiseForm] = useState(emptyCruise);
  const [editingTourId, setEditingTourId] = useState(null), [editingCruiseId, setEditingCruiseId] = useState(null), [message, setMessage] = useState(""), [search, setSearch] = useState("");
  const flash = (text) => { setMessage(text); setTimeout(() => setMessage(""), 3500); };

  const loadAll = async () => {
    const requests = [getBookings()];
    if (canManageCatalog) requests.push(getTours(), getCruises());
    if (canManageUsers) requests.push(getUsers());
    const results = await Promise.allSettled(requests);
    if (results[0]?.status === "fulfilled") setBookings(results[0].value.data);
    let i = 1;
    if (canManageCatalog) {
      if (results[i]?.status === "fulfilled") setTours(results[i].value.data); i++;
      if (results[i]?.status === "fulfilled") setCruises(results[i].value.data); i++;
    }
    if (canManageUsers && results[i]?.status === "fulfilled") setUsers(results[i].value.data);
  };
  useEffect(() => { loadAll(); }, []);

  const visibleTours = useMemo(() => tours.filter(t => !search || `${t.title} ${t.location} ${t.country}`.toLowerCase().includes(search.toLowerCase())), [tours, search]);
  const visibleCruises = useMemo(() => cruises.filter(c => !search || `${c.title} ${c.route} ${c.liner}`.toLowerCase().includes(search.toLowerCase())), [cruises, search]);
  const changeTour = (e) => setTourForm({ ...tourForm, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const changeCruise = (e) => setCruiseForm({ ...cruiseForm, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const clearTour = () => { setTourForm(emptyTour); setEditingTourId(null); };
  const clearCruise = () => { setCruiseForm(emptyCruise); setEditingCruiseId(null); };
  const numberize = (payload, keys) => { const out = { ...payload }; keys.forEach(k => out[k] = Number(out[k] || 0)); return out; };
  const saveTour = async (e) => { e.preventDefault(); const payload = numberize(tourForm, ["price", "duration", "maxPeople", "stars", "discountPercent"]); try { editingTourId ? await updateTour(editingTourId, payload) : await createTour(payload); flash(editingTourId ? "Тур обновлён" : "Тур добавлен"); clearTour(); loadAll(); } catch (err) { flash(err.response?.data?.message || "Ошибка сохранения тура"); } };
  const saveCruise = async (e) => { e.preventDefault(); const payload = numberize(cruiseForm, ["price", "duration", "maxPeople", "stars", "discountPercent"]); try { editingCruiseId ? await updateCruise(editingCruiseId, payload) : await createCruise(payload); flash(editingCruiseId ? "Круиз обновлён" : "Круиз добавлен"); clearCruise(); loadAll(); } catch (err) { flash(err.response?.data?.message || "Ошибка сохранения круиза"); } };
  const editTour = (t) => { setEditingTourId(t._id); setTourForm({ ...emptyTour, ...t, tags: toCsv(t.tags) }); setTab("tours"); window.scrollTo({top:0,behavior:"smooth"}); };
  const editCruise = (c) => { setEditingCruiseId(c._id); setCruiseForm({ ...emptyCruise, ...c, tags: toCsv(c.tags), ports: toCsv(c.ports), departureDate: c.departureDate ? c.departureDate.slice(0,10) : "" }); setTab("cruises"); window.scrollTo({top:0,behavior:"smooth"}); };
  const removeTour = async (id) => { if (!confirm("Удалить тур?")) return; await deleteTour(id); flash("Тур удалён"); loadAll(); };
  const removeCruise = async (id) => { if (!confirm("Удалить круиз?")) return; await deleteCruise(id); flash("Круиз удалён"); loadAll(); };
  const removeUser = async (id) => {
    if (!confirm("Удалить пользователя навсегда?")) return;
    try {
      const { data } = await deleteUser(id);
      const deletedId = data?.deletedId || id;
      setUsers(prev => prev.filter(u => u._id !== deletedId));
      flash("Пользователь удалён из базы");
      await loadAll();
    } catch (err) {
      flash(err.response?.data?.message || "Нет прав на удаление");
    }
  };
  const toggleBan = async (user) => { try { user.isBanned ? await unbanUser(user._id) : await banUser(user._id); flash(user.isBanned ? "Пользователь разбанен" : "Пользователь забанен"); loadAll(); } catch (err) { flash(err.response?.data?.message || "Нет прав на бан"); } };
  const setRole = async (user, role) => { try { await changeUserRole(user._id, role); flash(`Роль изменена на ${role}`); loadAll(); } catch (err) { flash(err.response?.data?.message || "Нет прав менять роль"); } };
  const setBookingStatus = async (id, status) => { await updateBookingStatus(id, status); flash("Статус заявки обновлён"); loadAll(); };
  const removeBooking = async (id) => { if (!confirm("Удалить заявку?")) return; await deleteBooking(id); flash("Заявка удалена"); loadAll(); };

  return <div className="container admin"><div className="admin-top"><div><h1>Админ-панель</h1><p className="muted">Manager работает с заявками. Admin управляет заявками, каталогом и пользователями. SuperAdmin управляет всеми ролями кроме назначения нового SuperAdmin.</p></div><div className="actions"><Link className="btn btn-soft" to="/">На главную</Link><span className="pill">{currentUser?.role}</span></div></div>{message && <div className="alert alert-ok">{message}</div>}<div className="tabs">{canManageCatalog && <><button className={`btn ${tab==="tours"?"btn-primary":"btn-ghost"}`} onClick={()=>setTab("tours")}>Туры</button><button className={`btn ${tab==="cruises"?"btn-primary":"btn-ghost"}`} onClick={()=>setTab("cruises")}>Круизы</button></>}<button className={`btn ${tab==="bookings"?"btn-primary":"btn-ghost"}`} onClick={()=>setTab("bookings")}>Заявки</button>{canManageUsers && <button className={`btn ${tab==="users"?"btn-primary":"btn-ghost"}`} onClick={()=>setTab("users")}>Пользователи</button>}</div>

    {tab === "tours" && canManageCatalog && <><section className="panel"><h2>{editingTourId ? "Редактировать тур" : "Добавить тур"}</h2><form className="form-grid" onSubmit={saveTour}><input className="input" name="title" placeholder="Название" value={tourForm.title} onChange={changeTour} required/><input className="input" name="location" placeholder="Локация" value={tourForm.location} onChange={changeTour} required/><input className="input" name="country" placeholder="Страна" value={tourForm.country} onChange={changeTour}/><select className="input" name="type" value={tourForm.type} onChange={changeTour}><option value="package">Пакет</option><option value="tour">Тур</option><option value="hotel">Отель</option></select><input className="input" name="price" type="number" min="0" placeholder="Цена $" value={tourForm.price} onChange={changeTour} required/><input className="input" name="duration" type="number" min="1" placeholder="Дней" value={tourForm.duration} onChange={changeTour} required/><input className="input" name="stars" type="number" min="1" max="5" placeholder="Звёзды" value={tourForm.stars} onChange={changeTour}/><input className="input" name="maxPeople" type="number" min="1" placeholder="Макс. людей" value={tourForm.maxPeople} onChange={changeTour}/><input className="input" name="tags" placeholder="Теги через запятую" value={tourForm.tags} onChange={changeTour}/><input className="input" name="image" placeholder="URL картинки" value={tourForm.image} onChange={changeTour}/><label className="check"><input type="checkbox" name="lowPrice" checked={!!tourForm.lowPrice} onChange={changeTour}/> Low Price</label><input className="input" name="discountPercent" type="number" min="0" max="90" placeholder="Скидка %" value={tourForm.discountPercent} onChange={changeTour}/><textarea className="input wide" name="description" placeholder="Описание" value={tourForm.description} onChange={changeTour} required/><div className="actions wide"><button className="btn btn-primary">{editingTourId ? "Сохранить" : "Добавить"}</button>{editingTourId && <button className="btn btn-soft" type="button" onClick={clearTour}>Отмена</button>}</div></form></section><ProductList title="Туры" items={visibleTours} search={search} setSearch={setSearch} onEdit={editTour} onRemove={removeTour}/></>}

    {tab === "cruises" && canManageCatalog && <><section className="panel"><h2>{editingCruiseId ? "Редактировать круиз" : "Добавить круиз"}</h2><form className="form-grid" onSubmit={saveCruise}><input className="input" name="title" placeholder="Название круиза" value={cruiseForm.title} onChange={changeCruise} required/><input className="input" name="route" placeholder="Маршрут" value={cruiseForm.route} onChange={changeCruise} required/><input className="input" name="ports" placeholder="Порты через запятую" value={cruiseForm.ports} onChange={changeCruise}/><input className="input" name="liner" placeholder="Лайнер" value={cruiseForm.liner} onChange={changeCruise} required/><input className="input" name="cabin" placeholder="Каюта" value={cruiseForm.cabin} onChange={changeCruise}/><input className="input" name="country" placeholder="Страна старта" value={cruiseForm.country} onChange={changeCruise}/><input className="input" name="price" type="number" min="0" placeholder="Цена $" value={cruiseForm.price} onChange={changeCruise} required/><input className="input" name="duration" type="number" min="1" placeholder="Дней" value={cruiseForm.duration} onChange={changeCruise} required/><input className="input" name="departureDate" type="date" value={cruiseForm.departureDate} onChange={changeCruise}/><input className="input" name="stars" type="number" min="1" max="5" placeholder="Звёзды" value={cruiseForm.stars} onChange={changeCruise}/><input className="input" name="tags" placeholder="Теги через запятую" value={cruiseForm.tags} onChange={changeCruise}/><input className="input" name="image" placeholder="URL картинки" value={cruiseForm.image} onChange={changeCruise}/><label className="check"><input type="checkbox" name="lowPrice" checked={!!cruiseForm.lowPrice} onChange={changeCruise}/> Low Price</label><input className="input" name="discountPercent" type="number" min="0" max="90" placeholder="Скидка %" value={cruiseForm.discountPercent} onChange={changeCruise}/><textarea className="input wide" name="description" placeholder="Описание" value={cruiseForm.description} onChange={changeCruise} required/><div className="actions wide"><button className="btn btn-primary">{editingCruiseId ? "Сохранить" : "Добавить"}</button>{editingCruiseId && <button className="btn btn-soft" type="button" onClick={clearCruise}>Отмена</button>}</div></form></section><ProductList title="Круизы" items={visibleCruises} search={search} setSearch={setSearch} onEdit={editCruise} onRemove={removeCruise} cruise/></>}

    {tab === "bookings" && <section className="panel"><div className="section-head"><h2>Заявки</h2><span className="pill">{bookings.length}</span></div><div className="table-wrap"><table className="table"><thead><tr><th>Продукт</th><th>Клиент</th><th>Дата</th><th>Гости</th><th>Цена</th><th>Статус</th><th>Действия</th></tr></thead><tbody>{bookings.map(b => <tr key={b._id}><td>{b.tour?.title || b.cruise?.title || "—"}</td><td>{b.name}<br/><span className="muted">{b.phone}</span></td><td>{b.date ? new Date(b.date).toLocaleDateString() : "—"}</td><td>{b.people}</td><td>${b.totalPrice || 0}</td><td><span className="pill">{b.status}</span></td><td><div className="actions"><button className="btn btn-soft mini" onClick={()=>setBookingStatus(b._id,"new")}>Новая</button><button className="btn btn-purple mini" onClick={()=>setBookingStatus(b._id,"in_work")}>В работе</button><button className="btn btn-green mini" onClick={()=>setBookingStatus(b._id,"confirmed")}>Принять</button><button className="btn btn-red mini" onClick={()=>setBookingStatus(b._id,"cancelled")}>Отклонить</button>{!isManager && <button className="btn btn-dark mini" onClick={()=>removeBooking(b._id)}>Удалить</button>}</div></td></tr>)}{bookings.length === 0 && <tr><td colSpan="7">Заявок пока нет.</td></tr>}</tbody></table></div></section>}

    {tab === "users" && canManageUsers && <section className="panel"><div className="section-head"><h2>Пользователи</h2><span className="pill">{users.length}</span></div><div className="table-wrap"><table className="table"><thead><tr><th>Имя</th><th>Email</th><th>Роль</th><th>Статус</th><th>Действия</th></tr></thead><tbody>{users.map(user => <tr key={user._id}><td>{user.username}</td><td>{user.email}</td><td><b>{user.role}</b></td><td>{user.isBanned ? <span className="pill danger">Забанен</span> : <span className="pill success">Активен</span>}</td><td><UserActions currentUser={currentUser} user={user} onBan={toggleBan} onDelete={removeUser} onRole={setRole}/></td></tr>)}</tbody></table></div></section>}
  </div>;
}

function UserActions({ currentUser, user, onBan, onDelete, onRole }) {
  const self = currentUser?.id === user._id || currentUser?._id === user._id;
  const isSuper = currentUser?.role === "superadmin";
  const isAdmin = currentUser?.role === "admin";
  const canManage = !self && (isSuper || (isAdmin && ["user", "manager"].includes(user.role)));
  if (user.role === "superadmin") return <span>👑 Super Admin</span>;
  if (!canManage) return <span className="muted">Нет прав</span>;
  return <div className="actions role-actions">
    {user.role === "user" && <button className="btn btn-soft mini" onClick={()=>onRole(user, "manager")}>Повысить до Manager</button>}
    {user.role === "manager" && <button className="btn btn-soft mini" onClick={()=>onRole(user, "user")}>Понизить до User</button>}
    {isSuper && user.role === "manager" && <button className="btn btn-soft mini" onClick={()=>onRole(user, "admin")}>Повысить до Admin</button>}
    {isSuper && user.role === "admin" && <button className="btn btn-soft mini" onClick={()=>onRole(user, "manager")}>Понизить до Manager</button>}
    <button className={`btn ${user.isBanned ? "btn-green" : "btn-purple"} mini`} onClick={()=>onBan(user)}>{user.isBanned ? "Разбанить" : "Забанить"}</button>
    <button className="btn btn-red mini" onClick={()=>onDelete(user._id)}>Удалить</button>
  </div>;
}

function ProductList({ title, items, search, setSearch, onEdit, onRemove, cruise }) {
  return <section className="panel"><div className="section-head"><h2>{title}</h2><input className="input" style={{maxWidth:320}} placeholder="Поиск" value={search} onChange={(e)=>setSearch(e.target.value)}/></div><div className="grid">{items.map(t => <div className="card" key={t._id}><img className="tour-img" src={t.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"} alt={t.title}/><div className="card-body"><h3>{t.title}</h3><p className="muted">{cruise ? t.route : t.location}</p><div className="meta"><span className="pill">${t.price}</span><span className="pill">{t.duration} дней</span><span className="pill">★ {t.stars || 4}</span>{t.lowPrice && <span className="pill">Low Price</span>}</div><div className="actions"><button className="btn btn-soft mini" onClick={()=>onEdit(t)}>Редактировать</button><button className="btn btn-red mini" onClick={()=>onRemove(t._id)}>Удалить</button></div></div></div>)}{items.length === 0 && <p>Пока пусто.</p>}</div></section>;
}
