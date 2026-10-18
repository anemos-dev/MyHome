import { createContext, useContext } from 'react';

// 認証接続前の、画面確認用ユーザーID。
export const currentUserId = 'sample-current-user';
export const ProfileContext = createContext({ userId: currentUserId, displayName: 'Akira Kimura' });
export type RecordAttribution = { createdBy?: string; createdAt?: string; updatedBy?: string; updatedAt?: string };
export function RecordAttributionView({ record }: { record: RecordAttribution }) {
  const profile = useContext(ProfileContext);
  const name = (id?: string) => id === profile.userId ? profile.displayName : '不明（サンプル）';
  const date = (value?: string) => value ? new Date(value).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '不明';
  return <dl className="record-attribution">
    <div><dt>作成者</dt><dd>{name(record.createdBy)}</dd></div>
    {record.createdAt && <div><dt>作成日時</dt><dd>{date(record.createdAt)}</dd></div>}
    {record.updatedBy && <><div><dt>最終更新者</dt><dd>{name(record.updatedBy)}</dd></div><div><dt>更新日時（日本時間）</dt><dd>{date(record.updatedAt)}</dd></div></>}
  </dl>;
}