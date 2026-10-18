import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

const sampleDocuments = [
  { title: '夏合宿予定', kind: '予定表', updated: '8月27日', tag: '予定', label: '2026', year: true },
  { title: '夏合宿のやり方', kind: 'ガイド', updated: '8月24日', tag: 'ガイド', label: '準備', year: false },
  { title: '当日のタイムテーブル', kind: '資料', updated: '8月21日', tag: '当日', label: '2026', year: true },
  { title: '持ち物リスト', kind: 'チェックリスト', updated: '8月18日', tag: '準備', label: '持ち物', year: false },
  { title: '冬旅行の計画', kind: '資料', updated: '8月15日', tag: '旅行', label: '2025', year: true },
];

export type Role = { id: string; name: string };

export function RoleDocumentsPage({ role, onBack, onHome }: { role: Role; onBack: () => void; onHome: () => void }) {
  const [query, setQuery] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const roleDocuments = role.id === 'camp' ? sampleDocuments : [];
  const documents = roleDocuments.filter(document => document.title.includes(query.trim()));

  return <section className="handover-page camp-page" aria-labelledby="camp-title">
    <nav className="activity-breadcrumb" aria-label="パンくず">
      <button onClick={onHome}>ホーム</button><span>/</span>
      <button onClick={onBack}>役職一覧</button><span>/</span><span>{role.name}</span>
    </nav>
    <div className="handover-heading">
      <div><h1 id="camp-title" tabIndex={-1} ref={heading}>{role.name}</h1><p>{role.name}に関する資料と予定（表示確認用のサンプル）</p></div>
      <div className="camp-actions">
        <label className="camp-search"><Search size={17} aria-hidden="true"/>
          <input aria-label={`${role.name}の資料を検索`} placeholder="資料を検索" value={query} onChange={event => setQuery(event.target.value)}/>
        </label>
        <button className="handover-add" disabled>＋ 新規作成</button>
      </div>
    </div>
    <section className="handover-card camp-card" aria-labelledby="camp-list-title">
      <div className="camp-list-heading"><h2 id="camp-list-title">資料</h2><p role="status">{documents.length}件</p></div>
      <ul className="camp-list">
        {documents.map(document => <li key={document.title}>
          <div className="camp-document-info"><h3>{document.title}</h3><p>{document.kind} · 更新 {document.updated}</p></div>
          <div className="camp-tags"><span>{document.tag}</span><span className={document.year ? 'camp-year' : 'camp-label'}>{document.label}</span></div>
          <span className="camp-chevron" aria-hidden="true">›</span>
        </li>)}
      </ul>
      {documents.length === 0 && <p className="camp-empty">{roleDocuments.length === 0 ? '資料はまだありません。' : '検索に一致する資料はありません。'}</p>}
    </section>
    <p className="handover-note">資料名・更新日・タグはサンプルです。資料の本文表示・新規作成・編集・保存は今後実装予定です。</p>
    <button className="today-button" onClick={onBack}>‹ 役職一覧に戻る</button>
  </section>;
}