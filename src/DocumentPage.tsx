import { RecordAttributionView } from './RecordAttribution';
import { useEffect, useRef, useState } from 'react';
import type { HandoverDocument } from './handoverDocuments';
import type { Role } from './RoleDocumentsPage';

export function DocumentPage({ document, role, onSave, onDelete, onBack, onRoles, onHome, onReset }: {
  onSave: (title: string, body: string) => void; onDelete: () => void;
  document: HandoverDocument; role: Role; onBack: () => void; onRoles: () => void; onHome: () => void; onReset: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(document.title);
  const [body, setBody] = useState(document.body);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const titleInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) titleInput.current?.focus(); }, [editing]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  function startEditing() {
    setTitle(document.title); setBody(document.body); setError(''); setMessage(''); setEditing(true);
  }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) { setError('タイトルと本文を入力してください。'); return; }
    onSave(title.trim(), body.trim());
    setEditing(false); setMessage('変更を反映しました（再読み込みで元に戻ります）。');
    heading.current?.focus();
  }
  return <section className="handover-page document-page" aria-labelledby="document-title">
    <nav className="activity-breadcrumb" aria-label="パンくず">
      <button onClick={onHome}>ホーム</button><span>/</span>
      <button onClick={onRoles}>役職一覧</button><span>/</span>
      <button onClick={onBack}>{role.name}</button><span>/</span><button aria-current="page" onClick={onReset}>{document.title}</button>
    </nav>
    <div className="handover-heading">
      <div><h1 id="document-title" tabIndex={-1} ref={heading}>{document.title}</h1><p>{role.name}の資料（{document.sample ? '表示確認用のサンプル' : '一時保存'}）</p></div>
    </div>
    <article className="handover-card document-card" aria-label={`${document.title}の本文`}>
      <div className="document-toolbar" aria-label="文書の操作（未実装）">
        <span>文書</span>
        <div className="document-format"><button disabled aria-label="太字"><b>B</b></button><button disabled aria-label="斜体"><i>I</i></button><button disabled aria-label="下線"><u>U</u></button></div>
        <button className="document-share" disabled>共有</button>
      </div>
      <div className="document-body"><RecordAttributionView record={document}/>
        {editing ? <form className="document-edit-form" onSubmit={save}>
          <label htmlFor="edit-document-title">タイトル</label>
          <input ref={titleInput} id="edit-document-title" value={title} maxLength={100} onChange={event => setTitle(event.target.value)} required/>
          <label htmlFor="edit-document-body">本文</label>
          <textarea id="edit-document-body" rows={10} value={body} onChange={event => setBody(event.target.value)} required/>
          {error && <p role="alert">{error}</p>}
          <div className="activity-record-actions"><button className="activity-primary-button" type="submit">変更を反映</button><button className="today-button" type="button" onClick={() => { setEditing(false); setError(''); heading.current?.focus(); }}>キャンセル</button></div>
        </form> : <><h2>{document.title}</h2><p className="document-text">{document.body}</p><div className="document-detail-actions"><button className="activity-primary-button" onClick={startEditing}>編集する</button><button className="activity-delete-button" onClick={onDelete}>資料を削除</button></div></>}
        <p role="status">{message}</p>
      </div>
    </article>
    <p className="handover-note">追加・編集・削除は一時反映です。再読み込みすると元に戻ります。共有・永続保存は今後実装予定です。</p>
    <button className="today-button" onClick={onBack}>‹ 資料一覧に戻る</button>
  </section>;
}