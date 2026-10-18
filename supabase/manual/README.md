# メンバー権限の手動セットアップ記録

このフォルダーはSupabase SQL Editorで実行したSQLの記録です。自動マイグレーションではなく、既存のmigrationsとは別に管理しています。

## 新しいDBの準備

既存のsupabase/migrationsにある基礎テーブル・profilesを準備し、次の順で一度ずつ実行してください。

1. 01_membership_roles.sql
2. 02_change_member_role.sql
3. member_permission_list.sql

myhome-devには3つとも手動適用済みです。既存DBには再実行しないでください。特に01は初回だけ作成者を管理者にする処理なので、再適用すると意図した役割変更を上書きするおそれがあります。

初回管理者になるには、circles.created_byのユーザーがcircle_membershipsにも所属済みである必要があります。新規サークル作成・管理者の初回登録は今回の画面の対象外です。

## アクセス制御

- list_my_circles: 自分の所属サークルと自分の権限だけ返す。
- list_circle_members: 同じサークルのadminだけが一覧とプロフィール表示名を取得できる。
- change_member_role: 同じサークルのadminだけが権限を変更できる。
- 変更時はcirclesの行をロックし、最後のadminをmemberに変更する操作を拒否する。
- 内部のSECURITY DEFINER関数はmyhome_privateに置き、auth.uid()から呼び出し元を確認する。search_pathは空。PUBLIC/anonの実行権限は取り除く。
- myhome_privateはData APIの公開スキーマに追加しない。外部にはpublicのSECURITY INVOKER関数を入口として公開する。
- authenticated/anonへ所属テーブルの直接更新権限を追加しない。管理ツールやservice_roleで直接変更する運用は、このRPCの保護対象外。
- 部長・会計等の役職と、admin/memberの権限は別。

## 確認済み

- 既存のサークルでadmin 1名、member 3名の初期設定を確認。
- ログイン済み管理者で、所属サークル・メンバー4名の一覧表示を確認。
- 唯一の管理者について、画面の降格ボタンが無効になることを確認。
- npm run build / git diff --check成功。

## 残る確認

- 本人確認した対象者を昇格・降格し、再取得・再読み込み後も反映されること。
- memberセッションから直接RPCを呼んでも一覧・権限変更が拒否されること。
- 未所属のサークル、無効なrole、未ログインからの操作拒否。
- 最後の管理者の降格をRPCへ直接要求しても拒否されること。
- 2管理者による同時降格でも、管理者が0名にならないこと。
- 適用後のSupabase Security Advisorの確認。

SQL Editorのpostgresロールでの成功だけでは、利用者の認可テストをしたことにはなりません。DBの実際の権限変更はまだ未検証です。メンバー名はprofiles未登録の場合「名前未設定」と表示されるため、変更前にユーザーIDで本人を確認してください。