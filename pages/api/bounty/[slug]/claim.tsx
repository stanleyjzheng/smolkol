// pages/api/bounty/[slug]/claim.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

const pool = new Pool({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DATABASE,
	password: process.env.PG_PASSWORD,
	port: Number(process.env.PG_PORT),
})

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { slug } = req.query

	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' })
		return
	}

	const { tweetLink } = req.body

	if (!tweetLink) {
		res.status(400).json({ error: 'Missing tweet link' })
		return
	}

	if (typeof slug !== 'string') {
		res.status(400).json({ error: 'Invalid slug' })
		return
	}

	try {
		const client = await pool.connect()
		const result = await client.query(
			'SELECT * FROM bounties WHERE slug = $1',
			[slug],
		)
		client.release()

		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Bounty not found' })
			return
		}

		const bounty = result.rows[0]

		if (bounty.completed) {
			res.status(400).json({ error: 'Bounty already completed' })
			return
		}

		// Simulate high-latency OpenAI call
		await sleep(2000)

		// Dummy OpenAI result
		const openAIResult = Math.random() < 0.5

		if (!openAIResult) {
			const reason =
				'Your tweet does not meet the bounty requirements because it lacks positive sentiment about Uniswap.'
			res.status(200).json({ success: false, reason })
			return
		}

		// Simulate ETH transaction
		await sleep(2000)

		const txLink = 'https://etherscan.io/tx/0x1234567890abcdef'

		res.status(200).json({ success: true, txLink })
	} catch (error) {
		console.error('Error processing claim:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}
