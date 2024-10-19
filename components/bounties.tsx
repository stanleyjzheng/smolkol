import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'

// Type for the Bounty object
type Bounty = {
	creator_address: string
	creator_ens: string | null
	amount: string // ETH amount, stored as string due to large precision
	chainid: number
	completed: boolean
	search_string: string
	condition: {
		type: string
		count: number
	}
	slug: string
}

// Hardcoded ETH to USD conversion rate
const ETH_TO_USD = 1800 // Example: 1 ETH = 1800 USD

export default function BountyPage() {
	const [bounties, setBounties] = useState<Bounty[]>([])

	// Fetch bounties from the API
	useEffect(() => {
		const fetchBounties = async () => {
			try {
				const response = await fetch('/api/bounties')
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				const data = await response.json()
				setBounties(data.bounties)
			} catch (error) {
				console.error('Error fetching bounties:', error)
			}
		}

		fetchBounties()
	}, [])

	// Filter bounties into fillable (open) and completed (unfillable) lists
	const fillableBounties = bounties.filter((bounty) => !bounty.completed)
	const completedBounties = bounties.filter((bounty) => bounty.completed)

	// Helper function to format the creator display
	const getCreatorDisplay = (bounty: Bounty) => {
		return bounty.creator_ens
			? `Creator: ${bounty.creator_ens}`
			: `Creator: ${bounty.creator_address.slice(0, 6)}...${bounty.creator_address.slice(-4)}`
	}

	// Helper function to convert ETH to USD
	const convertEthToUsd = (amountInEth: string) => {
		const amount = parseFloat(amountInEth)
		return (amount * ETH_TO_USD).toFixed(2) // Convert ETH to USD and format to 2 decimal places
	}

	// Render Bounty Cards
	const renderBounties = (bountyList: Bounty[], isCompleted: boolean) => (
		<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
			{bountyList.map((bounty) => (
				<Card key={bounty.slug} className='flex flex-col'>
					<CardHeader>
						<CardTitle>{bounty.search_string}</CardTitle>
					</CardHeader>
					<CardContent className='flex-grow'>
						<p className='text-muted-foreground'>{getCreatorDisplay(bounty)}</p>
						<p className='text-muted-foreground'>
							Amount: {bounty.amount} ETH (~${convertEthToUsd(bounty.amount)}{' '}
							USD)
						</p>
						<p className='text-muted-foreground'>Chain ID: {bounty.chainid}</p>
						<p className='text-muted-foreground'>
							{isCompleted ? 'Status: Unfillable (Completed)' : 'Status: Open'}
						</p>
						<p className='text-muted-foreground'>
							Condition: {bounty.condition.count} {bounty.condition.type}
						</p>
					</CardContent>
					<CardFooter className='flex justify-between items-center'>
						<Button variant='outline'>View Details</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	)

	return (
		<div className='min-h-screen bg-background'>
			{/* Sticky Navbar */}
			<header className='sticky top-0 z-10 bg-background border-b shadow-md'>
				<div className='container mx-auto px-4 py-4 flex justify-between items-center'>
					{/* Left side (Branding or Title) */}
					<div className='flex items-center space-x-4'>
						<h1 className='text-2xl font-bold'>Bounty Board</h1>
					</div>

					{/* Right side (Action buttons or links) */}
					<div className='flex items-center space-x-4'>
						<Button>
							<PlusCircle className='mr-2 h-4 w-4' /> Create New Bounty
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className='container mx-auto px-4 py-8'>
				{/* Fillable Bounties (Open) */}
				<h2 className='text-xl font-semibold mb-4'>Open Bounties</h2>
				{renderBounties(fillableBounties, false)}

				{/* Divider */}
				{completedBounties.length > 0 && (
					<div className='my-8 border-t border-gray-300'></div>
				)}

				{/* Completed Bounties (Unfillable) */}
				{completedBounties.length > 0 && (
					<>
						<h2 className='text-xl font-semibold mb-4'>Completed Bounties</h2>
						{renderBounties(completedBounties, true)}
					</>
				)}
			</main>
		</div>
	)
}
