import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, CircleHelp, MoreHorizontal, ChevronLeft, ChevronRight, House, UserRound, Settings, CircleDot, Database, ArrowLeft, X } from 'lucide-react';
import './styles.css';

type Category = 'work' | 'personal' | 'shared';
type CalendarEvent = { id: number; day: number; time: string; title: string; category: Category; tone: string };
const events: CalendarEvent[] = [
  { id: 1, day: 1, time: '11:00', title: 'Design review', category: 'work', tone: 'purple' },
  { id: 2, day: 2, time: '09:00', title: 'Project sync', category: 'personal', tone: 'teal' },
  { id: 3, day: 5, time: '10:30', title: 'Team standup', category: 'shared', tone: 'green' },
  { id: 4, day: 9, time: '09:30', title: 'Weekly team sync', category: 'personal', tone: 'teal' },
  { id: 5, day: 9, time: '13:00', title: 'Lunch with Mina', category: 'shared', tone: 'orange' },
  { id: 6, day: 13, time: '14:00', title: 'Planning', category: 'work', tone: 'pink' },
  { id: 7, day: 22, time: '10:00', title: 'Focus time', category: 'personal', tone: 'teal' },
];
const categories: { key: Category; label: string; tone: string }[] = [
  { key: 'work', label: 'Work', tone: 'purple' }, { key: 'personal', label: 'Personal', tone: 'teal' }, { key: 'shared', label: 'Shared team', tone: 'orange' },
];
const menuItems = [
  { label: 'ホーム', icon: House }, { label: '引き継ぎ', icon: UserRound },
  { label: 'プロフィール設定', icon: Settings }, { label: 'サークル設定', icon: CircleDot },
  { label: '役職設定', icon: Settings, admin: true }, { label: 'データ管理', icon: Database, admin: true },
  { label: 'サークル選択に戻る', icon: ArrowLeft },
];
function App() {
  const [month, setMonth] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(9);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState<Category[]>(['work', 'personal', 'shared']);
  const [notice, setNotice] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [eventDetail, setEventDetail] = useState<CalendarEvent | null>(null);
  const activityHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (eventDetail) activityHeading.current?.focus(); }, [eventDetail]);
  useEffect(() => {
    function dismiss(e: PointerEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }
    function keyboard(e: KeyboardEvent) { if (e.key === 'Escape') { setMenuOpen(false); setEventDetail(null); menuButton.current?.focus(); } }
    document.addEventListener('pointerdown', dismiss); document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', keyboard); };
  }, []);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 4000); return () => clearTimeout(timer); }, [notice]);
  const year = month.getFullYear(), monthIndex = month.getMonth();
  const monthName = month.toLocaleString('en-US', { month: 'long' });
  const monthShort = month.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const filtered = (year === 2026 && monthIndex === 0 ? events : []).filter(e => enabled.includes(e.category) && e.title.toLowerCase().includes(query.toLowerCase()));
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => i >= firstDay && i < firstDay + dayCount ? i - firstDay + 1 : null);
  function changeMonth(delta: number) { setMonth(new Date(year, monthIndex + delta, 1)); setSelectedDay(null); }
  function placeholder(label: string) { setMenuOpen(false); setNotice(`${label}は今後実装予定です。`); }
  return <>
    <header className="header">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); setMonth(new Date(2026, 0, 1)); setSelectedDay(9); setEventDetail(null); }}><span className="brand-mark">H</span><span>Home</span></a>
      <div className="header-actions">
        <label className="search"><Search size={17}/><input aria-label="予定を検索" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <button className="help icon-button" aria-label="ヘルプ" onClick={() => setNotice('月の矢印で移動、予定をクリックして詳細を確認できます。')}><CircleHelp size={20}/></button>
        <div className="menu-anchor" ref={menuRef}>
          <button ref={menuButton} className={`menu-trigger icon-button ${menuOpen ? 'active' : ''}`} aria-label="メニュー" aria-expanded={menuOpen} aria-controls="home-menu" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={26}/></button>
          {menuOpen && <nav id="home-menu" className="menu-panel" aria-label="ホームメニュー">
            <div className="menu-heading"><span>MENU</span><span>Akira Kimura</span></div>
            {menuItems.map(({ label, icon: Icon, admin }, i) => <button key={label} className={`menu-item ${i === 0 ? 'current' : ''}`} onClick={() => { if (i === 0) { setMenuOpen(false); setEventDetail(null); } else placeholder(label); }}><span className="menu-icon"><Icon size={15}/></span><span>{label}</span>{admin && <span className="admin-badge">管理者</span>}</button>)}
          </nav>}
        </div>
      </div>
    </header>
    <main className={eventDetail ? 'activity-main' : undefined}>
      {eventDetail ? <section className="activity-page" aria-labelledby="activity-title">
        <nav className="activity-breadcrumb" aria-label="パンくず"><button onClick={() => setEventDetail(null)}>‹ Home</button><span>/</span><span>活動記録</span></nav>
        <h1 id="activity-title" tabIndex={-1} ref={activityHeading}>活動記録</h1>
        <p className="activity-subtitle">選択した予定の内容 <span className="activity-sample-note">（表示確認用のサンプル・実際の活動記録ではありません）</span></p>
        <article className="activity-card">
          <div className="activity-meta">
            <span className="activity-icon" aria-hidden="true">✦</span>
            <div><p className="activity-date">{monthShort} {String(eventDetail.day).padStart(2, '0')} · {year}</p>
              <p className="activity-weekday">{new Date(year, monthIndex, eventDetail.day).toLocaleDateString('en-US', { weekday: 'long' })} · {eventDetail.time}</p>
            </div>
          </div>
          <h2>{eventDetail.title}</h2>
          <hr />
          <h3>活動内容</h3>
          <div className="activity-description"><p>基礎練習を中心に取り組みました。フォームを確認しながら、繰り返し練習しました。</p><p>次回は今日の気づきを意識して、少しずつ精度を上げていきます。</p></div>
          <section className="activity-reflection" aria-labelledby="reflection-title">
            <h3 id="reflection-title">ふりかえり</h3>
            <p>できたこと、気づいたことを記録しておきましょう。</p>
          </section>
          <button className="today-button" onClick={() => setEventDetail(null)}>‹ ホームに戻る</button>
        </article>
      </section> : <>
      <div className="page-heading"><div><h1>高体連庭球部</h1><p>Your schedule at a glance</p></div>
        <div className="month-controls"><button className="today-button" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDay(now.getDate()); }}>Today</button><div className="month-navigation"><button className="icon-button bordered" aria-label="前の月" onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button><h2 aria-live="polite">{monthName} {year}</h2><button className="icon-button bordered" aria-label="次の月" onClick={() => changeMonth(1)}><ChevronRight size={20}/></button></div></div>
      </div>
      <div className="dashboard">
        <section className="calendar-card" aria-label={`${year}年${monthIndex + 1}月のカレンダー`}>
          <div className="weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">{cells.map((day, i) => <div className={`day-cell ${day === null ? 'empty' : ''}`} key={i}>{day !== null && <>
            <button className={`day-number ${selectedDay === day ? 'selected' : ''}`} aria-label={`${monthIndex + 1}月${day}日`} aria-pressed={selectedDay === day} onClick={() => setSelectedDay(day)}>{day}</button>
            <div className="day-events">{filtered.filter(e => e.day === day).map(event => <button className={`event-chip tone-${event.tone}`} key={event.id} title={`${event.time} ${event.title}`} onClick={() => setEventDetail(event)}>{event.title === 'Lunch with Mina' ? 'Lunch · Mina' : event.title}</button>)}</div>
          </>}</div>)}</div>
        </section>
        <aside className="schedule-card">
          <h2>{monthName} schedule</h2><p className="schedule-subtitle">{filtered.length} events · chronological</p>
          <div className="schedule-list">{filtered.length ? filtered.map(event => <button className="schedule-row" key={event.id} onClick={() => setEventDetail(event)}><span className={`event-dot tone-${event.tone}`}/><span><span className="event-time">{monthShort} {String(event.day).padStart(2, '0')} · {event.time}</span><span className="event-title">{event.title}</span></span></button>) : <p className="empty-message">{query ? '検索に一致する予定はありません。' : 'この月の予定はありません。'}</p>}</div>
          <section className="calendar-filters"><h3>My calendars</h3>{categories.map(category => <label key={category.key}><span className={`category-square tone-${category.tone}`}/><span>{category.label}</span><input type="checkbox" checked={enabled.includes(category.key)} onChange={() => setEnabled(old => old.includes(category.key) ? old.filter(k => k !== category.key) : [...old, category.key])}/></label>)}</section>
          <section className="account-card"><div className="account-identity"><span className="avatar">AK</span><div><h3>Akira Kimura</h3><p>akira.k@example.com</p></div></div><div className="account-links"><button onClick={() => placeholder('アカウント管理')}>Manage account</button><button className="purple-link" onClick={() => placeholder('プロフィール設定')}>Edit profile</button></div><button className="sign-out" onClick={() => setNotice('サンプル画面のため、ログイン・ログアウトはまだ利用できません。')}>Sign out</button></section>
        </aside>
      </div>
      </>}
    </main>
    {notice && <div className="toast" role="status">{notice}<button aria-label="通知を閉じる" onClick={() => setNotice(null)}><X size={16}/></button></div>}
  </>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
