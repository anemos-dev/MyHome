import { useEffect, useRef, useState } from 'react';
import { RoleDocumentsPage, type Role } from './RoleDocumentsPage';
import type { HandoverDocument } from './handoverDocuments';

export const initialRoles: Role[] = [
  { id: 'leader', name: '代表' }, { id: 'deputy', name: '副代表' },
  { id: 'treasurer', name: '会計' }, { id: 'camp', name: '合宿' },
];

export function HandoverPage({ onHome, roles, onAddRole, documents, onAddDocument, onUpdateDocument, onDeleteDocument }: {
  onUpdateDocument: (document: HandoverDocument) => void; onDeleteDocument: (id: string) => void;
  documents: HandoverDocument[]; onAddDocument: (document: HandoverDocument) => void;
  onHome: () => void; roles: Role[]; onAddRole: (role: Role) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!selectedRole) heading.current?.focus(); }, [selectedRole]);
  useEffect(() => { if (adding) nameInput.current?.focus(); }, [adding]);

  function cancelAdd() {
    setAdding(false); setName(''); setError(''); addButton.current?.focus();
  }

  function addRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('役職名を入力してください。'); return; }
    if (roles.some(role => role.name === trimmed)) { setError('同じ名前の役職がすでにあります。'); return; }
    onAddRole({ id: crypto.randomUUID(), name: trimmed });
    cancelAdd();
  }

  if (selectedRole) return <RoleDocumentsPage key={selectedRole.id} role={selectedRole} allDocuments={documents} onAddDocument={onAddDocument} onUpdateDocument={onUpdateDocument} onDeleteDocument={onDeleteDocument} onBack={() => setSelectedRole(null)} onHome={onHome}/>;

  return <section className="handover-page" aria-labelledby="handover-title">
    <nav className="activity-breadcrumb" aria-label="パンくず">
      <button onClick={onHome}>ホーム</button><span>/</span><span>引き継ぎ</span>
    </nav>
    <div className="handover-heading">
      <div><h1 id="handover-title" tabIndex={-1} ref={heading}>役職を選択</h1><p>登録されている役職（表示確認用のサンプル）</p></div>
      <button ref={addButton} className="handover-add" aria-expanded={adding} aria-controls="role-add-form" onClick={() => setAdding(true)}>＋ 役職を追加</button>
    </div>
    {adding && <form id="role-add-form" className="role-add-form" onSubmit={addRole}>
      <label htmlFor="role-name">役職名</label>
      <input ref={nameInput} id="role-name" value={name} maxLength={50} aria-invalid={!!error} aria-describedby={error ? 'role-add-error' : undefined} onChange={event => { setName(event.target.value); setError(''); }}/>
      <button className="handover-add" type="submit">追加</button>
      <button className="today-button" type="button" onClick={cancelAdd}>キャンセル</button>
      {error && <p id="role-add-error" role="alert">{error}</p>}
    </form>}
    <section className="handover-card" aria-labelledby="role-list-title">
      <div className="handover-list-heading"><h2 id="role-list-title">役職一覧</h2><p role="status">{roles.length}件</p></div>
      <ul className="handover-list">
        {roles.map(role => <li key={role.id}>
          <button className="handover-role" onClick={() => setSelectedRole(role)}>{role.name}</button>
          <button className="handover-remove" disabled aria-label={`${role.name}を削除`}>−</button>
        </li>)}
      </ul>
    </section>
    <p className="handover-note">各役職から資料一覧を開けます。追加した役職はこの画面の表示確認用で、再読み込みすると消えます。全役職で資料の一時作成と本文表示ができます。資料の編集・削除も一時反映できます。役職の削除・永続保存は今後実装予定です。</p>
    <button className="today-button" onClick={onHome}>‹ ホームに戻る</button>
  </section>;
}