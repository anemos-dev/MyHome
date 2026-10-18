import { useEffect, useRef, useState } from 'react';
import type { Role } from './RoleDocumentsPage';

export type ProfileGender = '' | '男性' | '女性' | 'その他' | '回答しない';
export type ProfileGrade = '' | '1年' | '2年' | '3年' | '4年' | '修士1年' | '修士2年' | '博士1年' | '博士2年' | '博士3年' | 'その他';

function toProfileGender(value: string): ProfileGender {
  switch (value) {
    case '男性':
    case '女性':
    case 'その他':
    case '回答しない':
      return value;
    default:
      return '';
  }
}

function toProfileGrade(value: string): ProfileGrade {
  switch (value) {
    case '1年':
    case '2年':
    case '3年':
    case '4年':
    case '修士1年':
    case '修士2年':
    case '博士1年':
    case '博士2年':
    case '博士3年':
    case 'その他':
      return value;
    default:
      return '';
  }
}

export function ProfileSettingsPage({ displayName, email, gender, grade, roles, selectedRoleIds, onApply, onHome, onReset }: {
  displayName: string; email: string; gender: ProfileGender; grade: ProfileGrade; roles: Role[]; selectedRoleIds: string[];
  onApply: (name: string, roleIds: string[], gender: ProfileGender, grade: ProfileGrade) => void; onHome: () => void; onReset: () => void;
}) {
  const [name, setName] = useState(displayName);
  const [roleIds, setRoleIds] = useState(selectedRoleIds);
  const [selectedGender, setSelectedGender] = useState(gender);
  const [selectedGrade, setSelectedGrade] = useState(grade);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('表示名を入力してください。'); nameInput.current?.focus(); return; }
    onApply(trimmed, roleIds, selectedGender, selectedGrade);
    setName(trimmed); setError(''); setMessage('表示名と役職を反映しました。再読み込みすると元に戻ります。');
  }

  return <section className="profile-page" aria-labelledby="profile-title">
    <nav className="activity-breadcrumb" aria-label="パンくず"><button onClick={onHome}>ホーム</button><span>/</span><button aria-current="page" onClick={onReset}>プロフィール設定</button></nav>
    <h1 id="profile-title" tabIndex={-1} ref={heading}>プロフィール設定</h1>
    <p className="activity-subtitle">表示名、性別、学年、担当する役職を変更できます</p>
    <form className="profile-card" onSubmit={apply}>
      <div className="profile-card-heading"><h2>基本情報</h2><span className="profile-sample-badge">サンプル</span></div>

      <div className="profile-field"><div className="profile-field-label"><label htmlFor="profile-name">表示名</label><p>メニューやホームに表示する名前</p></div><div>
      <input ref={nameInput} id="profile-name" autoComplete="nickname" value={name} maxLength={50} required aria-invalid={!!error} aria-describedby={error ? 'profile-name-error' : 'profile-name-help'} onChange={event => { setName(event.target.value); setError(''); setMessage(''); }}/>
      <p id="profile-name-help" className="profile-note">1〜50文字で入力してください。</p>
      {error && <p id="profile-name-error" className="profile-error" role="alert">{error}</p>}
      </div></div><div className="profile-field"><div className="profile-field-label"><label htmlFor="profile-email">メールアドレス</label><p>アカウントのメールアドレス</p></div><div>
      <input id="profile-email" type="email" value={email} readOnly aria-describedby="profile-email-help"/>
      <p id="profile-email-help" className="profile-note">メールアドレスは表示のみです。</p>
            </div></div>
      <div className="profile-field">
        <div className="profile-field-label"><label htmlFor="profile-gender">性別</label><p>公開したくない場合は未設定のままにできます</p></div>
        <div><select id="profile-gender" value={selectedGender} onChange={event => { setSelectedGender(toProfileGender(event.target.value)); setMessage(''); }}>
          <option value="">未設定</option><option value="男性">男性</option><option value="女性">女性</option><option value="その他">その他</option><option value="回答しない">回答しない</option>
        </select></div>
      </div>
      <div className="profile-field">
        <div className="profile-field-label"><label htmlFor="profile-grade">学年</label><p>在籍している学年を選択してください</p></div>
        <div><select id="profile-grade" value={selectedGrade} onChange={event => { setSelectedGrade(toProfileGrade(event.target.value)); setMessage(''); }}>
          <option value="">未設定</option><option value="1年">1年</option><option value="2年">2年</option><option value="3年">3年</option><option value="4年">4年</option>
          <option value="修士1年">修士1年</option><option value="修士2年">修士2年</option><option value="博士1年">博士1年</option><option value="博士2年">博士2年</option><option value="博士3年">博士3年</option><option value="その他">その他</option>
        </select></div>
      </div>
      <fieldset className="profile-role-field"><legend>担当する役職</legend>
        <p className="profile-note">複数選択できます。役職の選択によって管理者権限は変わりません。</p>
        <div className="profile-role-options">{roles.map(role => <label key={role.id}>
          <input type="checkbox" checked={roleIds.includes(role.id)} onChange={event => { setRoleIds(previous => event.target.checked ? [...previous, role.id] : previous.filter(id => id !== role.id)); setMessage(''); }}/>{role.name}
        </label>)}</div>
        {roleIds.length === 0 && <p className="profile-note">役職は未設定です。</p>}
      </fieldset>
      <p className="profile-sample-info">変更はこの画面内だけに反映されます。再読み込み・ログアウトで元に戻ります。</p><div className="profile-actions"><button className="today-button" type="button" onClick={onHome}>ホームに戻る</button><button className="activity-primary-button" type="submit">変更を反映</button></div>
      <p className="profile-result" role="status">{message}</p>
    </form>
  </section>;
}