import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, CircleHelp, MoreHorizontal, ChevronLeft, ChevronRight, House, UserRound, Settings, CircleDot, Database, ArrowLeft, X } from 'lucide-react';
import './styles.css';
import { HandoverPage, initialRoles } from './HandoverPage';
import { initialDocuments } from './handoverDocuments';

type Category = 'work' | 'personal' | 'shared';
type CalendarEvent = { id: number; day: number; time: string; title: string; category: Category; tone: string };
type ActivityRecord = { description: string; reflection: string };
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
  { key: 'work', label: '仕事', tone: 'purple' }, { key: 'personal', label: '個人', tone: 'teal' }, { key: 'shared', label: 'チーム共有', tone: 'orange' },
];
const menuItems = [
  { label: 'ホーム', icon: House }, { label: '引き継ぎ', icon: UserRound },
  { label: 'プロフィール設定', icon: Settings }, { label: 'サークル設定', icon: CircleDot },
  { label: '役職設定', icon: Settings, admin: true }, { label: 'データ管理', icon: Database, admin: true },
  { label: 'サークル選択に戻る', icon: ArrowLeft },
];
const circles = [
  { id: 'tennis', name: '高体連庭球部', detail: 'テニスサークル · 12人' },
  { id: 'sample', name: '新歓プロジェクト', detail: 'イベント運営 · 8人' },
];
function App() {
  const [month, setMonth] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(9);
  const [menuOpen, setMenuOpen] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [circleSelectionOpen, setCircleSelectionOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(circles[0]);
  const [roles, setRoles] = useState(initialRoles);
  const [documents, setDocuments] = useState(initialDocuments);
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState<Category[]>(['work', 'personal', 'shared']);
  const [notice, setNotice] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [eventDetail, setEventDetail] = useState<CalendarEvent | null>(null);
  const [activityRecords, setActivityRecords] = useState<Record<number, ActivityRecord>>({
    1: { description: '基礎練習を中心に取り組みました。フォームを確認しながら、繰り返し練習しました。', reflection: '次回は今日の気づきを意識して、少しずつ精度を上げていきます。' },
  });
  const [activityEditing, setActivityEditing] = useState(false);
  const [activityDraft, setActivityDraft] = useState<ActivityRecord>({ description: '', reflection: '' });
  const activityHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (eventDetail) activityHeading.current?.focus(); }, [eventDetail]);
  useEffect(() => {
    function dismiss(e: PointerEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }
    function keyboard(e: KeyboardEvent) { if (e.key === 'Escape') { setMenuOpen(false); setEventDetail(null); setHandoverOpen(false); menuButton.current?.focus(); } }
    document.addEventListener('pointerdown', dismiss); document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', keyboard); };
  }, []);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 4000); return () => clearTimeout(timer); }, [notice]);
  const year = month.getFullYear(), monthIndex = month.getMonth();
  const monthName = month.toLocaleString('ja-JP', { month: 'long' });

  const filtered = (year === 2026 && monthIndex === 0 ? events : []).filter(e => enabled.includes(e.category) && e.title.toLowerCase().includes(query.toLowerCase()));
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => i >= firstDay && i < firstDay + dayCount ? i - firstDay + 1 : null);
  function changeMonth(delta: number) { setMonth(new Date(year, monthIndex + delta, 1)); setSelectedDay(null); }
  function placeholder(label: string) { setMenuOpen(false); setNotice(`${label}は今後実装予定です。`); }
  function goHome() {
    setMonth(new Date(2026, 0, 1));
    setSelectedDay(9);
    setCircleSelectionOpen(false);
    setHandoverOpen(false);
    setEventDetail(null);
    setMenuOpen(false);
  }
  function openCircleSelection() {
    setCircleSelectionOpen(true);
    setHandoverOpen(false);
    setEventDetail(null);
    setMenuOpen(false);
  }
  function selectCircle(circle: typeof circles[number]) {
    setSelectedCircle(circle);
    goHome();
  }
  function openActivityEditor(event: CalendarEvent) {
    const record = activityRecords[event.id] ?? { description: '', reflection: '' };
    setActivityDraft(record);
    setActivityEditing(true);
  }
  function saveActivity() {
    if (!eventDetail || !activityDraft.description.trim()) {
      setNotice('活動内容を入力してください。');
      return;
    }
    setActivityRecords(previous => ({ ...previous, [eventDetail.id]: { description: activityDraft.description.trim(), reflection: activityDraft.reflection.trim() } }));
    setActivityEditing(false);
    setNotice('活動記録を保存しました。');
  }
  return <>
    <header className="header">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); goHome(); }}><span className="brand-mark">H</span><span>ホーム</span></a>
      <div className="header-actions">
        <label className="search"><Search size={17}/><input aria-label="予定を検索" placeholder="予定を検索" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <button className="help icon-button" aria-label="ヘルプ" onClick={() => setNotice('月の矢印で移動、予定をクリックして詳細を確認できます。')}><CircleHelp size={20}/></button>
        <div className="menu-anchor" ref={menuRef}>
          <button ref={menuButton} className={`menu-trigger icon-button ${menuOpen ? 'active' : ''}`} aria-label="メニュー" aria-expanded={menuOpen} aria-controls="home-menu" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={26}/></button>
          {menuOpen && <nav id="home-menu" className="menu-panel" aria-label="ホームメニュー">
            <div className="menu-heading"><span>メニュー</span><span>Akira Kimura</span></div>
            {menuItems.map(({ label, icon: Icon, admin }, i) => <button key={label} className={`menu-item ${(!circleSelectionOpen && (handoverOpen ? i === 1 : i === 0)) ? 'current' : ''}`} onClick={() => { if (i === 0) goHome(); else if (i === 1) { setMenuOpen(false); setEventDetail(null); setCircleSelectionOpen(false); setHandoverOpen(true); } else if (i === 6) openCircleSelection(); else placeholder(label); }}><span className="menu-icon"><Icon size={15}/></span><span>{label}</span>{admin && <span className="admin-badge">管理者</span>}</button>)}
          </nav>}
        </div>
      </div>
    </header>
    <main className={eventDetail || handoverOpen || circleSelectionOpen ? 'activity-main' : undefined}>
      {circleSelectionOpen ? <section className="circle-selection-page" aria-labelledby="circle-selection-title">
        <nav className="activity-breadcrumb" aria-label="パンくず"><button onClick={goHome}>‹ ホーム</button><span>/</span><span>サークル選択</span></nav>
        <h1 id="circle-selection-title">サークルを選択</h1>
        <p className="activity-subtitle">参加するサークルを選択してください</p>
        <div className="circle-selection-card">
          <p className="circle-sample-note">表示確認用のサンプルです。選択内容は再読み込みするとリセットされます。</p>
          <div className="circle-list" role="list">{circles.map(circle => <button className={`circle-option ${selectedCircle.id === circle.id ? 'selected' : ''}`} key={circle.id} onClick={() => selectCircle(circle)}><span className="circle-option-mark" aria-hidden="true">{circle.name.charAt(0)}</span><span><strong>{circle.name}</strong><small>{circle.detail}</small></span><span className="circle-option-check" aria-hidden="true">{selectedCircle.id === circle.id ? '選択中' : '選択'}</span></button>)}</div>
        </div>
      </section> : handoverOpen ? <HandoverPage documents={documents} onAddDocument={document => setDocuments(previous => [...previous, document])} roles={roles} onAddRole={role => setRoles(previous => [...previous, role])} onHome={goHome}/> : eventDetail ? <section className="activity-page" aria-labelledby="activity-title">
        <nav className="activity-breadcrumb" aria-label="パンくず"><button onClick={() => setEventDetail(null)}>‹ ホーム</button><span>/</span><span>活動記録</span></nav>
        <h1 id="activity-title" tabIndex={-1} ref={activityHeading}>活動記録</h1>
        <p className="activity-subtitle">選択した予定の内容 <span className="activity-sample-note">（再読み込みするとリセットされるサンプル記録です）</span></p>
        <article className="activity-card">
          <div className="activity-meta">
            <span className="activity-icon" aria-hidden="true">✦</span>
            <div><p className="activity-date">{year}年{monthIndex + 1}月{eventDetail.day}日</p>
              <p className="activity-weekday">{new Date(year, monthIndex, eventDetail.day).toLocaleDateString('ja-JP', { weekday: 'long' })} · {eventDetail.time}</p>
            </div>
          </div>
          <h2>{eventDetail.title}</h2>
          <hr />
          {activityEditing ? <form className="activity-form" onSubmit={e => { e.preventDefault(); saveActivity(); }}>
            <label>活動内容<textarea value={activityDraft.description} onChange={e => setActivityDraft(previous => ({ ...previous, description: e.target.value }))} placeholder="活動内容を入力してください" required /></label>
            <label>ふりかえり<textarea value={activityDraft.reflection} onChange={e => setActivityDraft(previous => ({ ...previous, reflection: e.target.value }))} placeholder="気づいたことや次回へのメモ" /></label>
            <div className="activity-form-actions"><button type="button" className="today-button" onClick={() => setActivityEditing(false)}>キャンセル</button><button type="submit" className="activity-primary-button">保存する</button></div>
          </form> : activityRecords[eventDetail.id] ? <>
            <h3>活動内容</h3><div className="activity-description"><p>{activityRecords[eventDetail.id].description}</p></div>
            <section className="activity-reflection" aria-labelledby="reflection-title"><h3 id="reflection-title">ふりかえり</h3><p>{activityRecords[eventDetail.id].reflection || 'ふりかえりはまだありません。'}</p></section>
            <button className="activity-primary-button" onClick={() => openActivityEditor(eventDetail)}>編集する</button>
          </> : <div className="activity-empty"><p>この予定の活動記録はまだありません。</p><button className="activity-primary-button" onClick={() => openActivityEditor(eventDetail)}>活動記録を作成</button></div>}
          <button className="today-button" onClick={() => setEventDetail(null)}>‹ ホームに戻る</button>
        </article>
      </section> : <>
      <div className="page-heading"><div><h1>{selectedCircle.name}</h1><p>サークルの予定を確認しましょう</p></div>
        <div className="month-controls"><button className="today-button" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDay(now.getDate()); }}>今日</button><div className="month-navigation"><button className="icon-button bordered" aria-label="前の月" onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button><h2 aria-live="polite">{year}年{monthName}</h2><button className="icon-button bordered" aria-label="次の月" onClick={() => changeMonth(1)}><ChevronRight size={20}/></button></div></div>
      </div>
      <div className="dashboard">
        <section className="calendar-card" aria-label={`${year}年${monthIndex + 1}月のカレンダー`}>
          <div className="weekdays">{['日', '月', '火', '水', '木', '金', '土'].map(day => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">{cells.map((day, i) => <div className={`day-cell ${day === null ? 'empty' : ''}`} key={i}>{day !== null && <>
            <button className={`day-number ${selectedDay === day ? 'selected' : ''}`} aria-label={`${monthIndex + 1}月${day}日`} aria-pressed={selectedDay === day} onClick={() => setSelectedDay(day)}>{day}</button>
            <div className="day-events">{filtered.filter(e => e.day === day).map(event => <button className={`event-chip tone-${event.tone}`} key={event.id} title={`${event.time} ${event.title}`} onClick={() => setEventDetail(event)}>{event.title === 'Lunch with Mina' ? 'Lunch · Mina' : event.title}</button>)}</div>
          </>}</div>)}</div>
        </section>
        <aside className="schedule-card">
          <h2>{monthName}の予定</h2><p className="schedule-subtitle">{filtered.length}件の予定 · 日時順</p>
          <div className="schedule-list">{filtered.length ? filtered.map(event => <button className="schedule-row" key={event.id} onClick={() => setEventDetail(event)}><span className={`event-dot tone-${event.tone}`}/><span><span className="event-time">{monthIndex + 1}月{event.day}日 · {event.time}</span><span className="event-title">{event.title}</span></span></button>) : <p className="empty-message">{query ? '検索に一致する予定はありません。' : 'この月の予定はありません。'}</p>}</div>
          <section className="calendar-filters"><h3>カレンダーの表示設定</h3>{categories.map(category => <label key={category.key}><span className={`category-square tone-${category.tone}`}/><span>{category.label}</span><input type="checkbox" checked={enabled.includes(category.key)} onChange={() => setEnabled(old => old.includes(category.key) ? old.filter(k => k !== category.key) : [...old, category.key])}/></label>)}</section>
          <section className="account-card"><div className="account-identity"><span className="avatar">AK</span><div><h3>Akira Kimura</h3><p>akira.k@example.com</p></div></div><div className="account-links"><button onClick={() => placeholder('アカウント管理')}>アカウント管理</button><button className="purple-link" onClick={() => placeholder('プロフィール設定')}>プロフィール設定</button></div><button className="sign-out" onClick={() => setNotice('サンプル画面のため、ログイン・ログアウトはまだ利用できません。')}>ログアウト</button></section>
        </aside>
      </div>
      </>}
    </main>
    {notice && <div className="toast" role="status">{notice}<button aria-label="通知を閉じる" onClick={() => setNotice(null)}><X size={16}/></button></div>}
  </>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
