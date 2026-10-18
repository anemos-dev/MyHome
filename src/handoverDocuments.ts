import type { RecordAttribution } from './RecordAttribution';
export type HandoverDocument = {
  id: string; roleId: string; title: string; body: string; kind: string;
  updated: string; tag: string; label: string; year: boolean; sample: boolean;
} & RecordAttribution;

export const initialDocuments: HandoverDocument[] = [
  { id: 'summer-plan', roleId: 'camp', title: '夏合宿予定', body: '2026年の夏予定\n\n夏合宿の予定\n今年の夏合宿に向けた予定と準備内容をまとめます。\n日程や持ち物、当日の流れをここに記録します。\n\n予定メモ\n参加人数や集合場所を確認して、準備を進めましょう。', kind: '予定表', updated: '8月27日', tag: '予定', label: '2026', year: true, sample: true },
  ...[
    ['summer-guide', '夏合宿のやり方', 'ガイド', '8月24日', 'ガイド', '準備'],
    ['timetable', '当日のタイムテーブル', '資料', '8月21日', '当日', '2026'],
    ['packing', '持ち物リスト', 'チェックリスト', '8月18日', '準備', '持ち物'],
    ['winter-plan', '冬旅行の計画', '資料', '8月15日', '旅行', '2025'],
  ].map(([id, title, kind, updated, tag, label]) => ({ id, roleId: 'camp', title, kind, updated, tag, label, year: /^\d{4}$/.test(label), sample: true, body: '表示確認用のサンプルです。この資料の本文はまだ登録されていません。' })),
];