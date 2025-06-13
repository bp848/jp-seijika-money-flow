# Vercel統合セットアップガイド

## 概要

このプロジェクトでは以下のVercel統合を使用しています：

1. **Supabase** - データベースとリアルタイム機能
2. **Vercel Blob** - ファイルストレージ
3. **Groq** - AI推論とベクトル埋め込み

## 環境変数の確認

以下の環境変数が正しく設定されていることを確認してください：

### Supabase
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Vercel Blob
\`\`\`
BLOB_READ_WRITE_TOKEN=your_blob_token
\`\`\`

### Groq
\`\`\`
GROQ_API_KEY=your_groq_api_key
\`\`\`

## データベースセットアップ

1. Supabaseプロジェクトで以下のSQLスクリプトを実行：
   - `scripts/create-pdf-documents-table.sql`
   - `scripts/create-chat-sessions-table.sql`
   - `scripts/update-pdf-documents-table-v3.sql`
   - `scripts/create-vector-embeddings-table.sql`

2. Row Level Security (RLS) の設定（必要に応じて）

## 機能テスト

### 1. PDFアップロード
- 管理画面 → PDF文書管理 → アップロード
- 4.5MB以下のPDFファイルをテスト

### 2. OCR処理
- アップロード後、文書管理タブで「処理開始」をクリック
- ステータスが「OCR処理中」→「OCR完了」→「インデックス処理中」→「完了」と変化することを確認

### 3. AI検索
- AI検索タブで質問を入力
- Groq APIを使用した応答が返されることを確認

## トラブルシューティング

### よくある問題

1. **アップロードエラー**
   - BLOB_READ_WRITE_TOKENが正しく設定されているか確認
   - ファイルサイズが4.5MB以下か確認

2. **OCR処理エラー**
   - Node.jsの依存関係（tesseract.js, sharp, pdf-to-png-converter）が正しくインストールされているか確認
   - メモリ制限に達していないか確認

3. **AI応答エラー**
   - GROQ_API_KEYが正しく設定されているか確認
   - Groq APIの利用制限に達していないか確認

4. **データベースエラー**
   - Supabaseの接続情報が正しいか確認
   - 必要なテーブルが作成されているか確認

### ログの確認

Vercelダッシュボードの「Functions」タブでAPI関数のログを確認できます。

### パフォーマンス最適化

1. **OCR処理の最適化**
   - 大きなPDFファイルは分割処理を検討
   - 並列処理の制限を設定

2. **AI応答の最適化**
   - コンテキストテキストの長さを制限
   - キャッシュ機能の実装を検討

3. **データベースの最適化**
   - 適切なインデックスの設定
   - クエリの最適化

## セキュリティ考慮事項

1. **APIキーの管理**
   - 環境変数として安全に保存
   - 定期的なローテーション

2. **ファイルアップロード**
   - ファイルタイプの検証
   - ファイルサイズの制限
   - ウイルススキャンの検討

3. **データベースアクセス**
   - Row Level Securityの適切な設定
   - 最小権限の原則

## 本番環境への展開

1. **環境変数の設定**
   - 本番用の環境変数を設定
   - 開発環境と本番環境の分離

2. **モニタリング**
   - エラー監視の設定
   - パフォーマンス監視の設定

3. **バックアップ**
   - データベースの定期バックアップ
   - ファイルストレージのバックアップ

## サポート

技術的な問題が発生した場合：

1. まずこのドキュメントのトラブルシューティングセクションを確認
2. Vercelダッシュボードでログを確認
3. 各統合サービスのドキュメントを参照
4. 必要に応じてサポートチームに連絡
