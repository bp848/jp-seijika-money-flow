-- 参議院議員テーブルの作成
CREATE TABLE IF NOT EXISTS sangiin_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_reading text,
  real_name text, -- 通称名使用議員の本名
  profile_url text,
  party text,
  electoral_district text,
  term_end_date date,
  photo_url text,
  election_years text, -- 当選年（複数年をカンマ区切り）
  election_count integer,
  current_positions text, -- 現在の役職
  positions_as_of date, -- 役職等の時点
  biography text, -- 経歴
  biography_as_of date, -- 経歴の時点
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_sangiin_members_name ON sangiin_members(name);
CREATE INDEX IF NOT EXISTS idx_sangiin_members_party ON sangiin_members(party);
CREATE INDEX IF NOT EXISTS idx_sangiin_members_district ON sangiin_members(electoral_district);
CREATE INDEX IF NOT EXISTS idx_sangiin_members_term_end ON sangiin_members(term_end_date);

-- 全文検索用のインデックス
CREATE INDEX IF NOT EXISTS idx_sangiin_members_search ON sangiin_members 
USING gin(to_tsvector('japanese', 
  name || ' ' || 
  COALESCE(name_reading, '') || ' ' || 
  COALESCE(party, '') || ' ' || 
  COALESCE(electoral_district, '') || ' ' ||
  COALESCE(current_positions, '')
));

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_sangiin_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sangiin_members_updated_at_trigger
  BEFORE UPDATE ON sangiin_members
  FOR EACH ROW
  EXECUTE FUNCTION update_sangiin_members_updated_at();
