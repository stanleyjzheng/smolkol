import { NextApiRequest, NextApiResponse } from 'next'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { v4 as uuidv4 } from 'uuid'
import { Pool } from 'pg'

const pool = new Pool({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DATABASE,
	password: process.env.PG_PASSWORD,
	port: Number(process.env.PG_PORT),
})

const client = createPublicClient({
	chain: mainnet,
	transport: http(),
})

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === 'POST') {
		try {
			const {
				amount,
				searchString,
				conditionType,
				conditionCount,
				chain_id,
				creator_address,
			} = req.body

			// Fetch ENS name from Ethereum mainnet
			let creator_ens = await client.getEnsName({ address: creator_address })
			if (!creator_ens) {
				creator_ens = null
			}

			// Generate a unique slug
			const slug = uuidv4()

			// Prepare data for insertion
			const bountyData = {
				creator_address,
				creator_ens,
				amount: BigInt(parseFloat(amount) * 10 ** 18),
				chainid: parseInt(chain_id),
				paid: true,
				completed: false,
				search_string: searchString,
				condition: {
					type: conditionType,
					count: parseInt(conditionCount),
				},
				slug,
			}

			const query = `
        INSERT INTO bounties (
          creator_address,
          creator_ens,
          amount,
          chainid,
          paid,
          completed,
          search_string,
          condition,
          slug
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9
        )
      `

			const values = [
				bountyData.creator_address,
				bountyData.creator_ens,
				bountyData.amount,
				bountyData.chainid,
				bountyData.paid,
				bountyData.completed,
				bountyData.search_string,
				JSON.stringify(bountyData.condition),
				bountyData.slug,
			]

			// Insert data into the database
			await pool.query(query, values)

			res.status(200).json({ message: 'Bounty created successfully' })
		} catch (error) {
			console.error('Error in /api/create-bounty:', error)
			res.status(500).json({ error: 'An error occurred' })
		}
	} else {
		// Handle any other HTTP method
		res.setHeader('Allow', 'POST')
		res.status(405).end('Method Not Allowed')
	}
}
