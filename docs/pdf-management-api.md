# PDF管理システム API仕様書

## 概要

政治資金収支報告書PDFの管理、インデックス化、AI検索機能を提供するAPIシステムです。

## エンドポイント一覧

### 1. PDFアップロード

**POST** `/api/pdf/upload`

政治資金収支報告書PDFファイルをBlobストレージにアップロードし、メタ情報をデータベースに保存します。

#### リクエスト
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field

#### レスポンス
\`\`\`json
{
  "success": true,
  "document": {
    "id": "uuid",
    "file_name": "filename.pdf",
    "blob_url": "https://blob.url",
    "party_name": "自動抽出された政党名",
    "region": "自動抽出された地域名",
    "status": "pending"
  },
  "message": "ファイルが正常にアップロードされました"
}
\`\`\`

#### エラーレスポンス
- 400: ファイルが見つからない、サイズ超過、PDF以外
- 409: 重複ファイル
- 500: サーバーエラー

### 2. PDF一覧取得

**GET** `/api/pdf/list`

アップロード済みPDFファイルの一覧を取得します。

#### クエリパラメータ
- `page`: ページ番号 (default: 1)
- `limit`: 1ページあたりの件数 (default: 20)
- `status`: ステータスフィルタ (pending/indexing/completed/error/all)
- `party`: 政党フィルタ
- `region`: 地域フィルタ

#### レスポンス
\`\`\`json
{
  "documents": [
    {
      "id": "uuid",
      "file_name": "filename.pdf",
      "blob_url": "https://blob.url",
      "upload_datetime": "2024-12-09T10:30:00Z",
      "party_name": "政党名",
      "region": "地域名",
      "status": "completed",
      "file_size": 1234567,
      "groq_index_id": "index_id"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
\`\`\`

### 3. PDFインデックス化

**POST** `/api/pdf/index`

指定されたPDFファイルをGroq APIを使用してテキスト抽出・ベクトル化します。

#### リクエスト
\`\`\`json
{
  "documentIds": ["uuid1", "uuid2", "uuid3"]
}
\`\`\`

#### レスポンス
\`\`\`json
{
  "success": true,
  "results": [
    {
      "documentId": "uuid1",
      "success": true,
      "indexId": "groq_index_id"
    },
    {
      "documentId": "uuid2",
      "success": false,
      "error": "エラーメッセージ"
    }
  ],
  "message": "2件のドキュメントの処理が完了しました"
}
\`\`\`

### 4. AI検索チャット

**POST** `/api/chat`

インデックス済みPDF文書に対してAIを使用した質問応答を行います。

#### リクエスト
\`\`\`json
{
  "message": "ユーザーの質問",
  "sessionId": "session_uuid" // オプション
}
\`\`\`

#### レスポンス
\`\`\`json
{
  "success": true,
  "response": "AIの回答",
  "sessionId": "session_uuid",
  "sourceDocuments": [
    {
      "file_name": "filename.pdf",
      "party_name": "政党名",
      "region": "地域名",
      "groq_index_id": "index_id"
    }
  ]
}
\`\`\`

## データベーススキーマ

### pdf_documents テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PRIMARY KEY | 自動生成ID |
| file_name | TEXT | NOT NULL | ファイル名 |
| blob_url | TEXT | NOT NULL | Blobストレージ上のURL |
| upload_datetime | TIMESTAMP | DEFAULT NOW() | アップロード日時 |
| party_name | TEXT | DEFAULT '不明' | 政党名 |
| region | TEXT | DEFAULT '不明' | 地域名 |
| status | TEXT | CHECK制約 | pending/indexing/completed/error |
| error_message | TEXT | NULLABLE | エラーメッセージ |
| file_size | BIGINT | | ファイルサイズ（バイト） |
| groq_index_id | TEXT | NULLABLE | GroqインデックスID |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

### chat_sessions テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PRIMARY KEY | セッションID |
| session_name | TEXT | NOT NULL | セッション名 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

### chat_messages テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PRIMARY KEY | メッセージID |
| session_id | UUID | FOREIGN KEY | セッションID |
| message_type | TEXT | CHECK制約 | user/assistant |
| content | TEXT | NOT NULL | メッセージ内容 |
| source_documents | JSONB | NULLABLE | 参照文書情報 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

## エラーハンドリング

### HTTPステータスコード
- 200: 成功
- 400: リクエストエラー
- 401: 認証エラー
- 403: 権限エラー
- 404: リソースが見つからない
- 409: 競合（重複など）
- 500: サーバーエラー

### エラーレスポンス形式
\`\`\`json
{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE",
  "details": "詳細情報（オプション）"
}
\`\`\`

## セキュリティ

### 認証・認可
- 管理画面へのアクセスには認証が必要
- APIキーによる認証（将来実装）
- ファイルアップロード時のサイズ・形式チェック

### ファイル検証
- PDFファイル形式の厳密チェック
- ファイルサイズ制限（4.5MB）
- ウイルススキャン（推奨）

### データ保護
- Blobストレージの適切なアクセス制御
- データベース接続の暗号化
- 機密情報のログ出力禁止

## パフォーマンス

### 最適化項目
- 大量ファイルアップロード時の並列処理
- インデックス化の非同期処理
- データベースクエリの最適化
- CDNによるファイル配信

### 制限事項
- 同時アップロード数: 10ファイル
- インデックス化キュー: 100件
- API呼び出し制限: 1000回/時間

## 運用・監視

### ログ出力
- アップロード処理ログ
- インデックス化処理ログ
- API呼び出しログ
- エラーログ

### 監視項目
- ファイルアップロード成功率
- インデックス化処理時間
- API応答時間
- ストレージ使用量

## 今後の拡張予定

### Phase 1: 基本機能強化
- バッチ処理の最適化
- エラー処理の改善
- UI/UXの向上

### Phase 2: 高度な検索機能
- セマンティック検索
- ファセット検索
- 検索結果のランキング

### Phase 3: 分析機能
- 文書間の関連性分析
- トレンド分析
- 可視化ダッシュボード
