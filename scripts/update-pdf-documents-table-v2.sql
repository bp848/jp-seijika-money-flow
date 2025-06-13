-- pdf_documents テーブルの更新 (OCR対応)

-- 既存の status CHECK 制約を削除 (新しいステータスを追加するため)
-- まず制約名を確認する必要がある場合があります。
-- 例: ALTER TABLE pdf_documents DROP CONSTRAINT pdf_documents_status_check;
-- 不明な場合は、DB管理ツールで確認するか、以下のクエリで探してください:
-- SELECT conname FROM pg_constraint WHERE conrelid = 'pdf_documents'::regclass AND contype = 'c' AND conname LIKE '%status%';
-- 仮に制約名が 'pdf_documents_status_check' だったとして進めます。
-- 実行前に必ず実際の制約名を確認してください。

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'pdf_documents'::regclass 
        AND contype = 'c' 
        AND conname = 'pdf_documents_status_check' -- この制約名は環境によって異なる可能性があります
    ) THEN
        ALTER TABLE pdf_documents DROP CONSTRAINT pdf_documents_status_check;
    END IF;
END $$;


-- 新しいステータス値を含むように status カラムの CHECK 制約を再定義
ALTER TABLE pdf_documents
ADD CONSTRAINT pdf_documents_status_check_v2 CHECK (status IN (
    'pending_upload',      -- アップロード直後、処理待ち
    'ocr_queued',          -- OCR処理キュー投入
    'ocr_processing',      -- OCR処理中
    'ocr_failed',          -- OCR処理失敗
    'text_extraction_completed', -- OCR成功、テキスト抽出完了
    'indexing_queued',     -- Groqインデックス処理キュー投入
    'indexing_processing', -- Groqインデックス処理中
    'indexing_failed',     -- Groqインデックス処理失敗
    'completed',           -- 全処理完了、検索可能
    'error'                -- 汎用エラー（旧バージョン互換用、段階的に廃止推奨）
));

-- OCRで抽出されたテキストを保存するカラムを追加
ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS ocr_text TEXT;

-- インデックス作成時のエラーメッセージを保存するカラムを追加
ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS indexing_error_message TEXT;

-- status カラムのデフォルト値を 'pending_upload' に変更
ALTER TABLE pdf_documents ALTER COLUMN status SET DEFAULT 'pending_upload';

-- 既存データの status を 'pending_upload' に更新 (必要に応じて)
-- UPDATE pdf_documents SET status = 'pending_upload' WHERE status = 'pending';
-- UPDATE pdf_documents SET status = 'indexing_failed' WHERE status = 'error' AND groq_index_id IS NULL;
-- UPDATE pdf_documents SET status = 'completed' WHERE status = 'completed' AND ocr_text IS NOT NULL; -- 既に処理済みのもの

COMMENT ON COLUMN pdf_documents.status IS 'ドキュメントの処理ステータス: pending_upload, ocr_queued, ocr_processing, ocr_failed, text_extraction_completed, indexing_queued, indexing_processing, indexing_failed, completed';
COMMENT ON COLUMN pdf_documents.ocr_text IS 'OCRによって抽出された生のテキストデータ';
COMMENT ON COLUMN pdf_documents.indexing_error_message IS 'Groqインデックス作成時のエラーメッセージ';
COMMENT ON COLUMN pdf_documents.error_message IS '汎用エラーメッセージ（主にアップロード時やOCR前のエラー）';
