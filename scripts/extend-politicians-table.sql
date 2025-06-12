-- politiciansテーブルに参議院議員データ用のカラムを追加
ALTER TABLE politicians 
  ADD COLUMN IF NOT EXISTS legislature TEXT, -- 'house_of_representatives', 'house_of_councillors', 'local'
  ADD COLUMN IF NOT EXISTS profile_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS term_end_date DATE,
  ADD COLUMN IF NOT EXISTS election_years TEXT,
  ADD COLUMN IF NOT EXISTS current_positions TEXT,
  ADD COLUMN IF NOT EXISTS positions_as_of DATE,
  ADD COLUMN IF NOT EXISTS biography TEXT,
  ADD COLUMN IF NOT EXISTS biography_as_of DATE,
  ADD COLUMN IF NOT EXISTS external_id TEXT; -- 外部システムでの識別子

-- 参議院議員データ用のインデックスを追加
CREATE INDEX IF NOT EXISTS idx_politicians_legislature ON politicians(legislature);
CREATE INDEX IF NOT EXISTS idx_politicians_term_end_date ON politicians(term_end_date);
