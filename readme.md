# SmolKOL

`docker-compose up -d`
`npm i`
`npm run dev`

## sample postgres setup

create tables:
```sql
CREATE TABLE bounties (
    creator_address VARCHAR(42) NOT NULL,  -- Ethereum addresses are 42 characters long including '0x'
    creator_ens VARCHAR(255),              -- ENS names can vary in length, 255 is a safe upper limit
    amount NUMERIC NOT NULL,               -- ETH amounts in DEC
    chainid INTEGER NOT NULL,              -- Chain ID for the blockchain (Ethereum, etc.)
    paid BOOLEAN NOT NULL DEFAULT FALSE,   -- True if the bounty has been paid for by the creator, default to false
    completed BOOLEAN NOT NULL DEFAULT FALSE, -- True if the condition has been met, default to false
    search_string TEXT,                    -- Can vary in length, hence use TEXT
    condition JSONB,                       -- Use JSONB to store the type and the required number, e.g. {"type": "likes", "count": 1000}
    slug VARCHAR(64),
    PRIMARY KEY (slug)
);
```

dummy data:
```sql
INSERT INTO bounties (creator_address, creator_ens, amount, chainid, completed, search_string, condition, slug)
VALUES
('0x1234567890abcdef1234567890abcdef12345678', 'haydenadams.eth', 1000000000000000, 1, FALSE, 'A tweet proving or debunking CZ accusations of Uniswap getting hacked', '{"type": "likes", "count": 10}', 'l'),
('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', '0xfbifemboy.eth', 10000000000000, 1, TRUE, 'Information leading to the arrest of CL207', '{"type": "views", "count": 5000}', 'v'),
('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', NULL, 20000000000000000, 137, FALSE, 'Novel ETH censorship resistance/MCP research', '{"type": "likes", "count": 200}', 'r'),
('0x1234567890abcdef1234567890abcdef12345678', NULL, 10000000000000000, 1, TRUE, 'A shitpost about Flow', '{"type": "views", "count": 12000}', 'a'),
('0x234567890abcdef1234567890abcdef123456789', 'saucepoint.eth', 10000000000, 137, FALSE, 'A positive tweet about Uniswap hooks', '{"type": "likes", "count": 750}', 'm');
```
