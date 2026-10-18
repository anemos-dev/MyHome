import { useEffect, useRef, useState } from 'react';
import { Archive, Download, Upload, Trash2, UserX } from 'lucide-react';

const dataTargets = ['予定', '活動記録', '引き継ぎ資料', '役職'] as const;
type DataTarget = typeof dataTargets[number];
type Member = { id: string; name: string; role: string; self?: boolean };
const sampleMembers: Member[] = [
  { id: 'akira', name: 'Akira Kimura', role: '代表・管理者', self: true },
  { id: 'mina', name: 'Mina Sato', role: '副代表' },
  { id: 'kenta', name: 'Kenta Ito', role: '会計' },
  { id: 'yui', name: 'Yui Tanaka', role: 'メンバー' },
];
// 確認ダイアログの対象。データ削除はサークル名の入力を求める
type Pending = { kind: 'delete'; targets: DataTarget[] } | { kind: 'remove'; member: Member } | null;

export function DataManagementPage({ circleName, onHome, onNotice }: { circleName: string; onHome: () => void; onNotice: (message: string) => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [lastBackup, setLastBackup] = useState('2026年1月8日 18:00');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportTargets, setExportTargets] = useState<DataTarget[]>([...dataTargets]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<DataTarget[]>([]);
  const [members, setMembers] = useState(sampleMembers);
  const [pending, setPending] = useState<Pending>(null);
  const [confirmText, setConfirmText] = useState('');
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => { if (pending) dialog.current?.showModal(); else dialog.current?.close(); }, [pending]);

  function toggle(list: DataTarget[], target: DataTarget) {
    return list.includes(target) ? list.filter(t => t !== target) : [...list, target];
  }
  function backup() {
    setLastBackup(new Date().toLocaleString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    onNotice('バックアップを作成しました（表示確認用のサンプルです）。');
  }
  function closeDialog() { setPending(null); setConfirmText(''); }
  function confirm() {
    if (!pending) return;
    if (pending.kind === 'delete') {
      onNotice(`${pending.targets.join('・')}を削除しました（表示確認用のサンプルのため、実際には削除されません）。`);
      setDeleteTargets([]);
    } else {
      setMembers(previous => previous.filter(m => m.id !== pending.member.id));
      onNotice(`${pending.member.name}さんをサークルから追放しました（再読み込みすると元に戻ります）。`);
    }
    closeDialog();
  }

  return <section className="data-page" aria-labelledby="data-title">
    <nav className="activity-breadcrumb" aria-label="パンくず"><button onClick={onHome}>‹ ホーム</button><span>/</span><span>データ管理</span></nav>
    <div className="data-heading">
      <h1 id="data-title" tabIndex={-1} ref={heading}>データ管理</h1>
      <span className="admin-badge">管理者</span>
    </div>
    <p className="activity-subtitle">{circleName}のデータとメンバーを管理します <span className="activity-sample-note">（表示確認用のサンプル・実際のデータは変更されません）</span></p>

    <div className="data-grid">
      <section className="data-card" aria-labelledby="backup-title">
        <div className="data-card-heading"><span className="data-icon" aria-hidden="true"><Archive size={18}/></span><div><h2 id="backup-title">バックアップ</h2><p>サークルの全データの複製を作成します。</p></div></div>
        <p className="data-meta">最終バックアップ：{lastBackup}</p>
        <button className="data-primary" onClick={backup}>今すぐバックアップ</button>
      </section>

      <section className="data-card" aria-labelledby="export-title">
        <div className="data-card-heading"><span className="data-icon" aria-hidden="true"><Download size={18}/></span><div><h2 id="export-title">エクスポート</h2><p>選んだデータをファイルとして書き出します。</p></div></div>
        <fieldset className="data-options"><legend>対象</legend>{dataTargets.map(target => <label key={target}><input type="checkbox" checked={exportTargets.includes(target)} onChange={() => setExportTargets(old => toggle(old, target))}/>{target}</label>)}</fieldset>
        <label className="data-select">形式<select value={exportFormat} onChange={e => setExportFormat(e.target.value as 'json' | 'csv')}><option value="json">JSON</option><option value="csv">CSV</option></select></label>
        <button className="data-primary" disabled={!exportTargets.length} onClick={() => onNotice(`${exportTargets.join('・')}を${exportFormat.toUpperCase()}で書き出す機能は今後実装予定です。`)}>エクスポート</button>
      </section>

      <section className="data-card" aria-labelledby="import-title">
        <div className="data-card-heading"><span className="data-icon" aria-hidden="true"><Upload size={18}/></span><div><h2 id="import-title">インポート</h2><p>エクスポートしたファイルからデータを読み込みます。</p></div></div>
        <label className="data-file"><input type="file" accept=".json,.csv" onChange={e => setImportFile(e.target.files?.[0] ?? null)}/><span>{importFile ? importFile.name : 'ファイルを選択（JSON / CSV）'}</span></label>
        <button className="data-primary" disabled={!importFile} onClick={() => onNotice(`${importFile?.name} を読み込む機能は今後実装予定です。`)}>インポート</button>
      </section>

      <section className="data-card data-danger" aria-labelledby="delete-title">
        <div className="data-card-heading"><span className="data-icon" aria-hidden="true"><Trash2 size={18}/></span><div><h2 id="delete-title">データ削除</h2><p>選んだデータを完全に削除します。元に戻せません。</p></div></div>
        <fieldset className="data-options"><legend>削除するデータ</legend>{dataTargets.map(target => <label key={target}><input type="checkbox" checked={deleteTargets.includes(target)} onChange={() => setDeleteTargets(old => toggle(old, target))}/>{target}</label>)}</fieldset>
        <button className="data-danger-button" disabled={!deleteTargets.length} onClick={() => setPending({ kind: 'delete', targets: deleteTargets })}>選んだデータを削除</button>
      </section>

      <section className="data-card data-members" aria-labelledby="members-title">
        <div className="data-card-heading"><span className="data-icon" aria-hidden="true"><UserX size={18}/></span><div><h2 id="members-title">メンバーの追放</h2><p>サークルからメンバーを外します。追放されたメンバーはサークルのデータを見られなくなります。</p></div></div>
        <ul className="member-list">{members.map(member => <li key={member.id}>
          <span className="avatar" aria-hidden="true">{member.name.split(' ').map(p => p[0]).join('')}</span>
          <span className="member-info"><strong>{member.name}{member.self && <small>（あなた）</small>}</strong><small>{member.role}</small></span>
          <button className="data-danger-button" disabled={member.self} onClick={() => setPending({ kind: 'remove', member })} aria-label={`${member.name}さんを追放`}>追放</button>
        </li>)}</ul>
      </section>
    </div>

    <dialog ref={dialog} className="data-dialog" aria-labelledby="data-dialog-title" onCancel={e => { e.preventDefault(); closeDialog(); }}>
      {pending?.kind === 'delete' && <>
        <h2 id="data-dialog-title">データを削除しますか？</h2>
        <p>{pending.targets.join('・')}を完全に削除します。この操作は元に戻せません。</p>
        <label className="data-confirm-input">確認のためサークル名「{circleName}」を入力してください<input value={confirmText} onChange={e => setConfirmText(e.target.value)} autoComplete="off"/></label>
      </>}
      {pending?.kind === 'remove' && <>
        <h2 id="data-dialog-title">{pending.member.name}さんを追放しますか？</h2>
        <p>{pending.member.name}さん（{pending.member.role}）は{circleName}のデータを見られなくなります。</p>
      </>}
      <div className="data-dialog-actions">
        <button className="today-button" onClick={closeDialog}>キャンセル</button>
        <button className="data-danger-button" disabled={pending?.kind === 'delete' && confirmText !== circleName} onClick={confirm}>{pending?.kind === 'remove' ? '追放する' : '削除する'}</button>
      </div>
    </dialog>
  </section>;
}
