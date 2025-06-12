-- 検索用のインデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_fund_flows_search ON fund_flows USING gin (to_tsvector('japanese', source_entity || ' ' || target_entity));

-- 検索用RPC関数の定義
CREATE OR REPLACE FUNCTION search_transactions(
  search_term TEXT,
  type_filter TEXT DEFAULT 'all',
  row_limit INT DEFAULT 100
)
RETURNS SETOF fund_flows AS $$
BEGIN
  RETURN QUERY
    SELECT *
    FROM fund_flows
    WHERE
      -- search_termが空またはNULLでなければ、全文検索を実行
      (
        search_term IS NULL OR
        search_term = '' OR
        to_tsvector('japanese', source_entity || ' ' || target_entity) @@ to_tsquery('japanese', search_term)
      )
      AND
      -- type_filterが'all'でなければ、transaction_typeでフィルタリング
      (
        type_filter IS NULL OR
        type_filter = 'all' OR
        transaction_type = type_filter
      )
    ORDER BY occurred_on DESC
    LIMIT row_limit;
END;
$$ LANGUAGE plpgsql;
