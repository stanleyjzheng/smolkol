import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

interface Bounty {
	creator_address: string
	creator_ens: string | null
	amount: string
	chainid: number
	completed: boolean
	search_string: string | null
	condition: any
	slug: string
}

export default function BountyPage() {
	const router = useRouter()
	const { slug } = router.query
	const { data: session, status } = useSession()

	const [bounty, setBounty] = useState<Bounty | null>(null)
	const [loading, setLoading] = useState(true)
	const [tweetLink, setTweetLink] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [submissionResult, setSubmissionResult] = useState<string | null>(null)

	useEffect(() => {
		if (slug) {
			fetch(`/api/bounty/${slug}`)
				.then((res) => res.json())
				.then((data) => {
					if (data.bounty) {
						setBounty(data.bounty)
					}
					setLoading(false)
				})
		}
	}, [slug])

	const handleClaim = async () => {
		if (!session) {
			alert('Please log in with Twitter to claim this bounty.')
			return
		}

		setSubmitting(true)
		setSubmissionResult(null)

		const res = await fetch(`/api/bounty/${slug}/claim`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ tweetLink }),
		})

		const data = await res.json()

		if (data.success) {
			setSubmissionResult(`Success! Transaction link: ${data.txLink}`)
		} else {
			setSubmissionResult(`Submission rejected: ${data.reason}`)
		}

		setSubmitting(false)
	}

	if (loading) {
		return <div className='p-4'>Loading...</div>
	}

	if (!bounty) {
		return <div className='p-4'>Bounty not found.</div>
	}

	return (
		<div className='p-4'>
			<h1 className='text-2xl font-bold mb-4'>Bounty Details</h1>
			<div className='mb-4'>
				<p>
					<strong>Creator Address:</strong> {bounty.creator_address}
				</p>
				{bounty.creator_ens && (
					<p>
						<strong>Creator ENS:</strong> {bounty.creator_ens}
					</p>
				)}
				<p>
					<strong>Amount:</strong> {parseFloat(bounty.amount) / 10 ** 18}
				</p>
				<p>
					<strong>Chain ID:</strong> {bounty.chainid}
				</p>
				<p>
					<strong>Completed:</strong> {bounty.completed ? 'Yes' : 'No'}
				</p>
				{bounty.search_string && (
					<p>
						<strong>Search String:</strong> {bounty.search_string}
					</p>
				)}
				<p>
					<strong>Condition:</strong> {JSON.stringify(bounty.condition)}
				</p>
				<p>
					<strong>Slug:</strong> {bounty.slug}
				</p>
			</div>

			{status === 'unauthenticated' ? (
				<button
					onClick={() => signIn('twitter')}
					className='px-4 py-2 bg-blue-500 text-white rounded-md mb-4'
				>
					Log in with Twitter
				</button>
			) : (
				<>
					<div className='mb-4'>
						<p className='mb-2'>Logged in as {session.user?.name}</p>
						<button
							onClick={() => signOut()}
							className='px-4 py-2 bg-gray-500 text-white rounded-md mb-4'
						>
							Log out
						</button>
					</div>

					<div className='mb-4'>
						<label
							htmlFor='tweetLink'
							className='block text-sm font-medium text-gray-700'
						>
							Paste your tweet link here:
						</label>
						<input
							type='text'
							name='tweetLink'
							id='tweetLink'
							className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
							value={tweetLink}
							onChange={(e) => setTweetLink(e.target.value)}
						/>
					</div>

					<button
						onClick={handleClaim}
						disabled={submitting}
						className='px-4 py-2 bg-blue-600 text-white rounded-md'
					>
						{submitting ? 'Submitting...' : 'Claim'}
					</button>

					{submissionResult && <div className='mt-4'>{submissionResult}</div>}
				</>
			)}
		</div>
	)
}
