-- PDF文書テーブルにfile_hashカラムを追加（重複判定用）
ALTER TABLE pdf_documents 
ADD COLUMN IF NOT EXISTS file_hash VARCHAR(64);

-- file_hashカラムにインデックスを作成
CREATE INDEX IF NOT EXISTS idx_pdf_documents_file_hash 
ON pdf_documents (file_hash);

-- ファイル名とサイズの組み合わせにユニークインデックスを作成（重複防止）
CREATE UNIQUE INDEX IF NOT EXISTS idx_pdf_documents_name_size 
ON pdf_documents (file_name, file_size);

-- 処理状況確認用のインデックス
CREATE INDEX IF NOT EXISTS idx_pdf_documents_status 
ON pdf_documents (status);

-- アップロード日時のインデックス
CREATE INDEX IF NOT EXISTS idx_pdf_documents_upload_datetime 
ON pdf_documents (upload_datetime DESC);
