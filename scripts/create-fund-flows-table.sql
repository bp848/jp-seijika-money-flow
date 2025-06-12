-- Create fund_flows table for political funding data
CREATE TABLE IF NOT EXISTS fund_flows (
    id SERIAL PRIMARY KEY,
    donor VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    donor_type VARCHAR(50) DEFAULT 'individual', -- 'individual', 'corporation', 'organization'
    recipient_type VARCHAR(50) DEFAULT 'politician', -- 'politician', 'party', 'pac'
    party_affiliation VARCHAR(100),
    transaction_type VARCHAR(50) DEFAULT 'donation', -- 'donation', 'loan', 'expenditure'
    description TEXT,
    source_document VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fund_flows_donor ON fund_flows(donor);
CREATE INDEX IF NOT EXISTS idx_fund_flows_recipient ON fund_flows(recipient);
CREATE INDEX IF NOT EXISTS idx_fund_flows_date ON fund_flows(date);
CREATE INDEX IF NOT EXISTS idx_fund_flows_amount ON fund_flows(amount);
CREATE INDEX IF NOT EXISTS idx_fund_flows_party ON fund_flows(party_affiliation);
CREATE INDEX IF NOT EXISTS idx_fund_flows_donor_type ON fund_flows(donor_type);
CREATE INDEX IF NOT EXISTS idx_fund_flows_recipient_type ON fund_flows(recipient_type);
