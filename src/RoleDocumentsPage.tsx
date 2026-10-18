import { ProfileContext } from './RecordAttribution';
import { useContext, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { DocumentPage } from './DocumentPage';
import type { HandoverDocument } from './handoverDocuments';


export type Role = { id: string; name: string };

export function RoleDocumentsPage({ role, allDocuments, onAddDocument, onUpdateDocument, onDeleteDocument, onBack, onHome, onReset }: { onUpdateDocument: (document: HandoverDocument) => void; onDeleteDocument: (id: string) => void; role: Role; allDocuments: HandoverDocument[]; onAddDocument: (document: HandoverDocument) => void; onBack: () => void; onHome: () => void; onReset: () => void }) {
  const profile = useContext(ProfileContext);
  const [query, setQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<HandoverDocument | null>(null);
  const [documentResetKey, setDocumentResetKey] = useState(0);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const titleInput = useRef<HTMLInputElement>(null);
  const documentLinks = useRef(new Map<string, HTMLButtonElement>());
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => { if (creating) titleInput.current?.focus(); }, [creating]);
  const roleDocuments = allDocuments.filter(document => document.roleId === role.id);
  const documents = roleDocuments.filter(document => document.title.includes(query.trim()));

  function closeDocument() {
    const id = selectedDocument?.id;
    setSelectedDocument(null);
    requestAnimationFrame(() => (id ? documentLinks.current.get(id) : null)?.focus());
  }

  function createDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) { setError('タイトルと本文を入力してください。'); return; }
    const now = new Date();
    const document: HandoverDocument = {
      id: crypto.randomUUID(), roleId: role.id, title: title.trim(), body: body.trim(),
      kind: '資料', updated: now.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'long', day: 'numeric' }),
      tag: '資料', label: '一時保存', year: false, sample: false,
      createdBy: profile.userId, updatedBy: profile.userId, createdAt: now.toISOString(), updatedAt: now.toISOString(),
    };
    onAddDocument(document);
    setCreating(false); setTitle(''); setBody(''); setError(''); setQuery('');
    setSelectedDocument(document);
  }

  function updateDocument(title: string, body: string) {
    if (!selectedDocument) return;
    const now = new Date();
    const updated = { ...selectedDocument, title, body, updatedBy: profile.userId, updatedAt: now.toISOString(), updated: now.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'long', day: 'numeric' }) };
    onUpdateDocument(updated);
    setSelectedDocument(updated);
  }
  function deleteDocument() {
    if (!selectedDocument || !window.confirm(`「${selectedDocument.title}」を削除しますか？\nこの資料のタイトルと本文が削除されます。`)) return;
    onDeleteDocument(selectedDocument.id);
    setSelectedDocument(null);
    requestAnimationFrame(() => heading.current?.focus());
  }
  if (selectedDocument) return <DocumentPage key={documentResetKey} onReset={() => setDocumentResetKey(key => key + 1)} onSave={updateDocument} onDelete={deleteDocument} document={selectedDocument} role={role} onBack={closeDocument} onRoles={onBack} onHome={onHome}/>;

  return <section className="handover-page camp-page" aria-labelledby="camp-title">
    <nav className="activity-breadcrumb" aria-label="パンくず">
      <button onClick={onHome}>ホーム</button><span>/</span>
      <button onClick={onBack}>役職一覧</button><span>/</span><button aria-current="page" onClick={onReset}>{role.name}</button>
    </nav>
    <div className="handover-heading">
      <div><h1 id="camp-title" tabIndex={-1} ref={heading}>{role.name}</h1><p>{role.name}に関する資料と予定（表示確認用のサンプル）</p></div>
      <div className="camp-actions">
        <label className="camp-search"><Search size={17} aria-hidden="true"/>
          <input aria-label={`${role.name}の資料を検索`} placeholder="資料を検索" value={query} onChange={event => setQuery(event.target.value)}/>
        </label>
        <button className="handover-add" aria-expanded={creating} aria-controls="document-create-form" onClick={() => setCreating(true)}>＋ 新規作成</button>
      </div>
    </div>
    {creating && <form id="document-create-form" className="document-create-form" onSubmit={createDocument}>
      <h2>{role.name}の資料を作成</h2>
      <p>再読み込みすると消える一時保存です。</p>
      <label htmlFor="new-document-title">タイトル</label>
      <input ref={titleInput} id="new-document-title" value={title} maxLength={100} onChange={event => setTitle(event.target.value)} required/>
      <label htmlFor="new-document-body">本文</label>
      <textarea id="new-document-body" value={body} onChange={event => setBody(event.target.value)} required rows={8}/>
      {error && <p role="alert">{error}</p>}
      <div><button className="handover-add" type="submit">作成して開く</button><button className="today-button" type="button" onClick={() => { setCreating(false); setTitle(''); setBody(''); setError(''); }}>キャンセル</button></div>
    </form>}
    <section className="handover-card camp-card" aria-labelledby="camp-list-title">
      <div className="camp-list-heading"><h2 id="camp-list-title">資料</h2><p role="status">{documents.length}件</p></div>
      <ul className="camp-list">
        {documents.map(document => <li key={document.id}>
          <div className="camp-document-info"><h3>{<button ref={node => { if (node) documentLinks.current.set(document.id, node); else documentLinks.current.delete(document.id); }} className="document-title-link" onClick={() => setSelectedDocument(document)}>{document.title}</button>}</h3><p>{document.kind} · 更新 {document.updated}</p></div>
          <div className="camp-tags"><span>{document.tag}</span><span className={document.year ? 'camp-year' : 'camp-label'}>{document.label}</span></div>
          <span className="camp-chevron" aria-hidden="true">›</span>
        </li>)}
      </ul>
      {documents.length === 0 && <p className="camp-empty">{roleDocuments.length === 0 ? '資料はまだありません。' : '検索に一致する資料はありません。'}</p>}
    </section>
    <p className="handover-note">初期表示の合宿資料はサンプルです。各資料の本文を開けます。追加した資料は再読み込みすると消えます。編集・削除も一時反映されます。永続保存は今後実装予定です。</p>
    <button className="today-button" onClick={onBack}>‹ 役職一覧に戻る</button>
  </section>;
}