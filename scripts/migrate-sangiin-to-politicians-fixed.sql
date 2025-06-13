-- sangiin_membersテーブルの構造を確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sangiin_members'
ORDER BY ordinal_position;

-- 移行前のpoliticiansテーブルのレコード数を確認
SELECT COUNT(*) AS politicians_count_before FROM politicians;
SELECT COUNT(*) AS sangiin_members_count FROM sangiin_members;

-- sangiin_membersからpoliticiansへデータを移行
INSERT INTO politicians (
  name,
  name_kana,
  party,
  electoral_district,
  election_count,
  prefecture,
  legislature,
  profile_url,
  photo_url,
  term_end_date,
  election_years,
  current_positions,
  positions_as_of,
  biography,
  biography_as_of,
  external_id,
  status
)
SELECT
  name,
  name_reading AS name_kana,
  party,
  electoral_district,
  election_count::integer,
  -- 選挙区から都道府県を抽出（例：東京都選出→東京都）
  CASE 
    WHEN electoral_district LIKE '%都%' OR electoral_district LIKE '%道%' OR electoral_district LIKE '%府%' OR electoral_district LIKE '%県%' 
    THEN electoral_district 
    ELSE NULL 
  END AS prefecture,
  'house_of_councillors' AS legislature,
  profile_url,
  photo_url,
  term_end_date::date,
  election_years,
  current_positions,
  positions_as_of::date,
  biography,
  biography_as_of::date,
  id AS external_id,
  'active' AS status
FROM sangiin_members
-- 既に移行済みのデータは除外
WHERE NOT EXISTS (
  SELECT 1 FROM politicians 
  WHERE politicians.name = sangiin_members.name 
  AND politicians.legislature = 'house_of_councillors'
);

-- 移行後のpoliticiansテーブルのレコード数を確認
SELECT COUNT(*) AS politicians_count_after FROM politicians;

-- 移行結果の確認
SELECT COUNT(*) AS migrated_count FROM politicians WHERE legislature = 'house_of_councillors';

-- 参議院議員データの確認
SELECT 
  name, 
  name_kana, 
  party, 
  electoral_district, 
  legislature,
  term_end_date
FROM politicians 
WHERE legislature = 'house_of_councillors'
LIMIT 10;
