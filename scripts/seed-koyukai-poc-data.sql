-- Clear existing data for a clean slate (for development only)
-- Ensure tables are created before running this.
TRUNCATE TABLE transactions, political_funds, politicians, political_parties, entities RESTART IDENTITY CASCADE;

-- 1. Political Parties
INSERT INTO political_parties (id, name) VALUES
(1, '自由民主党'),
(2, '立憲民主党'),
(3, '公明党'),
(99, '不明');

-- 2. Entities (Organizations, Companies, etc.)
-- We need IDs to link them in transactions.
INSERT INTO entities (id, name, entity_type) VALUES
(1, '孝友会', 'political-group'),
(2, '(株)ジェーシービー', 'corporate'),
(3, '不明な政治団体', 'unknown');

-- 3. Politicians
-- Link to the political party created above.
INSERT INTO politicians (id, name, party_id) VALUES
(1, '渡邊 孝一', 1);

-- 4. Political Funds (The main entity for this report)
-- This links the fund to its representative politician.
INSERT INTO political_funds (id, name, representative_name, treasurer_name, total_income, total_expenditure, net_balance) VALUES
(1, '孝友会', '渡邊 孝一', '澁谷 皇将', 370086, 275265, 94821);

-- 5. Transactions
-- All transactions are linked to the '孝友会' entity (political_fund_id = 1).
-- The source/target IDs come from the 'entities' table.

-- Income Transaction (1 record)
-- From "不明な政治団体" (entity_id=3) to "孝友会" (entity_id=1)
INSERT INTO transactions (source_entity_id, target_entity_id, transaction_type, occurred_on, amount, description, purpose) VALUES
(3, 1, 'Income', '2023-12-31', 350000, '寄附', '政治団体からの寄附'); -- Date is unknown from report, using year-end.

-- Expenditure Transactions (12 records)
-- From "孝友会" (entity_id=1) to "(株)ジェーシービー" (entity_id=2)
INSERT INTO transactions (source_entity_id, target_entity_id, transaction_type, occurred_on, amount, description, purpose) VALUES
(1, 2, 'Expenditure', '2023-01-10', 14840, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-02-10', 17260, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-03-10', 25110, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-04-10', 23950, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-05-10', 24630, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-06-12', 36070, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-07-10', 13300, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-08-10', 21360, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-09-11', 28690, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-10-10', 44510, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-11-10', 10410, '組織活動費', 'ETCカード代金支払い'),
(1, 2, 'Expenditure', '2023-12-11', 15135, '組織活動費', 'ETCカード代金支払い');
