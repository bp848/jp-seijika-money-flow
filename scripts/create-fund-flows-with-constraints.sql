-- 外部キー制約付きfund_flowsテーブル作成
CREATE TABLE IF NOT EXISTS fund_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_entity_id UUID NOT NULL,
  target_entity_id UUID NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  flow_date DATE NOT NULL,
  document_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 外部キー制約
  CONSTRAINT fk_source_politician FOREIGN KEY (source_entity_id) REFERENCES politicians(id),
  CONSTRAINT fk_target_politician FOREIGN KEY (target_entity_id) REFERENCES politicians(id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_fund_flows_date ON fund_flows(flow_date);
CREATE INDEX IF NOT EXISTS idx_fund_flows_source ON fund_flows(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_fund_flows_target ON fund_flows(target_entity_id);
