// pages/api/bounty/[slug].ts

import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

const pool = new Pool({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DATABASE,
	password: process.env.PG_PASSWORD,
	port: Number(process.env.PG_PORT),
})

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { slug } = req.query

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

		res.status(200).json({ bounty: result.rows[0] })
	} catch (error) {
		console.error('Error fetching bounty:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}
