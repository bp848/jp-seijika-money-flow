-- 政治家テーブルの作成
CREATE TABLE IF NOT EXISTS politicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_kana text,
  party text,
  electoral_district text,
  election_count integer,
  position text, -- 役職（大臣、党首など）
  prefecture text, -- 都道府県
  status text DEFAULT 'active', -- active, inactive
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_politicians_name ON politicians(name);
CREATE INDEX IF NOT EXISTS idx_politicians_party ON politicians(party);
CREATE INDEX IF NOT EXISTS idx_politicians_electoral_district ON politicians(electoral_district);
CREATE INDEX IF NOT EXISTS idx_politicians_prefecture ON politicians(prefecture);

-- 全文検索用のインデックス
CREATE INDEX IF NOT EXISTS idx_politicians_search ON politicians USING gin(to_tsvector('japanese', name || ' ' || COALESCE(name_kana, '') || ' ' || COALESCE(party, '')));

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_politicians_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER politicians_updated_at_trigger
  BEFORE UPDATE ON politicians
  FOR EACH ROW
  EXECUTE FUNCTION update_politicians_updated_at();
