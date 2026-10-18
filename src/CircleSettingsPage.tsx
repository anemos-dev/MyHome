import { useEffect, useRef, useState } from 'react';

export type CircleAppearance = { name: string; logo: string | null };
const members = [
  { id: 'a', name: 'サンプルメンバーA', role: '代表' },
  { id: 'b', name: 'サンプルメンバーB', role: '会計' },
  { id: 'c', name: 'サンプルメンバーC', role: '合宿' },
];

export function CircleSettingsPage({ circle, onApply, onHome }: {
  circle: CircleAppearance; onApply: (value: CircleAppearance) => void; onHome: () => void;
}) {
  const [name, setName] = useState(circle.name);
  const [logo, setLogo] = useState(circle.logo);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reading, setReading] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const readVersion = useRef(0);
  useEffect(() => { heading.current?.focus(); return () => { readVersion.current++; }; }, []);

  function chooseLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const version = ++readVersion.current;
    setError(''); setMessage(''); setReading(false);
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('2MB以下のPNG・JPEG・WebP画像を選んでください。'); return;
    }
    setReading(true);
    const reader = new FileReader();
    const fail = () => { if (version === readVersion.current) { setReading(false); setError('画像を読み込めませんでした。別の画像を選んでください。'); } };
    reader.onerror = fail;
    reader.onload = () => {
      if (typeof reader.result !== 'string') { fail(); return; }
      const value = reader.result;
      const image = new Image();
      image.onerror = fail;
      image.onload = () => { if (version === readVersion.current) { setLogo(value); setReading(false); } };
      image.src = value;
    };
    reader.readAsDataURL(file);
  }

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) { setError('サークル名を入力してください。'); return; }
    onApply({ name: name.trim(), logo }); setName(name.trim()); setError('');
    setMessage('変更を反映しました。再読み込みすると元に戻ります。');
  }

  return <section className="profile-page circle-settings-page" aria-labelledby="circle-settings-title">
    <nav className="activity-breadcrumb" aria-label="パンくず"><button onClick={onHome}>ホーム</button><span>/</span><span aria-current="page">サークル設定</span></nav>
    <h1 id="circle-settings-title" tabIndex={-1} ref={heading}>サークル設定</h1>
    <p className="activity-subtitle">サークルの基本情報とメンバーを確認できます</p>
    <form className="profile-card" onSubmit={apply}>
      <div className="profile-card-heading"><h2>基本情報</h2><span className="profile-sample-badge">一時保存</span></div>
      <div className="profile-field"><div className="profile-field-label"><label htmlFor="circle-name">サークル名</label><p>ホームやサークル選択に表示する名前</p></div><div>
        <input id="circle-name" maxLength={50} required value={name} onChange={event => { setName(event.target.value); setMessage(''); }} aria-describedby="circle-name-help"/>
        <p id="circle-name-help" className="profile-note">1〜50文字で入力してください。</p>
      </div></div>
      <div className="profile-field"><div className="profile-field-label"><label htmlFor="circle-logo">ロゴ</label><p>サークルの目印になる画像</p></div><div>
        <div className="circle-logo-preview">{logo ? <img src={logo} alt="選択したサークルロゴ"/> : <span aria-hidden="true">{Array.from(name.trim())[0] || 'C'}</span>}</div>
        <input id="circle-logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseLogo} aria-describedby="circle-logo-help"/>
        <p id="circle-logo-help" className="profile-note">PNG・JPEG・WebP、2MB以下。画像は外部へ送信されません。</p>
        {logo && <button className="today-button" type="button" onClick={() => { readVersion.current++; setReading(false); setLogo(null); setMessage(''); }}>ロゴを外す</button>}
        {reading && <p role="status" className="profile-note">画像を読み込み中…</p>}
      </div></div>
      <p className="profile-sample-info">変更は選択中のサークルだけに反映されます。再読み込み・ログアウトで元に戻ります。</p>
      {error && <p className="profile-error" role="alert">{error}</p>}
      <div className="profile-actions"><button className="today-button" type="button" onClick={onHome}>ホームに戻る</button><button className="activity-primary-button" type="submit" disabled={reading}>変更を反映</button></div>
      <p role="status" className="profile-result">{message}</p>
    </form>
    <section className="profile-card circle-members-card" aria-labelledby="circle-members-title">
      <div className="profile-card-heading"><h2 id="circle-members-title">メンバー一覧</h2><span className="profile-sample-badge">サンプル {members.length}件</span></div>
      <p className="profile-note">実際の所属情報ではありません。表示確認用の架空のメンバーです。</p>
      <ul className="circle-members-list">{members.map(member => <li key={member.id}><span className="circle-member-avatar" aria-hidden="true">{member.name.slice(-1)}</span><span>{member.name}</span><span className="circle-member-role">{member.role}</span></li>)}</ul>
    </section>
  </section>;
}