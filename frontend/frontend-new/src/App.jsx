import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import AdminRoute from "./components/AdminRoute";
import { addTourComment, createBooking, getCruise, getCruises, getTour, getTours, likeTour } from "./api";

const heroImage = "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1400&q=85";
const fallbackImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

const demoTours = [
  { _id: "demo-dubai", title: "Dubai Comfort Escape", location: "ОАЭ, Дубай", country: "ОАЭ", duration: 6, price: 690, maxPeople: 8, type: "package", stars: 4, lowPrice: true, discountPercent: 35, tags: ["Хит", "Горящий"], description: "Перелёт, отель 4★, трансфер, страховка и подбор экскурсий.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85" },
  { _id: "demo-turkey", title: "Antalya All Inclusive", location: "Турция, Анталия", country: "Турция", duration: 7, price: 520, maxPeople: 12, type: "package", stars: 5, lowPrice: true, discountPercent: 35, tags: ["Семейный", "All inclusive"], description: "Готовый семейный тур: перелёт, отель у моря, трансфер, страховка и поддержка менеджера.", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=85" },
  { _id: "demo-bali", title: "Bali Honeymoon", location: "Индонезия, Бали", country: "Индонезия", duration: 10, price: 1190, maxPeople: 4, type: "package", stars: 5, tags: ["Премиум"], description: "Вилла, перелёт, трансфер и романтичная программа под ключ.", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85" }
];
const demoCruises = [
  { _id: "demo-cruise-med", title: "Mediterranean Cruise", route: "Италия → Греция → Турция", country: "Италия", duration: 9, price: 890, liner: "MSC Grandiosa", cabin: "Balcony", ports: ["Рим", "Санторини", "Кушадасы"], stars: 5, maxPeople: 20, lowPrice: false, tags: ["Премиум", "Маршрут"], description: "Круизный лайнер, каюта, питание на борту, порты Средиземного моря и помощь с документами.", image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=85" },
  { _id: "demo-cruise-dubai", title: "Gulf Cruise", route: "Дубай → Абу-Даби → Доха", country: "ОАЭ", duration: 6, price: 760, liner: "Costa Toscana", cabin: "Ocean View", ports: ["Дубай", "Абу-Даби", "Доха"], stars: 5, maxPeople: 18, lowPrice: true, discountPercent: 35, tags: ["Горящий"], description: "Короткий люкс-круиз по Персидскому заливу с питанием на борту.", image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=85" }
];

function Nav() {
  const navigate = useNavigate();
  const user = getUser();
  const isLoggedIn = !!localStorage.getItem("token");
  const staff = ["manager", "admin", "superadmin"].includes(user?.role);
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); };
  return <header className="nav"><div className="container nav-inner"><Link className="brand" to="/"><span>Travel</span> Pro</Link><nav className="nav-actions"><a href="/#packages" className="nav-link">Пакеты</a><a href="/#cruises" className="nav-link">Круизы</a><a href="/#deals" className="nav-link">Low Price</a><Link to="/privacy" className="nav-link">Политика</Link>{isLoggedIn && <Link to="/profile" className="nav-link">Профиль</Link>}{staff && <Link to="/admin" className="btn btn-soft">Панель</Link>}{!isLoggedIn ? <><Link to="/login" className="nav-link">Войти</Link><Link to="/register" className="btn btn-primary">Регистрация</Link></> : <button className="btn btn-dark" onClick={logout}>Выйти</button>}</nav></div></header>;
}

function BookingModal({ product, productType, onClose }) {
  const user = getUser();
  const isLoggedIn = !!localStorage.getItem("token");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: user?.username || "", phone: "", date: "", adults: 1, children: 0, comment: "" });
  const [message, setMessage] = useState("");
  const guests = Number(form.adults || 1) + Number(form.children || 0);
  const discount = product.lowPrice ? Number(product.discountPercent || 35) : 0;
  const totalPrice = Math.round(Number(product.price || 0) * guests * (1 - discount / 100));
  const isDemo = String(product._id).startsWith("demo-");
  if (!isLoggedIn) {
    return <div className="modal-bg" onClick={onClose}><div className="modal" onClick={(e)=>e.stopPropagation()}><span className="eyebrow">Требуется аккаунт</span><h2>Войдите, чтобы забронировать</h2><p className="muted">Бронирование туров и круизов доступно только зарегистрированным клиентам. Так менеджер увидит вашу заявку в системе.</p><div className="actions"><button className="btn btn-ghost" type="button" onClick={onClose}>Закрыть</button><Link className="btn btn-primary" to="/login">Войти</Link><Link className="btn btn-green" to="/register">Регистрация</Link></div></div></div>;
  }
  const submit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { setMessage("Чтобы забронировать тур или круиз, сначала войдите в аккаунт или зарегистрируйтесь."); return; }
    if (isDemo) { setMessage("Демо-заявка готова. Для настоящей заявки добавьте продукт через админ-панель."); return; }
    try {
      await createBooking({ name: form.name, phone: form.phone, date: form.date, guests: { adults: Number(form.adults), children: Number(form.children) }, people: guests, totalPrice, comment: form.comment, productType, tourId: productType === "tour" ? product._id : undefined, cruiseId: productType === "cruise" ? product._id : undefined });
      setMessage("Заявка отправлена менеджеру Travel Pro.");
    } catch (err) { setMessage(err.response?.data?.message || "Не получилось отправить заявку"); }
  };
  return <div className="modal-bg" onClick={onClose}><div className="modal" onClick={(e)=>e.stopPropagation()}><span className="eyebrow">Бронирование · шаг {step}/3</span><h2>{product.title}</h2>{message && <div className="alert alert-ok">{message}</div>}<form className="form" onSubmit={submit}>{step===1 && <><input className="input" type="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} required/><textarea className="input" placeholder="Комментарий: даты, бюджет, пожелания" value={form.comment} onChange={(e)=>setForm({...form,comment:e.target.value})}/></>}{step===2 && <><input className="input" placeholder="Ваше имя" required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/><input className="input" placeholder="Телефон / WhatsApp" required value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/><div className="form-grid"><input className="input" type="number" min="1" placeholder="Взрослые" value={form.adults} onChange={(e)=>setForm({...form,adults:e.target.value})}/><input className="input" type="number" min="0" placeholder="Дети" value={form.children} onChange={(e)=>setForm({...form,children:e.target.value})}/></div></>}{step===3 && <div className="price-box"><b>${totalPrice}</b><span>{guests} гостей × ${product.price}{discount ? ` − ${discount}%` : ""}</span><p>Менеджер подтвердит наличие мест и финальную цену.</p></div>}<div className="actions"><button className="btn btn-ghost" type="button" onClick={()=> step > 1 ? setStep(step - 1) : onClose()}>{step > 1 ? "Назад" : "Закрыть"}</button>{step < 3 ? <button className="btn btn-primary" type="button" onClick={()=>setStep(step+1)}>Дальше</button> : <button className="btn btn-primary">Отправить заявку</button>}</div></form></div></div>;
}

function FilterBar({ filters, setFilters, countries }) {
  const change = (key, value) => setFilters({ ...filters, [key]: value });
  return <div className="filter-bar"><input className="input" placeholder="Поиск: страна, тур, круиз" value={filters.query} onChange={(e)=>change("query", e.target.value)}/><select className="input" value={filters.country} onChange={(e)=>change("country", e.target.value)}><option value="">Все страны</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select><input className="input" type="number" placeholder="Цена до $" value={filters.maxPrice} onChange={(e)=>change("maxPrice", e.target.value)}/><input className="input" type="number" placeholder="Дней до" value={filters.maxDays} onChange={(e)=>change("maxDays", e.target.value)}/><select className="input" value={filters.stars} onChange={(e)=>change("stars", e.target.value)}><option value="">Любые ★</option><option value="5">5★</option><option value="4">4★+</option><option value="3">3★+</option></select></div>;
}

function ProductCard({ item, type, onBook }) {
  const isCruise = type === "cruise";
  const location = isCruise ? item.route : item.location;
  return <article className="travel-card"><div className="image-wrap"><img src={item.image || fallbackImage} alt={item.title}/>{item.lowPrice && <span className="deal-tag">-{item.discountPercent || 35}% · 48ч</span>}<span className="type-tag">{isCruise ? "Круиз" : "Тур"}</span></div><div className="card-body"><div className="card-top"><h3>{item.title}</h3><b>${item.price}</b></div><p className="muted clamp">{item.description}</p><div className="badges"><span>★ {item.stars || 4}</span>{(item.tags || []).slice(0,3).map(tag => <span key={tag}>{tag}</span>)}</div><div className="meta"><span>📍 {location}</span><span>🗓 {item.duration} дней</span>{isCruise ? <span>🚢 {item.liner}</span> : <span>🛡 страховка</span>}</div>{isCruise && <div className="included"><span>Каюта: {item.cabin}</span><span>Порты: {(item.ports || []).join(", ") || "по маршруту"}</span></div>}<div className="included"><span>✈ Перелёт</span><span>🏨 Отель/каюта</span><span>🚘 Трансфер</span><span>📞 24/7</span></div><div className="actions"><Link className="btn btn-ghost" to={String(item._id).startsWith("demo-") ? "/" : isCruise ? `/cruises/${item._id}` : `/tours/${item._id}`}>Подробнее</Link><button className="btn btn-primary" onClick={()=>onBook(item, type)}>Забронировать</button></div></div></article>;
}

function LowPriceSection({ items, onBook }) {
  const deals = items.filter(i => i.lowPrice).slice(0, 3);
  return <section id="deals" className="section"><div className="container deals"><div><span className="eyebrow">Low Price Days</span><h2>Горящие предложения на 48 часов</h2><p className="muted">Скидка до 35% выделяется таймером и бейджем на карточках.</p><div className="timer"><b>47:59:12</b><span>до обновления цен</span></div></div><div className="deal-list">{deals.map(item => <div key={item._id}><span>{item.title}</span><b>${Math.round(item.price * (1 - (item.discountPercent || 35) / 100))}</b><button className="btn btn-light mini" onClick={()=>onBook(item, item.liner ? "cruise" : "tour")}>Заявка</button></div>)}</div></div></section>;
}

function TrustBlock() {
  const items = ["Официальный договор", "Проверенные отели", "Поддержка 24/7", "Страховка включена", "Прозрачная цена", "Отзывы клиентов"];
  return <section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Доверие</span><h2>Почему клиенты выбирают Travel Pro</h2></div></div><div className="trust-grid">{items.map((x,i)=><div key={x} className="trust-card"><b>0{i+1}</b><h3>{x}</h3><p>Коротко объясняем ценность, чтобы клиенту было легче оставить заявку.</p></div>)}</div></div></section>;
}
function ReviewsSection(){return <section className="section reviews"><div className="container"><div className="section-head"><div><span className="eyebrow">Отзывы</span><h2>Рейтинг клиентов ★★★★★</h2></div><p className="muted">Социальное доказательство для повышения конверсии.</p></div><div className="grid">{["Айжан", "Мария", "Нурбек"].map((n,i)=><div className="review-card" key={n}><b>★★★★★</b><p>{i===0 ? "Подобрали тур в Дубай под бюджет, всё было под ключ." : i===1 ? "Круиз выглядел премиально, менеджер помог с деталями." : "Удобная заявка, быстро ответили в WhatsApp."}</p><span>{n}</span></div>)}</div></div></section>}

function Home() {
  const navigate = useNavigate();
  const [apiTours, setApiTours] = useState([]), [apiCruises, setApiCruises] = useState([]), [loading, setLoading] = useState(true), [filters, setFilters] = useState({ query: "", country: "", maxPrice: "", maxDays: "", stars: "" }), [booking, setBooking] = useState(null);
  useEffect(() => { Promise.allSettled([getTours(), getCruises()]).then(([t,c]) => { if (t.status === "fulfilled") setApiTours(t.value.data || []); if (c.status === "fulfilled") setApiCruises(c.value.data || []); }).finally(()=>setLoading(false)); }, []);
  const tours = apiTours.length ? apiTours : demoTours;
  const cruises = apiCruises.length ? apiCruises : demoCruises;
  const all = [...tours.map(i => ({...i, _kind: "tour"})), ...cruises.map(i => ({...i, _kind: "cruise"}))];
  const countries = [...new Set(all.map(i => i.country).filter(Boolean))];
  const filtered = useMemo(() => all.filter(i => {
    const hay = `${i.title} ${i.location || ""} ${i.route || ""} ${i.description} ${i.country || ""}`.toLowerCase();
    return (!filters.query || hay.includes(filters.query.toLowerCase())) && (!filters.country || i.country === filters.country) && (!filters.maxPrice || Number(i.price) <= Number(filters.maxPrice)) && (!filters.maxDays || Number(i.duration) <= Number(filters.maxDays)) && (!filters.stars || Number(i.stars || 0) >= Number(filters.stars));
  }), [all, filters]);
  const openBooking = (product, type) => {
    if (!localStorage.getItem("token")) { navigate("/login", { state: { message: "Для бронирования сначала войдите или зарегистрируйтесь." } }); return; }
    setBooking({ product, type });
  };
  return <div className="page"><Nav/><main><section className="hero"><div className="container hero-grid"><div><span className="eyebrow">Travel Pro · зарубежные туры и круизы</span><h1>Путешествия под ключ без стресса</h1><p>Перелёт + отель + трансфер + страховка + поддержка менеджера. Вы выбираете направление — мы собираем полный пакет.</p><div className="under-key"><span>✈ перелёт</span><span>🏨 отель</span><span>🚘 трансфер</span><span>🛡 страховка</span><span>📞 24/7</span></div></div><div className="hero-visual"><img src={heroImage} alt="Cruise ship"/><div className="floating-card top"><b>4 в 1</b><span>Flight + Hotel + Transfer + Insurance</span></div><div className="floating-card bottom"><b>до -35%</b><span>Low Price Days</span></div></div></div></section><section className="container promise"><div><span className="eyebrow">Фильтры</span><h2>Быстрый подбор по стране, цене, дням и звёздам</h2></div><FilterBar filters={filters} setFilters={setFilters} countries={countries}/></section><section id="packages" className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Каталог</span><h2>Туры и круизы</h2></div><p className="muted">{loading ? "Загрузка..." : `${filtered.length} предложений найдено`}</p></div><div className="grid">{filtered.map(item => <ProductCard key={`${item._kind}-${item._id}`} item={item} type={item._kind} onBook={openBooking}/>)}</div>{filtered.length===0 && <div className="panel">По этому фильтру ничего не найдено.</div>}</div></section><section id="cruises" className="section cruise-section"><div className="container split"><div><span className="eyebrow">Cruise collection</span><h2>Круизные лайнеры как отдельный премиум-раздел</h2><p>Маршрут, лайнер, каюта, порты и питание на борту показываются отдельно от обычных туров.</p></div><div className="route-card"><span>{cruises[0]?.liner || "Cruise liner"}</span><h3>{cruises[0]?.route || "Italy → Greece → Turkey"}</h3><p>Каюта: {cruises[0]?.cabin || "Balcony"}</p><b>от ${cruises[0]?.price || 890}</b></div></div></section><LowPriceSection items={all} onBook={openBooking}/><TrustBlock/><ReviewsSection/></main><Footer/>{booking && <BookingModal product={booking.product} productType={booking.type} onClose={()=>setBooking(null)}/>}</div>;
}

function TourDetails({ type = "tour" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null), [comment, setComment] = useState({ name: "", text: "" }), [booking, setBooking] = useState(null);
  useEffect(() => { (type === "cruise" ? getCruise(id) : getTour(id)).then(({data})=>setItem(data)); }, [id, type]);
  if (!item) return <><Nav/><div className="container section">Загрузка...</div></>;
  const sendComment = async (e) => { e.preventDefault(); if (type !== "tour") return; const {data} = await addTourComment(id, comment); setItem(data); setComment({name:"", text:""}); };
  return <div className="page"><Nav/><main className="container section"><div className="details"><img className="details-img" src={item.image || fallbackImage} alt={item.title}/><div><span className="eyebrow">{type === "cruise" ? "Круиз" : "Тур"}</span><h1>{item.title}</h1><p className="big">{item.description}</p><div className="meta dark large"><span>${item.price}</span><span>{item.duration} дней</span><span>★ {item.stars || 4}</span>{type === "cruise" && <span>{item.liner}</span>}</div><button className="btn btn-primary" onClick={()=> localStorage.getItem("token") ? setBooking(item) : navigate("/login", { state: { message: "Для бронирования сначала войдите или зарегистрируйтесь." } })}>Забронировать</button>{type === "tour" && <button className="btn btn-ghost" onClick={()=>likeTour(id).then(({data})=>setItem(data))}>❤ {item.likes || 0}</button>}</div></div>{type === "tour" && <section className="panel"><h2>Комментарии</h2><form className="form" onSubmit={sendComment}><input className="input" placeholder="Имя" value={comment.name} onChange={(e)=>setComment({...comment,name:e.target.value})}/><textarea className="input" placeholder="Комментарий" value={comment.text} onChange={(e)=>setComment({...comment,text:e.target.value})}/><button className="btn btn-primary">Добавить</button></form><div className="comments">{(item.comments || []).map(c => <div className="comment" key={c._id}><b>{c.name}</b><p>{c.text}</p></div>)}</div></section>}</main><Footer/>{booking && <BookingModal product={booking} productType={type} onClose={()=>setBooking(null)}/>}</div>;
}
function Profile(){const user=getUser();return <div className="page"><Nav/><main className="container section"><div className="profile-card"><span className="eyebrow">Профиль</span><h1>{user?.username || "Гость"}</h1><p>{user?.email}</p><span className="pill">{user?.role || "user"}</span></div></main></div>}
function Footer(){return <footer className="footer"><div className="container footer-inner"><b>Travel Pro</b><span>✈ + 🏨 + 🚘 + 🛡 + 📞</span><span><Link to="/privacy">Политика конфиденциальности</Link> · <Link to="/terms">Пользовательское соглашение</Link></span></div></footer>}

function LegalPage({ type }) {
  const isPrivacy = type === "privacy";
  return <div className="page"><Nav/><main className="container section"><article className="legal-card"><span className="eyebrow">Travel Pro x Gazan 67 Edition</span><h1>{isPrivacy ? "Политика Шизо-Конфиденциальности" : "Пользовательское Несоглашение"}</h1><p className="muted">Внимание: Этот текст одобрен Газаном 67 и лично проверен на наличие вирусов, включая Хантавирус. Читать на свой страх и риск.</p>{isPrivacy ? <><h2>1. Какие данные мы крадем (ой, собираем)</h2><p>При клике на кнопку «Забронировать» мы автоматически узнаем ваш любимый мем, марку микроволновки и точные координаты вашего холодильника в 3 часа ночи. Если вы не ввели телефон, Газан 67 лично приедет и спросит его.</p><h2>2. Зачем нам ваши данные?</h2><p>Данные используются исключительно для генерации угарных мемов в админ-панели и отправки вам пуш-уведомлений с текстом «А ТЫ КУПИЛ ТУР?». Также мы передаем ваши куки фиксикам, чтобы они чинили наш бэкенд.</p><h2>3. Передача данных третьим лицам</h2><p>Мы официально клянемся не продавать ваши данные никому, кроме секретных агентов с острова Эпштейна и торговцев шаурмой у вашего дома. Если к вам прилетит вертолет — это просто плановый трансфер.</p><h2>4. Защита от Хантавируса и хакеров</h2><p>Наш сервер защищен подорожником, иконой 4K и встроенным антивирусом, который блокирует Хантавирус на подлете. Пароли шифруются методом «мамой клянусь, никто не узнает».</p><h2>5. Ваши права (которых нет)</h2><p>Вы имеете полное право потребовать удаление данных. В ответ мы пришлем вам гифку с танцующим хомяком. Писать лично Газану на 67-й километр МКАДа.</p></> : <><h2>1. Общие шизо-условия</h2><p>Регистрируясь на сайте, вы автоматически соглашаетесь стать спонсором мемов. Если вы не понимаете шуток, скрипт автоматически банит ваш IP-адрес и отправляет вам посылку с кирпичом.</p><h2>2. Бронирование и Остров Эпштейна</h2><p>Внимание: Наша компания НЕ организует туры на остров Эпштейна, даже если вы очень просите в комментариях к заказу. Все заявки туда перенаправляются прямиком в ФСБ/ФБР. Менеджер свяжется с вами, только если вы скинете свежий мем.</p><h2>3. Чипирование через трансфер</h2><p>В стоимость каждого пакета включен бесплатный Хантавирус (шутка) и обязательный тест на знание мемов 2016-2026 годов. Водитель трансфера имеет право не везти вас, если у вас плохой музыкальный вкус.</p><h2>4. Роли на сервере</h2><p>Manager — разгребает ваши рофло-заявки. Admin — банит за плоские шутки. SuperAdmin — это сам Газан 67, он просто смотрит, чтобы сайт не упал, пока он кушает хинкали.</p><h2>5. Изменение условий в одностороннем порядке</h2><p>Администрация Travel Pro может поменять этот текст посреди ночи на рецепт крабсбургера. Вы обязаны проверять эту страницу каждые 15 минут под песню «Crazy Frog».</p></>}<div className="actions"><Link className="btn btn-primary" to="/register">Я согласен на этот бред</Link><Link className="btn btn-ghost" to="/">Уйти на базу (Домой)</Link></div></article></main><Footer/></div>;
}

export default function App(){return <BrowserRouter><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/privacy" element={<LegalPage type="privacy"/>}/><Route path="/terms" element={<LegalPage type="terms"/>}/><Route path="/profile" element={<Profile/>}/><Route path="/tours/:id" element={<TourDetails type="tour"/>}/><Route path="/cruises/:id" element={<TourDetails type="cruise"/>}/><Route path="/admin" element={<AdminRoute><AdminPanel/></AdminRoute>}/></Routes></BrowserRouter>}
