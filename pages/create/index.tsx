import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import Page from '@/components/page'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'

export default function CreateBounty() {
	const [formData, setFormData] = useState({
		creatorAddress: '',
		creatorEns: '',
		amount: '',
		chainId: '',
		searchString: '',
		conditionType: '',
		conditionCount: '',
	})

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (value: string) => {
		setFormData((prev) => ({ ...prev, conditionType: value }))
	}

	const { primaryWallet, network } = useDynamicContext()

	let chain_id: any

	// a terrible race condition but i suck at js
	primaryWallet
		?.getNetwork()
		.then((result) => {
			chain_id = result
			console.log('Chain ID:', chain_id)
		})
		.catch((error) => {
			console.error('Error:', error)
		})
	let creator_address = primaryWallet?.address

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const loadingToastId = toast.loading('Creating bounty...')
		console.log('Submitting bounty:', formData)

		if (primaryWallet && isEthereumWallet(primaryWallet) && network) {
			try {
				const loading = toast.loading('Redeeming link...')
				const client = await primaryWallet.getWalletClient(network.toString())
				const redeemTx = await client.sendTransaction({
					to: '0x4307f766ED0fF932ce3367e1177180FfA647C46D',
					value: BigInt(parseFloat(formData.amount) * 10 ** 18),
				})
				toast.dismiss(loading)
				toast.success('Token redeemed!')
			} catch (error) {
				toast.dismiss()
				toast.error('Error redeeming token')
				console.error(error)
				return
			}
		}

		const dataToSend = {
			...formData,
			chain_id: chain_id,
			creator_address: creator_address,
		}

		try {
			const response = await fetch('/api/create-bounty', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(dataToSend),
			})
			toast.dismiss(loadingToastId)
			if (response.ok) {
				toast.success('Bounty created successfully!')
			} else {
				toast.error('Failed to create bounty')
			}
		} catch (error) {
			console.error(error)
			toast.error('An error occurred')
		}
	}

	return (
		<Page>
			<div className='container mx-auto py-10'>
				<Card className='max-w-2xl mx-auto'>
					<CardHeader>
						<CardTitle>Create a New Bounty</CardTitle>
						<CardDescription>
							Fill in the details to create a new tweet bounty.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit}>
							<div className='grid gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='amount'>Bounty Amount (ETH)</Label>
									<Input
										id='amount'
										name='amount'
										type='number'
										step='0.001'
										placeholder='0.1'
										value={formData.amount}
										onChange={handleInputChange}
										required
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='searchString'>Tweet Description</Label>
									<Textarea
										id='searchString'
										name='searchString'
										placeholder='A tweet which...'
										value={formData.searchString}
										onChange={handleInputChange}
										required
									/>
								</div>
								<div className='grid gap-2'>
									<Label>Condition</Label>
									<div className='flex gap-4'>
										<Select
											onValueChange={handleSelectChange}
											value={formData.conditionType}
										>
											<SelectTrigger className='w-[180px]'>
												<SelectValue placeholder='Select type' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='likes'>Likes</SelectItem>
												<SelectItem value='views'>Views</SelectItem>
											</SelectContent>
										</Select>
										<Input
											id='conditionCount'
											name='conditionCount'
											type='number'
											placeholder='Count'
											value={formData.conditionCount}
											onChange={handleInputChange}
											required
										/>
									</div>
								</div>
							</div>
						</form>
					</CardContent>
					<CardFooter>
						<Button type='submit' onClick={handleSubmit}>
							Create Bounty
						</Button>
					</CardFooter>
				</Card>
			</div>
		</Page>
	)
}
