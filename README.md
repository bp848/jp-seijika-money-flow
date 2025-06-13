承知いたしました。PDF関連プログラムの仕様書を以下に提示します。

---

# PDF処理システム仕様書

## 1. 概要

本システムは、PDFドキュメントのアップロード、管理、テキスト抽出、構造化解析（Groq API利用）、データベースへの格納、およびRAG（Retrieval-Augmented Generation）アプリケーション用のベクトルデータ生成までを一貫して行うためのものです。特に、政治資金収支報告書のような定型フォーマットのPDF処理を効率化し、分析可能なデータとして蓄積することを目的としています。

## 2. アーキテクチャ概要

### 2.1. 主要コンポーネント

- **フロントエンド**: Next.js (App Router) と shadcn/ui を使用した管理画面 (`/pdf-manager`)。
- **APIサーバー**: Next.js API Routes。PDF操作、バッチ処理トリガー、チャット機能を提供。
- **データベース**: Supabase PostgreSQL。Prisma ORM を介してアクセス。
- **Blobストレージ**: Vercel Blob。アップロードされたPDFファイルの永続化。
- **AIサービス**:

- Groq API: テキストの構造化解析。
- OpenAI API (または互換API): テキストのベクトル化（将来的な実装）。



- **バッチ処理**: Vercel Cron Jobs と専用APIエンドポイントによる非同期処理。


### 2.2. データフロー

1. **PDFアップロード**:

1. ユーザーが管理画面からPDFをアップロード (`/api/pdf-manager/upload`)。
2. ファイルはVercel Blobに保存され、メタデータ（ファイル名、Blob URL、初期ステータスなど）が`PdfDocument`テーブルに記録される。



2. **同期・キューイング (バッチ処理起点)**:

1. `scripts/sync-and-queue.ts` を実行（手動または専用API経由）。
2. 指定されたCSVファイル (`SEIJI_SHIKIN_CSV_URL` 環境変数で指定) を読み込み、DBに未登録のPDF情報を`PdfDocument`テーブルに `pending_upload` ステータスで登録。



3. **非同期バッチ処理 (Cron Job)**:

1. Vercel Cron Jobが定期的に `/api/cron/process-queue` を呼び出す。
2. APIは処理待ちの`PdfDocument`を少量取得し、`lib/pipeline/processor.ts` の `processSingleDocument` 関数を実行。
3. `processSingleDocument` の処理内容:

1. ステータスを `processing_pipeline` に更新。
2. BlobからPDFをダウンロード。
3. ファイルハッシュを計算し、`PdfDocument`に保存。重複チェックも行う。
4. `pdf-parse` を使用してPDFからテキストを抽出 (`ocr_text` に保存)。ステータス更新。
5. 抽出テキストをGroq APIに送信し、構造化データ（JSON）を取得。

1. **現状**: 取得したJSONの具体的なDBテーブルへのマッピング・保存は未実装。`processor.ts` 内にコメントアウトで将来的な実装箇所を示唆。



6. 抽出テキストをチャンク分割。
7. 各チャンクをベクトル化 (現状はダミーのベクトル生成)。
8. ベクトルデータを `DocumentEmbedding` テーブルに保存。
9. 最終ステータスを `completed` またはエラーに応じて `*_failed` に更新。






4. **データ活用**:

1. 管理画面でPDF情報と処理ステータスを閲覧・管理。
2. `/api/pdf-manager/chat` エンドポイントで、`DocumentEmbedding` を利用したRAGチャット。





## 3. データベーススキーマ (主要テーブル)

### 3.1. `PdfDocument` テーブル

PDFファイル自体のメタデータと処理ステータスを管理。

| カラム名 | 型 | 説明
|-----|-----|-----
| `id` | `String` | UUID (主キー)
| `file_name` | `String` | 元のファイル名
| `blob_url` | `String` | Vercel Blob上のURL (UNIQUE)
| `upload_datetime` | `DateTime?` | アップロード日時 (デフォルト: `now()`)
| `party_name` | `String?` | 政党名 (デフォルト: "不明")
| `region` | `String?` | 地域 (デフォルト: "不明")
| `status` | `PdfDocumentStatus?` | 処理ステータス (Enum, デフォルト: `pending_upload`)
| `error_message` | `String?` | エラー発生時のメッセージ
| `file_size` | `BigInt?` | ファイルサイズ (バイト)
| `groq_index_id` | `String?` | Groq解析結果のID (具体的な用途は未定義)
| `created_at` | `DateTime?` | レコード作成日時 (デフォルト: `now()`)
| `updated_at` | `DateTime?` | レコード更新日時 (`@updatedAt`)
| `ocr_text` | `String?` | PDFから抽出された生テキスト
| `indexing_error_message` | `String?` | インデックス作成時のエラーメッセージ
| `file_hash` | `String` | ファイル内容のSHA-256ハッシュ (UNIQUE)
| `version` | `Int` | ドキュメントバージョン (デフォルト: 1)
| `year` | `Int?` | 報告年 (ファイル名などから抽出想定)
| `party_id` | `Int?` | `PoliticalParty`テーブルへの外部キー (FK)
| `politician_id` | `Int?` | `Politician`テーブルへの外部キー (FK)
| `political_organization_id` | `String?` | `PoliticalOrganization`テーブルへの外部キー (FK, Prismaスキーマで追加)


### 3.2. `DocumentEmbedding` テーブル

抽出されたテキストチャンクとそのベクトル表現を格納。

| カラム名 | 型 | 説明
|-----|-----|-----
| `id` | `String` | UUID (主キー)
| `document_id` | `String?` | `PdfDocument`のID (FK)
| `embedding_vector` | `Json` | テキストチャンクのベクトルデータ (pgvectorの`vector`型想定)
| `chunk_index` | `Int?` | ドキュメント内のチャンクのインデックス
| `chunk_text` | `String?` | テキストチャンクの内容
| `created_at` | `DateTime?` | レコード作成日時
| `updated_at` | `DateTime?` | レコード更新日時


### 3.3. `PdfDocumentStatus` Enum

PDFの処理状態を示す。

- `pending_upload`: アップロード直後、または同期スクリプトによる初期登録状態。
- `duplicate`: ファイルハッシュに基づき重複と判定された状態。
- `processing_pipeline`: バッチ処理パイプラインによる処理中。
- `text_extraction_processing`: テキスト抽出処理中。
- `text_extraction_completed`: テキスト抽出完了。
- `text_extraction_failed`: テキスト抽出失敗。
- `indexing_queued`: インデックス作成待ち（現在は直接使用せず、`text_extraction_completed`から`indexing_processing`へ）。
- `indexing_processing`: チャンク化・ベクトル化処理中。
- `indexing_failed`: インデックス作成失敗。
- `completed`: 全ての処理が正常に完了。


### 3.4. `PoliticalOrganization` および関連テーブル

Groqによる構造化解析結果を格納するためのテーブル群（`AssetDetail`, `AuditDocument`, `ExpenditureDetail`, `FinancialSummary`, `RevenueDetail`など）。これらのテーブルへの具体的なデータマッピングと保存ロジックは、`lib/pipeline/processor.ts`内で現在コメントアウトされており、将来的な実装項目です。

## 4. APIエンドポイント仕様

ベースパス: `/api`

### 4.1. PDFアップロード

- **エンドポイント**: `POST /pdf-manager/upload`
- **リクエスト**: `FormData` (`file`: アップロードするPDFファイル)
- **レスポンス (成功時)**: `201 Created`

```json
{
  "success": true,
  "document": { /* PdfDocumentオブジェクト */ },
  "message": "ファイルが正常にアップロードされました"
}
```


- **処理内容**:

1. ファイルバリデーション（PDF形式、サイズ制限）。
2. Vercel Blobへファイルをアップロード。
3. `PdfDocument`テーブルにメタデータを保存（初期ステータス: `pending_upload`または`pending_hash_check`）。





### 4.2. PDF一覧取得

- **エンドポイント**: `GET /pdf-manager/documents`
- **クエリパラメータ**:

- `page` (数値, オプション): ページ番号 (デフォルト: 1)
- `limit` (数値, オプション): 1ページあたりのアイテム数 (デフォルト: 10 or 20)
- `status` (文字列, オプション): `PdfDocumentStatus` Enumの値でフィルタリング
- `party` (文字列, オプション): 政党名でフィルタリング
- `region` (文字列, オプション): 地域でフィルタリング
- `name` (文字列, オプション): ファイル名で部分一致フィルタリング (API側での実装が必要)



- **レスポンス (成功時)**: `200 OK`

```json
{
  "documents": [ /* PdfDocumentオブジェクトの配列 */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```


- **処理内容**: `PdfDocument`テーブルから条件に合うドキュメントをページネーション付きで取得。


### 4.3. 個別PDFインデックス作成 (テキスト抽出含む)

- **エンドポイント**: `POST /pdf-manager/documents/index`
- **リクエストボディ**:

```json
{
  "documentIds": ["uuid1", "uuid2", ...]
}
```


- **レスポンス (成功時)**: `200 OK`

```json
{
  "success": true,
  "results": [
    { "documentId": "uuid1", "success": true, "indexId": "index_uuid1_timestamp" },
    { "documentId": "uuid2", "success": false, "error": "エラーメッセージ" }
  ],
  "message": "N件のドキュメントのインデックス処理リクエストを受け付けました。"
}
```


- **処理内容**:

1. 指定された各`documentId`について処理。
2. `PdfDocument`の`ocr_text`が未抽出の場合、BlobからPDFをダウンロードしテキスト抽出。結果を`ocr_text`に保存、ステータス更新。
3. ファイルハッシュを計算し、重複チェック。重複時はステータスを`duplicate`に更新。
4. テキスト抽出成功後、テキストをチャンク分割。
5. 各チャンクをベクトル化（現状はダミー）。
6. ベクトルデータを`DocumentEmbedding`テーブルに保存。
7. `PdfDocument`のステータスを`completed`またはエラーに応じて更新。





### 4.4. RAGチャット

- **エンドポイント**: `POST /pdf-manager/chat`
- **リクエストボディ**:

```json
{
  "messages": [ /* AI SDK CoreMessageオブジェクトの配列 */ ],
  "sessionId": "optional-session-uuid"
}
```


- **レスポンス (成功時)**: AI SDK `StreamingTextResponse`
- **処理内容**:

1. ユーザーの最新メッセージを取得。
2. メッセージをベクトル化（`getQueryEmbedding`、現状ダミー）。
3. `DocumentEmbedding`テーブルから類似ベクトルを持つチャンクを検索（`findRelevantChunks`、現状ダミー）。
4. 検索結果をコンテキストとして、OpenAI API (gpt-4o) にプロンプトを送信。
5. 結果をストリーミングで返し、チャット履歴を`ChatSession`, `ChatMessage`テーブルに保存。





### 4.5. Cron Job用キュー処理API

- **エンドポイント**: `GET /api/cron/process-queue`
- **認証**: `Authorization: Bearer ${CRON_SECRET}` ヘッダーが必要。
- **レスポンス (成功時)**: `200 OK`

```json
{
  "success": true,
  "results": [ /* 各ドキュメントの処理結果オブジェクトの配列 */ ]
  // または "message": "No documents to process."
}
```


- **処理内容**:

1. `PdfDocument`テーブルから処理待ちのドキュメントを少量取得（例: `status`が`pending_upload`, `text_extraction_failed`, `indexing_failed`のもの）。
2. 取得した各ドキュメントIDに対して `lib/pipeline/processor.ts` の `processSingleDocument` を呼び出し、フルパイプライン処理を実行。





## 5. 主要な処理ロジック詳細

### 5.1. テキスト抽出

- ライブラリ: `pdf-parse`
- 処理: BlobからダウンロードしたPDFファイルのバッファを`pdf-parse`に渡し、テキストコンテンツを取得。


### 5.2. Groqによる構造化解析

- サービス: Groq API (Model: `llama3-70b-8192`)
- プロンプト: 政治資金収支報告書のフォーマットを意識したシステムプロンプトと、OCRテキストをユーザーメッセージとして送信。JSON形式での出力を要求。
- **現状の課題**: 解析結果のJSONを具体的なDBテーブル（`PoliticalOrganization`等）にマッピングし、永続化するロジックは未実装。`lib/pipeline/processor.ts`内の`// ... logic to upsert into political_organizations, financial_summaries, etc.`部分が該当。


### 5.3. チャンク分割とベクトル化

- チャンク分割: `splitTextIntoChunks`関数。固定サイズ（例: 1000文字）とオーバーラップ（例: 100文字）でテキストを分割。
- ベクトル化: `generateEmbeddingsForChunks`関数。現状はダミーベクトルを生成。将来的にはOpenAI Embeddings API等を利用。


### 5.4. 重複チェック

- 方法: PDFファイル内容のSHA-256ハッシュ値を計算。
- タイミング:

- 個別インデックス作成時 (`/api/pdf-manager/documents/index`)。
- `sync-from-blob` APIによる新規登録時。
- アップロードAPI (`/api/pdf-manager/upload`) でも将来的には実装推奨。



- 処理: 計算したハッシュ値が`PdfDocument`テーブルの`file_hash`カラムに既に存在する場合、ステータスを`duplicate`に更新。


## 6. フロントエンド機能 (`app/pdf-manager/page.tsx`)

- **PDF一覧表示**:

- `DataTable`コンポーネントを使用。
- 表示項目: ファイル名、ステータス、アップロード日時、政党名、地域、ファイルサイズ、ハッシュ値。
- ページネーション。



- **フィルタリング**:

- ファイル名（部分一致）、ステータスによる絞り込みUI。API連携は一部実装。



- **PDFアップロード**:

- `PdfUploadForm`コンポーネント。ファイル選択、進捗表示、アップロード実行。



- **個別アクション**:

- 各PDF行にドロップダウンメニュー。
- 「インデックス作成」: `/api/pdf-manager/documents/index`を呼び出し。
- 「ドキュメントIDコピー」、「ファイルを開く」。



- **Blobストレージと同期 (新規追加想定)**:

- テキストエリアにBlob URLリストを貼り付け、「同期実行」ボタンで`/api/pdf-manager/documents/sync-from-blob`を呼び出すUI (前回の会話で作成)。





## 7. バッチ処理パイプライン

### 7.1. 同期・キューイングスクリプト (`scripts/sync-and-queue.ts`)

- 役割: 指定されたCSVファイル（政治資金PDFのリスト）を読み込み、DBに未登録のPDF情報を`PdfDocument`テーブルに初期ステータスで登録（キューイング）。
- 実行: 手動実行（`pnpm run script scripts/sync-and-queue.ts`）または専用APIエンドポイントからトリガー。
- 前提: CSV内のファイル名からBlob URLを構築できること。`SEIJI_SHIKIN_CSV_URL`環境変数でCSVの場所を指定。


### 7.2. Cron Jobによる非同期処理

- トリガー: Vercel Cron Jobが設定されたスケジュール（例: `* * * * *` で毎分）で`/api/cron/process-queue`をGETリクエスト。
- 処理: APIは処理待ちのドキュメントを少量取得し、`processSingleDocument`関数で1件ずつ処理。
- 目的: 長時間実行される可能性のある処理を、サーバーレス関数の実行時間制限内で分割実行し、システム全体のスループットを確保。


## 8. 主要な環境変数

- `DATABASE_URL` / `POSTGRES_PRISMA_URL`: Prismaが使用するSupabase PostgreSQLの接続URL。
- `POSTGRES_URL_NON_POOLING`: Prismaマイグレーション用などの直接接続URL。
- `GROQ_API_KEY`: Groq APIの認証キー。
- `CRON_SECRET`: Cron Job APIの認証用シークレットキー。
- `SEIJI_SHIKIN_CSV_URL`: `sync-and-queue.ts`スクリプトが参照するPDFリストCSVのURL。
- `BLOB_READ_WRITE_TOKEN`: Vercel Blobへのアクセス用トークン (通常Vercelが自動設定)。
- (将来的に) `OPENAI_API_KEY`: OpenAI Embeddings API用。


## 9. 今後の拡張性・課題

- **Groq解析結果のDB保存**: `lib/pipeline/processor.ts`内の構造化データ（政治資金収支報告書の詳細項目）を、`PoliticalOrganization`および関連テーブルへマッピングし保存するロジックの実装。
- **高度なエラーハンドリングとリトライ**: バッチ処理中の個別エラーに対するリトライ機構、エラー原因の詳細なロギング。
- **ベクトル化処理の本格実装**: `generateEmbeddingsForChunks`に実際のベクトル化API（OpenAIなど）呼び出しを実装。
- **管理画面の機能強化**:

- 一括アクション（複数PDF選択してインデックス作成、削除など）。
- より詳細なフィルタリング・ソートオプション。
- 処理進捗のリアルタイム表示。



- **Blobストレージの全自動スキャン**: Vercel Blob APIの`list()`機能の制限（最大1000件、ページネーション）を考慮しつつ、DBとBlobストレージ間の差分をより自動的に検出する仕組みの検討。
- **セキュリティ**: APIエンドポイントの認証・認可強化。
- **パフォーマンス**: 大量データ処理時のDBクエリ最適化、API応答速度の改善。


---
