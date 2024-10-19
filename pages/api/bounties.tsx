// pages/api/bounties.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

// Initialize connection to PostgreSQL
const pool = new Pool({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DATABASE,
	password: process.env.PG_PASSWORD,
	port: Number(process.env.PG_PORT),
})

// Define the type for the bounty
type Bounty = {
	creator_address: string
	creator_ens: string | null
	amount: string // Using string to handle large ETH amounts with 18 decimals
	chainid: number
	completed: boolean
	search_string: string
	condition: {
		type: string
		count: number
	}
	slug: string
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	try {
		// Query the bounties from the database
		const result = await pool.query<Bounty>('SELECT * FROM bounties')
		const bounties: Bounty[] = result.rows

		res.status(200).json({ bounties })
	} catch (error) {
		console.error('Error fetching bounties:', error)
		res.status(500).json({ error: 'Internal Server Error' })
	}
}
