import { NextApiRequest, NextApiResponse } from 'next'
import { Wallet, parseEther, JsonRpcProvider } from 'ethers'

// Ensure environment variables are loaded
const privateKey = process.env.PRIVATE_KEY
const rpcUrl = process.env.RPC_URL
const chainId = process.env.CHAIN_ID

if (!privateKey || !rpcUrl || !chainId) {
	throw new Error(
		'Please define PRIVATE_KEY, RPC_URL, and CHAIN_ID in your .env.local file',
	)
}

// Create a provider using ethers
const provider = new JsonRpcProvider(rpcUrl)

// Create a wallet instance from the private key and connect it to the provider
const wallet = new Wallet(privateKey, provider)

// Define the function to send ETH transaction
const sendEthTransaction = async (
	to: string,
	valueInEth: string,
): Promise<string> => {
	try {
		// Convert ETH value to wei using ethers v6 parseEther
		const value = parseEther(valueInEth)

		// Create the transaction object
		const tx = {
			to,
			value,
			gasLimit: 21000, // Standard gas limit for an ETH transfer
			chainId: parseInt(chainId), // Chain ID from environment variables
		}

		// Sign and send the transaction
		const transactionResponse = await wallet.sendTransaction(tx)

		// Wait for the transaction to be mined
		await transactionResponse.wait()

		// Return the transaction hash
		return transactionResponse.hash
	} catch (error) {
		console.error('Error sending transaction:', error)
		throw error
	}
}

// Next.js API handler function
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed, use POST.' })
	}

	const { to, valueInEth } = req.body

	if (!to || !valueInEth) {
		return res
			.status(400)
			.json({ error: 'Missing required parameters: to, valueInEth' })
	}

	try {
		// Call the sendEthTransaction function
		const txHash = await sendEthTransaction(to, valueInEth)
		return res.status(200).json({ success: true, txHash })
	} catch (error: any) {
		return res
			.status(500)
			.json({ error: 'Transaction failed', details: error.message })
	}
}
