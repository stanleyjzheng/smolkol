# SmolKOL: A Transparent Attention Marketplace

I would encourage you watch the pitch!

### Overview

SmolKOL is an attention marketplace that connects indie Twitter accounts and companies through performance-based bounties. It allows companies or individuals to create bounties for social media engagement, and shitposters to earn rewards based on how well their content performs. The platform ensures that payments are tied to measurable outcomes such as likes or views, providing transparency and efficiency.

### Problem

Current "KOL" marketing models involve paying influencers upfront, often with no clear correlation between the payment and the actual results achieved. This creates inefficiency for brands and limits opportunities for smaller content creators to participate. There is a lack of transparency in how much value brands are getting for the money spent.

### Solution

SmolKOL addresses this by allowing companies/individuals to offer bounties based on specific performance metrics. Poasters submit content that aligns with these criteria, and payments are only made if the content meets the required level of engagement. This ensures that compensation is based on actual performance rather than follower count or reputation.

### How SmolKOL Works

SmolKOL operates as a bounty board where bounties are posted in natural language. Companies or individuals specify the type of engagement they want (e.g., likes, views) and the reward for meeting these targets.

#### Example Use Case:

1. **Creating a Bounty:** A brand wants to increase awareness about a new product. They create a bounty for tweets that receive over 100 likes, offering 0.01 ETH for each tweet that meets this condition.

2. **Submitting a Tweet:** A user with a relevant story or comment about the product tweets and submits their post to SmolKOL once it hits 100 likes.

3. **Verification:** SmolKOL uses GPT-4O to verify that the tweet meets the bounty’s criteria, including relevance to the prompt and engagement level. If the tweet is approved, the user receives the reward.

4. **Rejection Example:** If the tweet does not meet the requirements or is irrelevant, GPT-4O provides natural language feedback explaining why it was rejected.


### Applications

- **Micro KOL Campaigns:** Offer bounties for content promotion, paying based on actual engagement rather than upfront fees; allowing smaller accounts to participate (Monad has many smaller "influencers", while Polkadot has fewer larger ones. Which one has more mindshare?)
- **Research & Technical Dissemination:** Researchers or projects can create bounties to spread awareness of technical content or important updates, compensating based on how widely the information is shared and engaged with rather than purely how intellectually interesting a problem is.
- **Community Engagement:** Organizations can incentivize participation by paying for tweets that foster discussion or engagement within a specific community.

### Benefits

- **For Companies:** SmolKOL provides a more efficient way to allocate marketing budgets by paying only for content that delivers measurable engagement.
- **For Creators:** Smaller accounts can participate and earn money based on the quality and engagement of their content, without needing a large follower base. Direct payments from bounty creators is much more than they would have earned from ads (eg. before 2024, Twitter paid $0 in ads).

### Example Flow

1. **Create a Bounty:** Specify the content and engagement criteria (e.g., a positive tweet about a product with over 100 likes).
2. **Submit Content:** Users submit their content that meets the criteria.
3. **Verify & Payout:** GPT-4O verifies that the submission meets the requirements, and the creator is paid if the criteria are met.
4. **On-chain verification of OpenAI outputs:** Walrus stores the OpenAI API response on-chain for open verification.

### Technical Details
SmolKOL has a few multiple parts:
- Rust transaction listener to verify payments
- Next.js/node frontend/backend for... most things
- Postgres as our database

More specifically:
- OpenAI API for adjudicating whether the bounty conditions were fulfilled by the tweet
- Dynamic for connecting wallets
- Twitter's internal GraphQL API, which we reverse engineered

And some weirdness in between (docker for postgres)

It's practically my first time building frontend, especially with Next. I was way more comfortable in Rust, so I used it where I can, but it's certainly an odd mix of tech.

I also didn't expect to be exploring prompt engineering before the hackathon; but realized that the new OpenAI beta feature for structured JSON output could be super useful to adjudicate whether a given tweet was valid or not. As such, I spent some time writing a system prompt which pleased me (https://github.com/stanleyjzheng/smolkol/blob/master/openai.md).

By far the most annoying part of it was the Twitter API. There's so many oddities; it just said my auth was wrong. It turns out, for the free tier, Twitter API is WRITE ONLY. I've never remotely heard of that; you can create tweets, but not read? Despite all docs saying that 1500 tweets/month could still be read, it's straight up wrong, and one only finds out via forms. Else, it was $100/mo. Therefore, I decided to scrape twitter using my own account's bearer token, which oddly worked much better. Other oddities were that the callback url can't be localhost (but it allows you to set it as localhost?) so localhost:3000 doesn't work, but 127.0.0.1:3000 works fine. Why???? Truly bizzare. But whatever, some makeshift scraping did the job, so it's hard to complain in the end.
