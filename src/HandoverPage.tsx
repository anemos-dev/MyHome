import { useEffect, useRef } from 'react';

const sampleRoles = ['代表', '副代表', '会計', '合宿'];

export function HandoverPage({ onHome }: { onHome: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  return <section className="handover-page" aria-labelledby="handover-title">
    <nav className="activity-breadcrumb" aria-label="パンくず">
      <button onClick={onHome}>ホーム</button><span>/</span><span>引き継ぎ</span>
    </nav>
    <div className="handover-heading">
      <div>
        <h1 id="handover-title" tabIndex={-1} ref={heading}>役職を選択</h1>
        <p>登録されている役職（表示確認用のサンプル）</p>
      </div>
      <button className="handover-add" disabled>＋ 役職を追加</button>
    </div>
    <section className="handover-card" aria-labelledby="role-list-title">
      <div className="handover-list-heading"><h2 id="role-list-title">役職一覧</h2><p>{sampleRoles.length}件</p></div>
      <ul className="handover-list">
        {sampleRoles.map(role => <li key={role}>
          <span>{role}</span>
          <button className="handover-remove" disabled aria-label={`${role}を削除`}>−</button>
        </li>)}
      </ul>
    </section>
    <p className="handover-note">役職の選択・追加・削除、資料の表示・保存は今後実装予定です。</p>
    <button className="today-button" onClick={onHome}>‹ ホームに戻る</button>
  </section>;
}