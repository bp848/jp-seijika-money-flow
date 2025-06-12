-- システムログテーブルの作成
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level VARCHAR(10) NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
    message TEXT NOT NULL,
    data JSONB,
    request_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs (level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_request_id ON system_logs (request_id);

-- RLSポリシーの設定（必要に応じて）
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー
CREATE POLICY IF NOT EXISTS "Admin access only" ON system_logs
    FOR ALL USING (auth.role() = 'service_role');

-- ログ統計用のビューを作成
CREATE OR REPLACE VIEW system_logs_stats AS
SELECT 
    level,
    COUNT(*) as count,
    DATE_TRUNC('hour', created_at) as hour
FROM system_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY level, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC, level;
