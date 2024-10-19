import { DynamicWidget } from '@dynamic-labs/sdk-react-core'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PlusCircle } from 'lucide-react'

const Appbar = () => {
	const router = useRouter()

	return (
		<div className='sticky top-0 z-10 bg-background border-b shadow-md'>
			<header className='bg-background border-b'>
				<div className='container max-w-screen-xl mx-auto px-4 py-4 flex justify-between items-center'>
					{/* Left side: Logo */}
					<Link href='/'>
						<h1 className='text-2xl font-bold'>SmolKOL</h1>
					</Link>

					{/* Right side: Buttons (Create Bounty + DynamicWidget) */}
					<div className='flex items-center space-x-4'>
						{/* Create Bounty Button */}
						<Link href='/create'>
							<button className='flex items-center px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow'>
								<PlusCircle className='mr-2 h-4 w-4' />
								Create Bounty
							</button>
						</Link>

						{/* DynamicWidget Button */}
						<DynamicWidget variant='modal' />
					</div>
				</div>
			</header>
		</div>
	)
}

export default Appbar
