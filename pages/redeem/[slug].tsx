import Page from '@/components/page'
import Section from '@/components/section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2Icon, ShareIcon } from 'lucide-react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Image from 'next/image'

enum BorrowMoneyStep {
	SelectAsset,
	ConfirmDetails,
	Success,
}

export default function PriceCollateral({}) {
	const router = useRouter()
	const [step, setStep] = useState(BorrowMoneyStep.SelectAsset)
	const [collateralPercentage, setCollateralPercentage] = useState<
		number | null
	>(null)
	const [acknowledgedRisks, setAcknowledgedRisks] = useState(false)
	const loanId = router.query.slug

	return (
		<Page>
			<div className='max-w-2xl mx-auto px-4 py-8'>
				<div className='bg-white shadow-lg rounded-lg overflow-hidden'>
					<Image
						src={`https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80&ixid=${loanId}`}
						alt='Beach house'
						width={800}
						height={400}
						className='w-full h-64 object-cover'
					/>
					<div className='p-6'>
						{step === BorrowMoneyStep.SelectAsset && (
							<div>
								<h2 className='text-2xl font-semibold text-custom-primary mb-4'>
									Price Collateral
								</h2>
								<p className='text-zinc-600 mb-4'>I want to price</p>
								<div
									className={`w-full flex items-center gap-2 p-3 rounded-md mb-4 cursor-pointer bg-custom-accent text-black/90`}
								>
									<p className='font-semibold'>Beach House</p>
								</div>
								<div className='mb-4'>
									<Label
										htmlFor='collateral-percentage'
										className='block mb-2 text-sm font-medium text-gray-700'
									>
										Collateral Percentage
									</Label>
									<Input
										type='number'
										id='collateral-percentage'
										placeholder='10%'
										onChange={(e) =>
											setCollateralPercentage(Number(e.target.value))
										}
										className='w-full p-2 border border-gray-300 rounded-md focus:ring-custom-primary focus:border-custom-primary'
									/>
								</div>
								<Button
									disabled={!collateralPercentage}
									onClick={() => setStep(BorrowMoneyStep.ConfirmDetails)}
									className='w-full bg-custom-primary text-white hover:bg-custom-accent hover:text-custom-primary transition-colors duration-300'
								>
									Continue
								</Button>
							</div>
						)}
						{step === BorrowMoneyStep.ConfirmDetails && (
							<div>
								<h2 className='text-2xl font-semibold text-custom-primary mb-4'>
									Confirm Details
								</h2>
								<div className='space-y-4 mb-6'>
									<div className='flex items-center justify-between'>
										<p className='text-gray-600'>Collateral Requirement</p>
										<p className='font-semibold'>$100,000</p>
									</div>
									<div className='flex items-center justify-between'>
										<p className='text-gray-600'>Collateral Percentage</p>
										<p className='font-semibold'>{collateralPercentage}%</p>
									</div>
									<div className='flex items-center justify-between'>
										<p className='text-gray-600'>Duration</p>
										<p className='font-semibold'>
											{new Date().toLocaleDateString()}
										</p>
									</div>
									<div className='flex items-center justify-between'>
										<p className='text-gray-600'>You post</p>
										<p className='font-semibold'>$10,000</p>
									</div>
								</div>
								<div className='flex items-center gap-2 mb-4'>
									<Input
										type='checkbox'
										id='acknowledged-risks'
										onChange={(e) => setAcknowledgedRisks(e.target.checked)}
										className='w-4 h-4 text-custom-primary border-gray-300 rounded focus:ring-custom-primary'
									/>
									<Label
										htmlFor='acknowledged-risks'
										className='flex-1 text-sm text-gray-700'
									>
										I can lose up to 100% of my capital if the borrower defaults
										on the loan
									</Label>
								</div>
								<OraclePriceLoanTransaction
									loanId={BigInt(loanId as string)}
									collateralPercentage={collateralPercentage ?? 0}
									disabled={collateralPercentage === 0 || !acknowledgedRisks}
									onSuccess={() => setStep(BorrowMoneyStep.Success)}
								/>
							</div>
						)}
						{step === BorrowMoneyStep.Success && (
							<div className='text-center'>
								<div className='flex items-center justify-center gap-2 mb-4'>
									<CheckCircle2Icon className='w-10 h-10 text-custom-primary' />
									<h2 className='text-2xl font-semibold text-custom-primary'>
										Success!
									</h2>
								</div>
								<p className='mb-4'>
									You have priced the <strong>{loanId}</strong> loan on real
									lend!
								</p>
								<p className='mb-6'>
									After the loan ends, you can withdraw your USDC from the
									portfolio page
								</p>
								<Button
									className='bg-custom-primary text-white hover:bg-custom-accent hover:text-custom-primary transition-colors duration-300'
									onClick={() => {
										setStep(BorrowMoneyStep.SelectAsset)
										router.push('/')
									}}
								>
									Return to Home
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</Page>
	)
}
