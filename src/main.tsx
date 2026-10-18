import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, CircleHelp, MoreHorizontal, ChevronLeft, ChevronRight, House, UserRound, Settings, CircleDot, Database, ArrowLeft, X, WalletCards } from 'lucide-react';
import './styles.css';
import './profile-image.css';
import { HandoverPage, initialRoles } from './HandoverPage';
import { initialDocuments } from './handoverDocuments';
import { LoginPage } from './LoginPage';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { ProfileContext, currentUserId, RecordAttributionView, type RecordAttribution } from './RecordAttribution';
import { supabase, supabaseConfigurationError } from './supabase';
import { LegalPage } from './LegalPage';

type Category = 'work' | 'personal' | 'shared';
type CalendarEvent = { id: number; day: number; time: string; title: string; category: Category; tone: string };
type ActivityRecord = { description: string; reflection: string } & RecordAttribution;
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
const profileAvatars = [
  { label: 'ねこ', illustration: '🐱', color: '#fff0d9' },
  { label: 'いぬ', illustration: '🐶', color: '#e8f4ff' },
  { label: 'うさぎ', illustration: '🐰', color: '#ffeaf2' },
  { label: 'くま', illustration: '🐻', color: '#f5e9dc' },
  { label: 'お花', illustration: '🌷', color: '#ffeaf2' },
  { label: '星', illustration: '⭐', color: '#fff5cf' },
  { label: 'テニス', illustration: '🎾', color: '#e9f8df' },
  { label: '虹', illustration: '🌈', color: '#e9edff' },
];
const menuItems = [
  { label: 'ホーム', icon: House }, { label: '引き継ぎ', icon: UserRound },
  { label: 'プロフィール設定', icon: Settings }, { label: 'サークル設定', icon: CircleDot },
  { label: '役職設定', icon: Settings, admin: true }, { label: '予算管理', icon: WalletCards }, { label: 'データ管理', icon: Database, admin: true },
  { label: 'サークル選択に戻る', icon: ArrowLeft },
];
type BudgetItem = { id: number; name: string; amount: number; category: string; date: string; type: 'income' | 'expense' };
const circles = [
  { id: 'tennis', name: '高体連庭球部', detail: 'テニスサークル · 12人' },
  { id: 'sample', name: '新歓プロジェクト', detail: 'イベント運営 · 8人' },
];
function Root() {
  const [session, setSession] = useState<import('@supabase/supabase-js').Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (window.location.pathname === '/privacy' || window.location.pathname === '/privacy/') return <LegalPage kind="privacy"/>;
  if (window.location.pathname === '/terms' || window.location.pathname === '/terms/') return <LegalPage kind="terms"/>;
  async function login() {
    if (!supabase) return;
    setAuthError(null);
    setSigningIn(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google', options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'ログインに失敗しました。');
      setSigningIn(false);
    }
  }
  async function logout() {
    if (!supabase) return;
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'ログアウトに失敗しました。');
    }
  }
  if (preview && import.meta.env.DEV) return <>
    <div className="preview-banner" role="status">表示確認用サンプル・認証していません。データは一時保存です。<button onClick={() => setPreview(false)}>確認を終了</button></div>
    <App onLogout={() => setPreview(false)}/>
  </>;
  if (!supabase) return <main className="login-main"><section className="login-card" aria-labelledby="auth-config-title">
    <span className="brand-mark login-mark" aria-hidden="true">H</span>
    <h1 id="auth-config-title">ログイン設定が必要です</h1>
    <p className="login-lead" role="alert">{supabaseConfigurationError}</p>
    <p className="login-note">開発担当者から接続設定を受け取り、.env.local に設定して開発サーバーを再起動してください。</p>
    {import.meta.env.DEV && <button className="google-button" onClick={() => setPreview(true)}>サンプル画面を確認</button>}
  </section></main>;
  if (loading) return <main className="login-main"><p role="status">ログイン状態を確認中です…</p></main>;
  return <>
    {authError && <p role="alert">{authError}</p>}
    {session ? <App key={session.user.id} user={session.user} onLogout={() => { void logout(); }}/>
      : <LoginPage onLogin={() => { void login(); }} busy={signingIn}/>}
  </>;
}
function App({ user, onLogout }: { user?: import('@supabase/supabase-js').User; onLogout: () => void }) {
  // Googleのプロフィール情報は表示専用。権限判定には使用しない。
  const profileName = [user?.user_metadata.full_name, user?.user_metadata.name]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  const initialDisplayName = profileName?.trim() || user?.email?.split('@')[0] || (user ? 'ユーザー' : 'サンプルユーザー');
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const displayEmail = user?.email || (user ? 'メールアドレス未設定' : '認証していません');
  const initials = Array.from(displayName).slice(0, 2).join('').toLocaleUpperCase();
  const [month, setMonth] = useState(new Date(2026, 0, 1));
  const [calendarEvents, setCalendarEvents] = useState(events);
  const [selectedDay, setSelectedDay] = useState<number | null>(9);
  const [menuOpen, setMenuOpen] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileRoleIds, setProfileRoleIds] = useState<string[]>([]);
  const [circleSelectionOpen, setCircleSelectionOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState('100000');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [budgetDraft, setBudgetDraft] = useState({ name: '', amount: '', category: '活動費', date: '2026-01-01', type: 'expense' as 'income' | 'expense' });
  const [selectedCircle, setSelectedCircle] = useState(circles[0]);
  const [roles, setRoles] = useState(initialRoles);
  const [documents, setDocuments] = useState(initialDocuments);
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState<Category[]>(['work', 'personal', 'shared']);
  const [notice, setNotice] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedProfileAvatar, setSelectedProfileAvatar] = useState<(typeof profileAvatars)[number] | null>(null);
  const [avatarChooserOpen, setAvatarChooserOpen] = useState(false);
  const profileImageInput = useRef<HTMLInputElement>(null);
  const avatarChooserHeading = useRef<HTMLHeadingElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [eventDetail, setEventDetail] = useState<CalendarEvent | null>(null);
  const [activityRecords, setActivityRecords] = useState<Record<number, ActivityRecord>>({
    1: { description: '基礎練習を中心に取り組みました。フォームを確認しながら、繰り返し練習しました。', reflection: '次回は今日の気づきを意識して、少しずつ精度を上げていきます。' },
  });
  const [activityEditing, setActivityEditing] = useState(false);
  const [activityDraft, setActivityDraft] = useState<ActivityRecord>({ description: '', reflection: '' });
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState({ title: '', time: '10:00', category: 'work' as Category });
  const activityHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (eventDetail) activityHeading.current?.focus(); }, [eventDetail]);
  useEffect(() => {
    function dismiss(e: PointerEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }
    function keyboard(e: KeyboardEvent) { if (e.key === 'Escape') { if (avatarChooserOpen) { setAvatarChooserOpen(false); } else { setMenuOpen(false); setEventDetail(null); setHandoverOpen(false); setProfileOpen(false); menuButton.current?.focus(); } } }
    document.addEventListener('pointerdown', dismiss); document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', keyboard); };
  }, [avatarChooserOpen]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 4000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => { if (avatarChooserOpen) avatarChooserHeading.current?.focus(); }, [avatarChooserOpen]);
  useEffect(() => () => { if (profileImage) URL.revokeObjectURL(profileImage); }, [profileImage]);
  const year = month.getFullYear(), monthIndex = month.getMonth();
  const monthName = month.toLocaleString('ja-JP', { month: 'long' });

  const filtered = (year === 2026 && monthIndex === 0 ? calendarEvents : []).filter(e => enabled.includes(e.category) && e.title.toLowerCase().includes(query.toLowerCase()));
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => i >= firstDay && i < firstDay + dayCount ? i - firstDay + 1 : null);
  function changeMonth(delta: number) { setMonth(new Date(year, monthIndex + delta, 1)); setSelectedDay(null); }
  function placeholder(label: string) { setMenuOpen(false); setNotice(`${label}は今後実装予定です。`); }
  function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setProfileImage(URL.createObjectURL(file));
      setSelectedProfileAvatar(null);
      setAvatarChooserOpen(false);
    } else if (file) {
      setNotice('画像ファイルを選択してください。');
    }
    e.currentTarget.value = '';
  }
  function openProfile() {
    setProfileOpen(true); setBudgetOpen(false); setCircleSelectionOpen(false); setHandoverOpen(false); setEventDetail(null); setMenuOpen(false);
  }
  function goHome() {
    setProfileOpen(false);
    setMonth(new Date(2026, 0, 1));
    setSelectedDay(9);
    setCircleSelectionOpen(false);
    setBudgetOpen(false);
    setHandoverOpen(false);
    setEventDetail(null);
    setMenuOpen(false);
  }
  function openCircleSelection() {
    setProfileOpen(false);
    setCircleSelectionOpen(true);
    setHandoverOpen(false);
    setEventDetail(null);
    setMenuOpen(false);
  }
  function openBudget() {
    setProfileOpen(false); setBudgetOpen(true); setCircleSelectionOpen(false); setHandoverOpen(false); setEventDetail(null); setMenuOpen(false); }
  function selectCircle(circle: typeof circles[number]) {
    setSelectedCircle(circle);
    goHome();
  }
  function openActivityEditor(event: CalendarEvent) {
    const record = activityRecords[event.id] ?? { description: '', reflection: '' };
    setActivityDraft(record);
    setActivityEditing(true);
  }
  function deleteEvent() {
    if (!eventDetail) return;
    if (!window.confirm(`「${eventDetail.title}」の予定を削除しますか？\nこの予定と、紐づく活動記録も削除されます。`)) return;
    const eventId = eventDetail.id;
    setCalendarEvents(previous => previous.filter(event => event.id !== eventId));
    setActivityRecords(previous => {
      const remaining = { ...previous };
      delete remaining[eventId];
      return remaining;
    });
    setActivityEditing(false);
    setActivityDraft({ description: '', reflection: '' });
    setEventFormOpen(false);
    setEventDetail(null);
    setNotice('予定と紐づく活動記録を削除しました。');
    menuButton.current?.focus();
  }
  function deleteActivity() {
    if (!eventDetail || !activityRecords[eventDetail.id]) return;
    if (!window.confirm(`「${eventDetail.title}」の活動記録を削除しますか？\n活動内容・ふりかえりを削除します。カレンダーの予定は残ります。`)) return;
    const eventId = eventDetail.id;
    setActivityRecords(previous => {
      const remaining = { ...previous };
      delete remaining[eventId];
      return remaining;
    });
    setActivityEditing(false);
    setActivityDraft({ description: '', reflection: '' });
    setNotice('活動記録を削除しました。予定は残っています。');
    activityHeading.current?.focus();
  }
  function saveActivity() {
    if (!eventDetail || !activityDraft.description.trim()) {
      setNotice('活動内容を入力してください。');
      return;
    }
    const timestamp = new Date().toISOString();
    setActivityRecords(previous => ({ ...previous, [eventDetail.id]: {
      ...previous[eventDetail.id],
      ...(!previous[eventDetail.id] ? { createdBy: currentUserId, createdAt: timestamp } : {}),
      description: activityDraft.description.trim(), reflection: activityDraft.reflection.trim(),
      updatedBy: currentUserId, updatedAt: timestamp,
    } }));
    setActivityEditing(false);
    setNotice('活動記録を保存しました。');
  }
  function openEventEditor(day = selectedDay) { if (day) setSelectedDay(day); setEventDraft({ title: '', time: '10:00', category: 'work' }); setEventFormOpen(true); }
  function saveEvent() {
    if (!selectedDay || !eventDraft.title.trim()) { setNotice('日付と予定名を入力してください。'); return; }
    const tone = eventDraft.category === 'work' ? 'purple' : eventDraft.category === 'personal' ? 'teal' : 'orange';
    setCalendarEvents(previous => [...previous, { id: Date.now(), day: selectedDay, time: eventDraft.time, title: eventDraft.title.trim(), category: eventDraft.category, tone }]);
    setEventFormOpen(false); setNotice(`${monthIndex + 1}月${selectedDay}日に予定を追加しました。`);
  }
  return <ProfileContext.Provider value={{ userId: currentUserId, displayName }}>
    <header className="header">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); goHome(); }}><span className="brand-mark">H</span><span>ホーム</span></a>
      <div className="header-actions">
        <label className="search"><Search size={17}/><input aria-label="予定を検索" placeholder="予定を検索" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <button className="help icon-button" aria-label="ヘルプ" onClick={() => setNotice('月の矢印で移動、予定をクリックして詳細を確認できます。')}><CircleHelp size={20}/></button>
        <div className="menu-anchor" ref={menuRef}>
          <button ref={menuButton} className={`menu-trigger icon-button ${menuOpen ? 'active' : ''}`} aria-label="メニュー" aria-expanded={menuOpen} aria-controls="home-menu" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={26}/></button>
          {menuOpen && <nav id="home-menu" className="menu-panel" aria-label="ホームメニュー">
            <div className="menu-heading"><span>メニュー</span><span className="menu-user-name">{displayName}</span></div>
            {menuItems.map(({ label, icon: Icon, admin }) => <button key={label} className={`menu-item ${(!circleSelectionOpen && !budgetOpen && (profileOpen ? label === 'プロフィール設定' : handoverOpen ? label === '引き継ぎ' : label === 'ホーム')) ? 'current' : ''}`} onClick={() => { if (label === 'ホーム') goHome(); else if (label === '引き継ぎ') { setProfileOpen(false); setMenuOpen(false); setEventDetail(null); setCircleSelectionOpen(false); setBudgetOpen(false); setHandoverOpen(true); } else if (label === 'プロフィール設定') openProfile(); else if (label === '予算管理') openBudget(); else if (label === 'サークル選択に戻る') openCircleSelection(); else placeholder(label); }}><span className="menu-icon"><Icon size={15}/></span><span>{label}</span>{admin && <span className="admin-badge">管理者</span>}</button>)}
          </nav>}
        </div>
      </div>
    </header>
    <main className={eventDetail || handoverOpen || circleSelectionOpen || budgetOpen || profileOpen ? 'activity-main' : undefined}>
      {profileOpen ? <ProfileSettingsPage displayName={displayName} email={displayEmail} roles={roles} selectedRoleIds={profileRoleIds} onApply={(name, roleIds) => { setDisplayName(name); setProfileRoleIds(roleIds); }} onHome={goHome}/> : budgetOpen ? <section className="budget-page" aria-labelledby="budget-title">
        <nav className="activity-breadcrumb" aria-label="パンくず"><button onClick={goHome}>‹ ホーム</button><span>/</span><span>予算管理</span></nav>
        <div className="budget-heading"><div><h1 id="budget-title">予算管理</h1><p className="activity-subtitle">サークルの予算と支出を管理します <span className="activity-sample-note">（表示確認用の一時保存）</span></p></div></div>
        <div className="budget-summary"><label>月の予算<input type="number" min="0" value={monthlyBudget} onChange={e => setMonthlyBudget(e.target.value)} />円</label><div><span>月の残り予算</span><strong className="budget-remaining">{(Number(monthlyBudget) - budgetItems.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)).toLocaleString()}円</strong></div><div><span>サークルの残高</span><strong className="budget-balance">{(budgetItems.reduce((sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount), 0)).toLocaleString()}円</strong></div></div>
        <form className="budget-form" onSubmit={e => { e.preventDefault(); const amount = Number(budgetDraft.amount); if (!budgetDraft.name.trim() || amount <= 0) { setNotice('項目名と正しい金額を入力してください。'); return; } setBudgetItems(previous => [...previous, { id: Date.now(), name: budgetDraft.name.trim(), amount, category: budgetDraft.category, date: budgetDraft.date, type: budgetDraft.type }]); setBudgetDraft({ name: '', amount: '', category: '活動費', date: '2026-01-01', type: 'expense' }); setNotice(budgetDraft.type === 'income' ? '収入を追加しました。' : '支出を追加しました。'); }}><h2>{budgetDraft.type === 'income' ? '収入を追加' : '支出を追加'}</h2><select aria-label="入出金種別" value={budgetDraft.type} onChange={e => setBudgetDraft(previous => ({ ...previous, type: e.target.value as 'income' | 'expense' }))}><option value="expense">支出</option><option value="income">収入</option></select><input aria-label="項目名" placeholder="項目名" value={budgetDraft.name} onChange={e => setBudgetDraft(previous => ({ ...previous, name: e.target.value }))} /><input aria-label="金額" type="number" min="1" placeholder="金額" value={budgetDraft.amount} onChange={e => setBudgetDraft(previous => ({ ...previous, amount: e.target.value }))} /><select aria-label="カテゴリ" value={budgetDraft.category} onChange={e => setBudgetDraft(previous => ({ ...previous, category: e.target.value }))}><option>活動費</option><option>備品費</option><option>会場費</option><option>会費</option><option>寄付</option><option>その他</option></select><input aria-label="日付" type="date" value={budgetDraft.date} onChange={e => setBudgetDraft(previous => ({ ...previous, date: e.target.value }))} /><button className="activity-primary-button">追加する</button></form>
        <section className="budget-card"><h2>入出金一覧</h2>{budgetItems.length ? <ul className="budget-list">{budgetItems.map(item => <li key={item.id}><span><strong>{item.name}</strong><small>{item.date} · {item.category} · {item.type === 'income' ? '収入' : '支出'}</small></span><b className={item.type === 'income' ? 'budget-income' : ''}>{item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()}円</b></li>)}</ul> : <p className="budget-empty">入出金はまだありません。</p>}</section>
      </section> : circleSelectionOpen ? <section className="circle-selection-page" aria-labelledby="circle-selection-title">
        <nav className="activity-breadcrumb" aria-label="パンくず"><button onClick={goHome}>‹ ホーム</button><span>/</span><span>サークル選択</span></nav>
        <h1 id="circle-selection-title">サークルを選択</h1>
        <p className="activity-subtitle">参加するサークルを選択してください</p>
        <div className="circle-selection-card">
          <p className="circle-sample-note">表示確認用のサンプルです。選択内容は再読み込みするとリセットされます。</p>
          <div className="circle-list" role="list">{circles.map(circle => <button className={`circle-option ${selectedCircle.id === circle.id ? 'selected' : ''}`} key={circle.id} onClick={() => selectCircle(circle)}><span className="circle-option-mark" aria-hidden="true">{circle.name.charAt(0)}</span><span><strong>{circle.name}</strong><small>{circle.detail}</small></span><span className="circle-option-check" aria-hidden="true">{selectedCircle.id === circle.id ? '選択中' : '選択'}</span></button>)}</div>
        </div>
      </section> : handoverOpen ? <HandoverPage onUpdateDocument={updated => setDocuments(previous => previous.map(document => document.id === updated.id ? updated : document))} onDeleteDocument={id => setDocuments(previous => previous.filter(document => document.id !== id))} documents={documents} onAddDocument={document => setDocuments(previous => [...previous, document])} roles={roles} onAddRole={role => setRoles(previous => [...previous, role])} onHome={goHome}/> : eventDetail ? <section className="activity-page" aria-labelledby="activity-title">
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
          <div className="event-detail-heading"><h2>{eventDetail.title}</h2><button className="activity-delete-button" onClick={deleteEvent}>予定を削除</button></div>
          <hr />
          {activityEditing ? <form className="activity-form" onSubmit={e => { e.preventDefault(); saveActivity(); }}>
            <label>活動内容<textarea value={activityDraft.description} onChange={e => setActivityDraft(previous => ({ ...previous, description: e.target.value }))} placeholder="活動内容を入力してください" required /></label>
            <label>ふりかえり<textarea value={activityDraft.reflection} onChange={e => setActivityDraft(previous => ({ ...previous, reflection: e.target.value }))} placeholder="気づいたことや次回へのメモ" /></label>
            <div className="activity-form-actions"><button type="button" className="today-button" onClick={() => setActivityEditing(false)}>キャンセル</button><button type="submit" className="activity-primary-button">保存する</button></div>
          </form> : activityRecords[eventDetail.id] ? <>
            <RecordAttributionView record={activityRecords[eventDetail.id]}/><h3>活動内容</h3><div className="activity-description"><p>{activityRecords[eventDetail.id].description}</p></div>
            <section className="activity-reflection" aria-labelledby="reflection-title"><h3 id="reflection-title">ふりかえり</h3><p>{activityRecords[eventDetail.id].reflection || 'ふりかえりはまだありません。'}</p></section>
            <div className="activity-record-actions"><button className="activity-primary-button" onClick={() => openActivityEditor(eventDetail)}>編集する</button><button className="activity-delete-button" onClick={deleteActivity}>活動記録を削除</button></div>
          </> : <div className="activity-empty"><p>この予定の活動記録はまだありません。</p><button className="activity-primary-button" onClick={() => openActivityEditor(eventDetail)}>活動記録を作成</button></div>}
          <button className="today-button" onClick={() => setEventDetail(null)}>‹ ホームに戻る</button>
        </article>
      </section> : <>
      <div className="page-heading"><div><h1>{selectedCircle.name}</h1><p>サークルの予定を確認しましょう</p></div>
        <div className="month-controls"><button className="today-button" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDay(now.getDate()); }}>今日</button><div className="month-navigation"><button className="icon-button bordered" aria-label="前の月" onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button><h2 aria-live="polite">{year}年{monthName}</h2><button className="icon-button bordered" aria-label="次の月" onClick={() => changeMonth(1)}><ChevronRight size={20}/></button></div></div>
      </div>
      {eventFormOpen && <form className="event-form" onSubmit={e => { e.preventDefault(); saveEvent(); }}><h2>予定を追加</h2><p>{monthIndex + 1}月{selectedDay ?? '―'}日の予定</p><label>予定名<input value={eventDraft.title} onChange={e => setEventDraft(previous => ({ ...previous, title: e.target.value }))} placeholder="予定名を入力" autoFocus required /></label><label>時刻<input type="time" value={eventDraft.time} onChange={e => setEventDraft(previous => ({ ...previous, time: e.target.value }))} required /></label><label>カテゴリ<select value={eventDraft.category} onChange={e => setEventDraft(previous => ({ ...previous, category: e.target.value as Category }))}>{categories.map(category => <option key={category.key} value={category.key}>{category.label}</option>)}</select></label><div className="event-form-actions"><button type="button" className="today-button" onClick={() => setEventFormOpen(false)}>キャンセル</button><button type="submit" className="event-submit-button">追加する</button></div></form>}
      <div className="dashboard">
        <section className="calendar-card" aria-label={`${year}年${monthIndex + 1}月のカレンダー`}>
          <div className="weekdays">{['日', '月', '火', '水', '木', '金', '土'].map(day => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">{cells.map((day, i) => <div className={`day-cell ${day === null ? 'empty' : ''}`} key={i} onClick={() => day !== null && openEventEditor(day)}>{day !== null && <>
            <button className={`day-number ${selectedDay === day ? 'selected' : ''}`} aria-label={`${monthIndex + 1}月${day}日に予定を追加`} aria-pressed={selectedDay === day} onClick={e => { e.stopPropagation(); openEventEditor(day); }}>{day}</button>
            <div className="day-events">{filtered.filter(e => e.day === day).map(event => <button className={`event-chip tone-${event.tone}`} key={event.id} title={`${event.time} ${event.title}`} onClick={e => { e.stopPropagation(); setEventDetail(event); }}>{event.title === 'Lunch with Mina' ? 'Lunch · Mina' : event.title}</button>)}</div>
          </>}</div>)}</div>
        </section>
        <aside className="schedule-card">
          <h2>{monthName}の予定</h2><p className="schedule-subtitle">{filtered.length}件の予定 · 日時順</p>
          <div className="schedule-list">{filtered.length ? filtered.map(event => <button className="schedule-row" key={event.id} onClick={() => setEventDetail(event)}><span className={`event-dot tone-${event.tone}`}/><span><span className="event-time">{monthIndex + 1}月{event.day}日 · {event.time}</span><span className="event-title">{event.title}</span></span></button>) : <p className="empty-message">{query ? '検索に一致する予定はありません。' : 'この月の予定はありません。'}</p>}</div>
          <section className="calendar-filters"><h3>カレンダーの表示設定</h3>{categories.map(category => <label key={category.key}><span className={`category-square tone-${category.tone}`}/><span>{category.label}</span><input type="checkbox" checked={enabled.includes(category.key)} onChange={() => setEnabled(old => old.includes(category.key) ? old.filter(k => k !== category.key) : [...old, category.key])}/></label>)}</section>
          <section className="account-card"><div className="account-identity"><button className="avatar avatar-button" type="button" aria-label="プロフィールアイコンを選択" onClick={() => setAvatarChooserOpen(true)}>{profileImage ? <img className="avatar-image" src={profileImage} alt=""/> : selectedProfileAvatar ? <span aria-hidden="true">{selectedProfileAvatar.illustration}</span> : initials}</button><div><h3>{displayName}</h3><p>{displayEmail}</p><p className="account-role-summary">{roles.filter(role => profileRoleIds.includes(role.id)).map(role => role.name).join('・') || '役職未設定'}</p><button className="profile-image-change" type="button" onClick={() => setAvatarChooserOpen(true)}>アイコンを変更</button></div></div><input ref={profileImageInput} className="profile-image-input" type="file" accept="image/*" aria-label="プロフィール画像ファイルを選択" onChange={handleProfileImageChange}/><div className="account-links"><button onClick={() => placeholder('アカウント管理')}>アカウント管理</button><button className="purple-link" onClick={openProfile}>プロフィール設定</button></div><button className="sign-out" onClick={onLogout}>ログアウト</button></section>
        </aside>
      </div>
      </>}
    </main>
    {avatarChooserOpen && <div className="avatar-dialog-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAvatarChooserOpen(false); }}>
      <section className="avatar-dialog" role="dialog" aria-modal="true" aria-labelledby="avatar-dialog-title">
        <button className="avatar-dialog-close" type="button" aria-label="閉じる" onClick={() => setAvatarChooserOpen(false)}>×</button>
        <h2 id="avatar-dialog-title" ref={avatarChooserHeading} tabIndex={-1}>アイコンを選択</h2>
        <p>好きなイラストを選ぶか、自分の画像を使えます。</p>
        <div className="avatar-options">
          <button className="avatar-option" type="button" onClick={() => { setProfileImage(null); setSelectedProfileAvatar(null); setAvatarChooserOpen(false); }}>
            <span className="avatar-option-art avatar-option-initials">AK</span><span>初期アイコン</span>
          </button>
          {profileAvatars.map(avatar => <button className="avatar-option" type="button" key={avatar.label} onClick={() => { setProfileImage(null); setSelectedProfileAvatar(avatar); setAvatarChooserOpen(false); }}>
            <span className="avatar-option-art" style={{ backgroundColor: avatar.color }} aria-hidden="true">{avatar.illustration}</span><span>{avatar.label}</span>
          </button>)}
        </div>
        <button className="avatar-upload-button" type="button" onClick={() => profileImageInput.current?.click()}>画像ファイルを選ぶ</button>
      </section>
    </div>}
    {notice && <div className="toast" role="status">{notice}<button aria-label="通知を閉じる" onClick={() => setNotice(null)}><X size={16}/></button></div>}
  </ProfileContext.Provider>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
