-- Insert sample political funding data
INSERT INTO fund_flows (donor, recipient, amount, date, donor_type, recipient_type, party_affiliation, transaction_type, description) VALUES
-- 自民党関連
('トヨタ自動車株式会社', '岸田文雄', 1000000, '2023-01-15', 'corporation', 'politician', '自由民主党', 'donation', '政治資金パーティー券購入'),
('三菱重工業株式会社', '自由民主党', 2000000, '2023-02-20', 'corporation', 'party', '自由民主党', 'donation', '政党交付金'),
('日本経済団体連合会', '麻生太郎', 500000, '2023-03-10', 'organization', 'politician', '自由民主党', 'donation', '政治資金パーティー'),
('ソフトバンクグループ株式会社', '菅義偉', 800000, '2023-04-05', 'corporation', 'politician', '自由民主党', 'donation', '個人献金'),

-- 立憲民主党関連
('連合', '枝野幸男', 1500000, '2023-01-25', 'organization', 'politician', '立憲民主党', 'donation', '労働組合からの献金'),
('イオン株式会社', '立憲民主党', 1200000, '2023-02-15', 'corporation', 'party', '立憲民主党', 'donation', '政党交付金'),
('全日本自治団体労働組合', '蓮舫', 600000, '2023-03-20', 'organization', 'politician', '立憲民主党', 'donation', '組合費'),

-- 公明党関連
('創価学会', '公明党', 5000000, '2023-01-10', 'organization', 'party', '公明党', 'donation', '宗教団体からの献金'),
('山口那津男後援会', '山口那津男', 300000, '2023-02-28', 'organization', 'politician', '公明党', 'donation', '後援会費'),

-- 日本維新の会関連
('パナソニック株式会社', '吉村洋文', 700000, '2023-03-15', 'corporation', 'politician', '日本維新の会', 'donation', '政治資金パーティー'),
('関西経済連合会', '日本維新の会', 900000, '2023-04-10', 'organization', 'party', '日本維新の会', 'donation', '地域経済団体からの献金'),

-- 国民民主党関連
('電力総連', '玉木雄一郎', 400000, '2023-02-05', 'organization', 'politician', '国民民主党', 'donation', '電力労組からの献金'),
('国民民主党', '前原誠司', 250000, '2023-03-25', 'party', 'politician', '国民民主党', 'donation', '党内資金'),

-- 共産党関連
('日本共産党中央委員会', '志位和夫', 800000, '2023-01-30', 'party', 'politician', '日本共産党', 'donation', '党費・機関紙収入'),
('赤旗読者会', '日本共産党', 1100000, '2023-02-12', 'organization', 'party', '日本共産党', 'donation', '機関紙収入'),

-- 追加のサンプルデータ（2022年分）
('日本製鉄株式会社', '二階俊博', 1200000, '2022-12-15', 'corporation', 'politician', '自由民主党', 'donation', '年末政治資金パーティー'),
('全国農業協同組合中央会', '自由民主党', 3000000, '2022-11-20', 'organization', 'party', '自由民主党', 'donation', '農協からの政治献金'),
('日本労働組合総連合会', '立憲民主党', 2500000, '2022-10-10', 'organization', 'party', '立憲民主党', 'donation', '連合からの政治献金'),

-- IT業界からの献金
('株式会社NTTドコモ', '河野太郎', 600000, '2023-05-15', 'corporation', 'politician', '自由民主党', 'donation', 'IT政策研究会'),
('楽天グループ株式会社', '平井卓也', 450000, '2023-06-10', 'corporation', 'politician', '自由民主党', 'donation', 'デジタル政策パーティー'),
('株式会社メルカリ', '牧島かれん', 300000, '2023-07-05', 'corporation', 'politician', '自由民主党', 'donation', 'スタートアップ政策研究会'),

-- 金融業界からの献金
('三菱UFJ銀行', '麻生太郎', 1500000, '2023-08-20', 'corporation', 'politician', '自由民主党', 'donation', '金融政策研究会'),
('野村證券株式会社', '茂木敏充', 800000, '2023-09-15', 'corporation', 'politician', '自由民主党', 'donation', '資本市場政策パーティー'),

-- 建設業界からの献金
('大成建設株式会社', '甘利明', 1000000, '2023-10-10', 'corporation', 'politician', '自由民主党', 'donation', '建設政策研究会'),
('鹿島建設株式会社', '自由民主党', 1800000, '2023-11-05', 'corporation', 'party', '自由民主党', 'donation', 'インフラ政策献金');
