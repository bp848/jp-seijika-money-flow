-- ベクトル埋め込み用のテーブルを作成 (将来的な拡張用)
CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES pdf_documents(id) ON DELETE CASCADE,
    embedding_vector JSONB NOT NULL, -- ベクトルデータをJSONBで保存
    chunk_index INTEGER DEFAULT 0, -- 文書の分割チャンク番号
    chunk_text TEXT, -- このチャンクの元テキスト
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_document_embeddings_document_id ON document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_chunk_index ON document_embeddings(chunk_index);

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_document_embeddings_updated_at 
    BEFORE UPDATE ON document_embeddings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE document_embeddings IS 'PDF文書のベクトル埋め込みデータを保存するテーブル';
COMMENT ON COLUMN document_embeddings.embedding_vector IS 'Groq APIで生成されたベクトル埋め込みデータ（JSONB形式）';
COMMENT ON COLUMN document_embeddings.chunk_index IS '大きな文書を分割した場合のチャンク番号';
COMMENT ON COLUMN document_embeddings.chunk_text IS 'このベクトルに対応する元のテキストチャンク';
