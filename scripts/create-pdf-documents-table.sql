-- PDF文書管理テーブルの作成
CREATE TABLE IF NOT EXISTS pdf_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name TEXT NOT NULL,
    blob_url TEXT NOT NULL,
    upload_datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    party_name TEXT DEFAULT '不明',
    region TEXT DEFAULT '不明',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'indexing', 'completed', 'error')),
    error_message TEXT,
    file_size BIGINT,
    groq_index_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_pdf_documents_status ON pdf_documents(status);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_party_name ON pdf_documents(party_name);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_region ON pdf_documents(region);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_upload_datetime ON pdf_documents(upload_datetime DESC);

-- 重複チェック用のユニークインデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_pdf_documents_unique_file ON pdf_documents(file_name, file_size);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pdf_documents_updated_at 
    BEFORE UPDATE ON pdf_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
