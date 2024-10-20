import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Alert } from '@/components/ui/alert'
import Page from '@/components/page'

import { formatCondition } from '../../lib/utils'

interface LoaderProps {
	className?: string
}

const Loader = ({ className }: LoaderProps) => (
	<div
		className={`w-12 h-12 border-4 border-dashed rounded-full border-blue-500 ${className}`}
	></div>
)

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
		return (
			<div className='flex justify-center items-center h-screen'>
				<Loader className='animate-spin' />
			</div>
		)
	}

	if (!bounty) {
		return (
			<div className='p-4'>
				<Alert variant='destructive'>Bounty not found.</Alert>
			</div>
		)
	}

	return (
		<Page>
			<Card className='p-6 max-w-2xl mx-auto my-8'>
				<CardHeader>
					<CardTitle>Bounty Details</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableBody>
							<TableRow>
								<TableCell>Creator Address:</TableCell>
								<TableCell>{bounty.creator_address}</TableCell>
							</TableRow>
							{bounty.creator_ens && (
								<TableRow>
									<TableCell>Creator ENS:</TableCell>
									<TableCell>{bounty.creator_ens}</TableCell>
								</TableRow>
							)}
							<TableRow>
								<TableCell>Amount:</TableCell>
								<TableCell>{parseFloat(bounty.amount) / 10 ** 18}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Chain ID:</TableCell>
								<TableCell>{bounty.chainid}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Completed:</TableCell>
								<TableCell>{bounty.completed ? 'Yes' : 'No'}</TableCell>
							</TableRow>
							{bounty.search_string && (
								<TableRow>
									<TableCell>Search String:</TableCell>
									<TableCell>{bounty.search_string}</TableCell>
								</TableRow>
							)}
							<TableRow>
								<TableCell>Condition:</TableCell>
								<TableCell>{formatCondition(bounty.condition)}</TableCell>
							</TableRow>
						</TableBody>
					</Table>

					{status === 'unauthenticated' ? (
						<Button onClick={() => signIn('twitter')} className='mt-4'>
							Log in with Twitter
						</Button>
					) : (
						<>
							<div className='flex items-center mt-4 mb-4'>
								<Avatar className='mr-4'>
									<AvatarImage
										src={session?.user?.image}
										alt={session?.user?.name}
									/>
									<AvatarFallback>
										{session?.user?.name?.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className='text-sm'>Logged in as {session?.user?.name}</p>
									<Button
										variant='secondary'
										size='sm'
										onClick={() => signOut()}
									>
										Log out
									</Button>
								</div>
							</div>

							<div className='mb-4'>
								<Label htmlFor='tweetLink' className='mb-2'>
									Paste your tweet link here:
								</Label>
								<Input
									type='text'
									name='tweetLink'
									id='tweetLink'
									value={tweetLink}
									onChange={(e) => setTweetLink(e.target.value)}
									placeholder='https://twitter.com/yourtweet'
								/>
							</div>

							<Button onClick={handleClaim} disabled={submitting}>
								{submitting ? 'Submitting...' : 'Claim'}
							</Button>

							{submissionResult && (
								<Alert
									variant={
										submissionResult.startsWith('Success')
											? 'default'
											: 'destructive'
									}
									className='mt-4'
								>
									{submissionResult}
								</Alert>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</Page>
	)
}
