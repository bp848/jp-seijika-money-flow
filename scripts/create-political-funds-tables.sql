-- 政治資金団体テーブル
CREATE TABLE IF NOT EXISTS political_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  affiliated_party text,
  representative_name text,
  treasurer_name text,
  address text,
  registered_on date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 政党テーブル
CREATE TABLE IF NOT EXISTS political_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  representative_name text,
  treasurer_name text,
  headquarters_address text,
  established_on date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 政党支部テーブル
CREATE TABLE IF NOT EXISTS party_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  party_id uuid REFERENCES political_parties(id),
  representative_name text,
  treasurer_name text,
  branch_address text,
  registered_on date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_political_funds_name ON political_funds(name);
CREATE INDEX IF NOT EXISTS idx_political_funds_party ON political_funds(affiliated_party);
CREATE INDEX IF NOT EXISTS idx_political_parties_name ON political_parties(name);
CREATE INDEX IF NOT EXISTS idx_party_branches_name ON party_branches(name);
CREATE INDEX IF NOT EXISTS idx_party_branches_party_id ON party_branches(party_id);
