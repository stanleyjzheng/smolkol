
create tables:
```sql

CREATE TABLE bounties (
    creator_address VARCHAR(42) NOT NULL,  -- Ethereum addresses are 42 characters long including '0x'
    creator_ens VARCHAR(255),              -- ENS names can vary in length, 255 is a safe upper limit
    amount NUMERIC(38, 18) NOT NULL,       -- ETH amounts, 18 decimal places to represent full precision
    chainid INTEGER NOT NULL,              -- Chain ID for the blockchain (Ethereum, etc.)
    completed BOOLEAN NOT NULL DEFAULT FALSE, -- True if the condition has been met, default to false
    search_string TEXT,                    -- Can vary in length, hence use TEXT
    condition JSONB,                       -- Use JSONB to store the type and the required number, e.g. {"type": "likes", "count": 1000}
    slug VARCHAR(64),                      -- Slug, assuming it's a short code based on the condition, adjust length as needed
    PRIMARY KEY slug
);
```

dummy data:
```sql
INSERT INTO bounties (creator_address, creator_ens, amount, chainid, completed, search_string, condition, slug)
VALUES
('0x1234567890abcdef1234567890abcdef12345678', 'creator1.eth', 10.5, 1, FALSE, 'Search query for creator 1', '{"type": "likes", "count": 1000}', 'l'),
('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', NULL, 5.25, 1, TRUE, 'Search query for creator 2', '{"type": "views", "count": 5000}', 'v'),
('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'creator2.eth', 2.00, 137, FALSE, 'Search query for creator 2 on Polygon', '{"type": "likes", "count": 200}', 'r'),
('0x1234567890abcdef1234567890abcdef12345678', NULL, 7.75, 1, TRUE, 'Search query for creator 1 again', '{"type": "views", "count": 12000}', 'a'),
('0x234567890abcdef1234567890abcdef123456789', 'creator3.eth', 12.0, 137, FALSE, 'Search query for creator 3', '{"type": "likes", "count": 750}', 'm');
```
