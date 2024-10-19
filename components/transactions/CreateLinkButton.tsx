import React from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { Address, keccak256, toHex } from 'viem'
import { Button } from '../ui/button'
import { usdcContractAbi, usdcContractAddress } from '@/lib/contracts/USDC'
import { linkToLamboAbi, linkToLamboAddress } from '@/lib/contracts/LinkToLambo'

export default function CreateLinkButton({
	tokenAddress,
	tokenAmount,
	password,
}: {
	tokenAddress: Address | null
	tokenAmount: number | null
	password: string | null
}) {
	const { primaryWallet } = useDynamicContext()

	const handleTransaction = async () => {
		if (!password || !tokenAddress || !tokenAmount) {
			return
		}
		if (primaryWallet && isEthereumWallet(primaryWallet)) {
			const client = await primaryWallet.getWalletClient()

			if (tokenAddress === usdcContractAddress) {
				console.log('Minting USDC', primaryWallet.address, tokenAmount)
				const mintUSDCTx = await client.sendTransaction({
					to: usdcContractAddress,
					abi: usdcContractAbi,
					functionName: 'mint',
					args: [primaryWallet.address, tokenAmount],
				})
				console.log('Mint', mintUSDCTx)
			}
			const approveTx = await client.sendTransaction({
				to: tokenAddress,
				abi: usdcContractAbi,
				functionName: 'approve',
				args: [linkToLamboAddress, tokenAmount],
			})
			console.log('Approve', approveTx)
			const createLinkTx = await client.sendTransaction({
				to: linkToLamboAddress,
				abi: linkToLamboAbi,
				functionName: 'createLink',
				args: [tokenAddress, tokenAmount, keccak256(toHex(password))],
			})
			console.log('createLinkTx', createLinkTx)
		}
	}
	return (
		<div>
			<Button
				onClick={handleTransaction}
				disabled={!tokenAddress || !tokenAmount || !password}
			>
				Create Link
			</Button>
		</div>
	)
}
