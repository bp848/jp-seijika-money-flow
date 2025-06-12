-- politiciansテーブルの構造を確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'politicians';

-- name_kanaカラムが存在しない場合は追加
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'name_kana'
    ) THEN
        ALTER TABLE politicians ADD COLUMN name_kana TEXT;
        RAISE NOTICE 'name_kanaカラムを追加しました';
    ELSE
        RAISE NOTICE 'name_kanaカラムは既に存在します';
    END IF;
END $$;

-- 他の必要なカラムも確認して追加
DO $$
BEGIN
    -- 議会種別カラム
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'legislature'
    ) THEN
        ALTER TABLE politicians ADD COLUMN legislature TEXT;
        RAISE NOTICE 'legislatureカラムを追加しました';
    END IF;

    -- プロフィールURLカラム
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'profile_url'
    ) THEN
        ALTER TABLE politicians ADD COLUMN profile_url TEXT;
        RAISE NOTICE 'profile_urlカラムを追加しました';
    END IF;

    -- 写真URLカラム
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE politicians ADD COLUMN photo_url TEXT;
        RAISE NOTICE 'photo_urlカラムを追加しました';
    END IF;

    -- 任期満了日カラム
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'term_end_date'
    ) THEN
        ALTER TABLE politicians ADD COLUMN term_end_date DATE;
        RAISE NOTICE 'term_end_dateカラムを追加しました';
    END IF;

    -- 当選年カラム
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'election_years'
    ) THEN
        ALTER TABLE politicians ADD COLUMN election_years TEXT;
        RAISE NOTICE 'election_yearsカラムを追加しました';
    END IF;

    -- 現在の役職カラム
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'current_positions'
    ) THEN
        ALTER TABLE politicians ADD COLUMN current_positions TEXT;
        RAISE NOTICE 'current_positionsカラムを追加しました';
    END IF;

    -- 役職情報の時点カラム
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'positions_as_of'
    ) THEN
        ALTER TABLE politicians ADD COLUMN positions_as_of DATE;
        RAISE NOTICE 'positions_as_ofカラムを追加しました';
    END IF;

    -- 経歴カラム
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'biography'
    ) THEN
        ALTER TABLE politicians ADD COLUMN biography TEXT;
        RAISE NOTICE 'biographyカラムを追加しました';
    END IF;

    -- 経歴情報の時点カラム
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'biography_as_of'
    ) THEN
        ALTER TABLE politicians ADD COLUMN biography_as_of DATE;
        RAISE NOTICE 'biography_as_ofカラムを追加しました';
    END IF;

    -- 外部IDカラム
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'politicians' AND column_name = 'external_id'
    ) THEN
        ALTER TABLE politicians ADD COLUMN external_id TEXT;
        RAISE NOTICE 'external_idカラムを追加しました';
    END IF;
END $$;

-- テーブル構造の確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'politicians'
ORDER BY ordinal_position;
