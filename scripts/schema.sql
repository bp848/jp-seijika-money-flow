-- 政治団体情報
CREATE TABLE IF NOT EXISTS political_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT UNIQUE NOT NULL, -- 報告書を一意に識別するID (例: 提出日_団体名など、OCRテキストから生成または入力)
    name TEXT, -- 政治団体の名称
    address TEXT, -- 主たる事務所の所在地
    representative_name TEXT, -- 代表者の氏名
    accountant_name TEXT, -- 会計責任者の氏名
    report_year INTEGER, -- 報告対象年 (Groqで抽出試行)
    raw_ocr_text TEXT, -- 元のOCRテキスト
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 収支の総括表
CREATE TABLE IF NOT EXISTS financial_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_report_id TEXT NOT NULL REFERENCES political_organizations(report_id) ON DELETE CASCADE,
    prev_year_balance BIGINT, -- 前年繰越額
    current_year_revenue BIGINT, -- 本年の収入額
    total_revenue BIGINT, -- 収入総額
    total_expenditure BIGINT, -- 支出総額
    next_year_balance BIGINT, -- 翌年への繰越額
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 収入詳細
CREATE TABLE IF NOT EXISTS revenue_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_report_id TEXT NOT NULL REFERENCES political_organizations(report_id) ON DELETE CASCADE,
    category TEXT, -- 収入のカテゴリ (例: 個人の負担する党費又は会費, 寄附)
    item_name TEXT, -- 項目名 (例: (ｱ) 個人からの寄附)
    amount BIGINT, -- 金額
    donor_name TEXT, -- 寄附者の氏名(又は名称)
    donor_address TEXT, -- 寄附者の住所(又は所在地)
    donor_occupation TEXT, -- 寄附者の職業(又は代表者の氏名)
    donation_date DATE, -- 年月日
    remarks TEXT, -- 備考
    source_document_page TEXT, -- 元帳票のページ (例: その2)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 支出詳細
CREATE TABLE IF NOT EXISTS expenditure_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_report_id TEXT NOT NULL REFERENCES political_organizations(report_id) ON DELETE CASCADE,
    category TEXT, -- 支出のカテゴリ (例: 経常経費, 政治活動費)
    item_name TEXT, -- 項目名 (例: 人件費, 光熱水費)
    purpose TEXT, -- 支出の目的
    amount BIGINT, -- 金額
    expenditure_date DATE, -- 年月日
    payee_name TEXT, -- 支出を受けた者の氏名(又は名称)
    payee_address TEXT, -- 支出を受けた者の住所(又は所在地)
    remarks TEXT, -- 備考
    source_document_page TEXT, -- 元帳票のページ (例: その13)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 資産等詳細
CREATE TABLE IF NOT EXISTS asset_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_report_id TEXT NOT NULL REFERENCES political_organizations(report_id) ON DELETE CASCADE,
    asset_type TEXT, -- 資産等の項目別区分 (例: 土地, 建物, 預金)
    description TEXT, -- 摘要
    value BIGINT, -- 金額又は評価額
    acquisition_date DATE, -- 年月日 (取得日など)
    remarks TEXT, -- 備考
    source_document_page TEXT, -- 元帳票のページ (例: その18)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 監査意見書・報告書情報
CREATE TABLE IF NOT EXISTS audit_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_report_id TEXT NOT NULL REFERENCES political_organizations(report_id) ON DELETE CASCADE,
    document_type TEXT, -- 書類の種類 (例: 監査意見書, 政治資金監査報告書)
    has_document BOOLEAN, -- 添付の有無
    auditor_name TEXT, -- 監査人の氏名 (該当する場合)
    audit_date DATE, -- 監査日 (該当する場合)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- political_organizations テーブルに blob_url カラムを追加
ALTER TABLE political_organizations ADD COLUMN IF NOT EXISTS blob_url TEXT;
-- political_organizations テーブルに content_hash カラムを追加し、一意性制約を設定
ALTER TABLE political_organizations ADD COLUMN IF NOT EXISTS content_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS political_organizations_content_hash_idx ON political_organizations(content_hash);

-- インデックス作成 (クエリパフォーマンス向上のため)
CREATE INDEX IF NOT EXISTS idx_financial_summaries_report_id ON financial_summaries(organization_report_id);
CREATE INDEX IF NOT EXISTS idx_revenue_details_report_id ON revenue_details(organization_report_id);
CREATE INDEX IF NOT EXISTS idx_expenditure_details_report_id ON expenditure_details(organization_report_id);
CREATE INDEX IF NOT EXISTS idx_asset_details_report_id ON asset_details(organization_report_id);
CREATE INDEX IF NOT EXISTS idx_audit_documents_report_id ON audit_documents(organization_report_id);

-- 既存のデータを更新するためのトリガー関数
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルに更新トリガーを設定
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('political_organizations', 'financial_summaries', 'revenue_details', 'expenditure_details', 'asset_details', 'audit_documents')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_timestamp ON %I;', t_name);
        EXECUTE format('
            CREATE TRIGGER set_timestamp
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION trigger_set_timestamp();
        ', t_name);
    END LOOP;
END $$;
