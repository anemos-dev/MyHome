import { RecordAttributionView } from './RecordAttribution';
import { useEffect, useRef } from 'react';
import type { HandoverDocument } from './handoverDocuments';
import type { Role } from './RoleDocumentsPage';

export function DocumentPage({ document, role, onBack, onRoles, onHome }: {
  document: HandoverDocument; role: Role; onBack: () => void; onRoles: () => void; onHome: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  return <section className="handover-page document-page" aria-labelledby="document-title">
    <nav className="activity-breadcrumb" aria-label="パンくず">
      <button onClick={onHome}>ホーム</button><span>/</span>
      <button onClick={onRoles}>役職一覧</button><span>/</span>
      <button onClick={onBack}>{role.name}</button><span>/</span><span>{document.title}</span>
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
      <div className="document-body"><RecordAttributionView record={document}/><h2>{document.title}</h2><p className="document-text">{document.body}</p></div>
    </article>
    <p className="handover-note">追加した資料は再読み込みすると消えます。編集・共有・永続保存は今後実装予定です。</p>
    <button className="today-button" onClick={onBack}>‹ 資料一覧に戻る</button>
  </section>;
}