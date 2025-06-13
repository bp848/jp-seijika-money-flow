-- pdf_documents テーブルの更新 (v3 - データ移行対応版)

BEGIN;

-- ステップ1: 既存のCHECK制約を削除
DO $$
BEGIN
    -- v2の制約が存在すれば削除
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'pdf_documents'::regclass AND contype = 'c' AND conname = 'pdf_documents_status_check_v2'
    ) THEN
        ALTER TABLE pdf_documents DROP CONSTRAINT pdf_documents_status_check_v2;
    END IF;
    
    -- v1の制約が存在すれば削除
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'pdf_documents'::regclass AND contype = 'c' AND conname = 'pdf_documents_status_check'
    ) THEN
        ALTER TABLE pdf_documents DROP CONSTRAINT pdf_documents_status_check;
    END IF;
END $$;

-- ステップ2: 新しいカラムを追加 (まだ存在しない場合)
ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS ocr_text TEXT;
ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS indexing_error_message TEXT;

-- ステップ3: 既存データのステータス値を新しい体系に移行
-- 'pending' -> 'pending_upload'
UPDATE pdf_documents SET status = 'pending_upload' WHERE status = 'pending';
-- 'indexing' -> 'indexing_processing'
UPDATE pdf_documents SET status = 'indexing_processing' WHERE status = 'indexing';
-- 'error' (旧) -> 'indexing_failed' (新)
UPDATE pdf_documents SET status = 'indexing_failed' WHERE status = 'error';

-- ステップ4: 新しいステータス値のCHECK制約を追加
ALTER TABLE pdf_documents
ADD CONSTRAINT pdf_documents_status_check_v3 CHECK (status IN (
    'pending_upload',      -- アップロード直後、処理待ち
    'ocr_queued',          -- OCR処理キュー投入
    'ocr_processing',      -- OCR処理中
    'ocr_failed',          -- OCR処理失敗
    'text_extraction_completed', -- OCR成功、テキスト抽出完了
    'indexing_queued',     -- Groqインデックス処理キュー投入
    'indexing_processing', -- Groqインデックス処理中
    'indexing_failed',     -- Groqインデックス処理失敗
    'completed'            -- 全処理完了、検索可能
));

-- ステップ5: status カラムのデフォルト値を設定
ALTER TABLE pdf_documents ALTER COLUMN status SET DEFAULT 'pending_upload';

-- ステップ6: カラムへのコメントを追加
COMMENT ON COLUMN pdf_documents.status IS 'ドキュメントの処理ステータス: pending_upload, ocr_queued, ocr_processing, ocr_failed, text_extraction_completed, indexing_queued, indexing_processing, indexing_failed, completed';
COMMENT ON COLUMN pdf_documents.ocr_text IS 'OCRによって抽出された生のテキストデータ';
COMMENT ON COLUMN pdf_documents.indexing_error_message IS 'Groqインデックス作成時のエラーメッセージ';
COMMENT ON COLUMN pdf_documents.error_message IS '汎用エラーメッセージ（主にアップロード時やOCR前のエラー）';

COMMIT;
