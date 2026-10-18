# MyHome

サークルの引き継ぎアプリです。

## 開発

Node.js 22.12 以上（または 20.19 以上の Node.js 20）と npm を使用します。

```sh
npm ci
npm run dev
```

`npm run build` で TypeScript の型チェックと本番用ビルド、`npm run preview` でビルド結果の確認ができます。
キャッシュ保存先に書き込めない環境では `npm ci --cache /tmp/myhome-npm-cache` を使用してください。

## 現在の実装

React + TypeScript + Vite で、提供された Home Calendar UI のホーム画面とメニューを再現しています。
初期表示はデザインに合わせた 2026 年 1 月です。月切り替え、今日ボタン、日付選択、予定検索、カレンダー区分の表示切り替え、活動記録画面への遷移、メニューの開閉に対応しています。

予定・ユーザー情報はサンプルです。Google 認証、データ保存、設定画面は未実装です。活動記録画面の本文は表示確認用のサンプルです。未実装のリンクは通知を表示します。
画像のカレンダーと右側の予定一覧にあった日付の不一致は、共通の予定データから描画して解消しています。

## GitHub Pages での画面公開

`.github/workflows/deploy.yml` により、main への push（PR のマージを含む）でビルドと公開が自動実行されます。
作業ブランチへの push では公開画面は更新されません。

初回のみ、リポジトリの Settings → Pages → Build and deployment → Source を GitHub Actions に設定してください。
設定変更にはリポジトリの管理権限が必要です。設定ファイルを main にマージした後、Actions の Deploy to GitHub Pages が成功すると公開されます。
必要に応じて、main 上のワークフローを Run workflow から再実行できます。

公開予定 URL: https://anemos-dev.github.io/MyHome/

Vite の base はリポジトリ名に合わせて `/MyHome/` です。ローカル開発時も、ターミナルに表示される `/MyHome/` 付き URL を開きます。
リポジトリ名や公開先を変更する場合は、vite.config.ts の base も見直してください。
公開は画面確認用で、認証・保存機能は追加されません。