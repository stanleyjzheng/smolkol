import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'
import { getToken } from 'next-auth/jwt'
import { extractTweetId, fetchTweetData } from '../../../../lib/utils'
import { judgeBounty } from '../../../../lib/openai'
import { Wallet, parseEther, JsonRpcProvider } from 'ethers'

const pool = new Pool({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DATABASE,
	password: process.env.PG_PASSWORD,
	port: Number(process.env.PG_PORT),
})

const privateKey = process.env.PRIVATE_KEY
const rpcUrl = process.env.RPC_URL
const chainId = process.env.CHAIN_ID

if (!privateKey || !rpcUrl || !chainId) {
	throw new Error(
		'Please define PRIVATE_KEY, RPC_URL, and CHAIN_ID in your .env file',
	)
}

// Create a provider using ethers
const provider = new JsonRpcProvider(rpcUrl)

// Create a wallet instance from the private key and connect it to the provider
const wallet = new Wallet(privateKey, provider)

const sendEthTransaction = async (
	to: string,
	value: string,
): Promise<string> => {
	try {
		// Create the transaction object
		const tx = {
			to,
			value,
		}

		// Sign and send the transaction
		const transactionResponse = await wallet.sendTransaction(tx)

		console.log('Transaction sent:', transactionResponse.hash)

		// Return the transaction hash
		return transactionResponse.hash
	} catch (error) {
		console.error('Error sending transaction:', error)
		throw error
	}
}

export default async function Handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { slug } = req.query

	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' })
		return
	}

	const token = await getToken({ req })

	if (!token) {
		res.status(401).json({ error: 'Not authenticated' })
		return
	}

	const { tweetLink, to_address } = req.body

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

		// Extract tweet ID and fetch tweet data
		const tweetId = extractTweetId(tweetLink)

		if (!tweetId) {
			res.status(400).json({ error: 'Invalid tweet link' })
			return
		}

		const tweetData = await fetchTweetData(req, tweetId)

		// Check if the tweet meets the bounty conditions
		const tweetText = tweetData?.text
		const likes = tweetData?.likeCount

		const requiredLikes = bounty.condition.count
		const meetsCondition = (likes as any) >= requiredLikes

		if (!meetsCondition) {
			const reason = `Your tweet does not meet the bounty requirements. It has ${likes} likes but requires at least ${requiredLikes} likes.`
			res.status(200).json({ success: false, reason })
			return
		}

		let judged = await judgeBounty(bounty.search_string, tweetText!)

		if (!judged?.matched_request) {
			res.status(200).json({ success: false, reason: judged?.reason })
			return
		}

		const txLink = await sendEthTransaction(to_address, bounty.amount)

		// Mark the bounty as completed
		const updateClient = await pool.connect()
		await updateClient.query(
			'UPDATE bounties SET completed = TRUE WHERE slug = $1',
			[slug],
		)
		updateClient.release()

		res.status(200).json({ success: true, txLink })
	} catch (error) {
		console.error('Error processing claim:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}
