import Page from '@/components/page'
import Section from '@/components/section'
import Image from 'next/image'

export default function HowPricingWorks() {
	return (
		<Page>
			<Section className='max-w-3xl mx-auto px-4 py-8'>
				<div className='bg-white shadow-lg rounded-lg overflow-hidden'>
					<Image
						src='https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=1200&q=80'
						alt='Pricing concept'
						width={1200}
						height={400}
						className='w-full h-64 object-cover'
					/>
					<div className='p-6'>
						<h1 className='text-2xl font-bold text-custom-primary mb-6'>
							How Pricing Works
						</h1>

						<div className='space-y-6'>
							<section>
								<h2 className='text-lg font-semibold text-custom-primary mb-2'>
									1. Collateral Evaluation
								</h2>
								<p className='text-gray-700'>
									When a borrower lists a real world asset as collateral, the
									market begins the evaluation process to determine its fair
									market value.
								</p>
							</section>

							<section>
								<h2 className='text-lg font-semibold text-custom-primary mb-2'>
									2. Market Data Analysis
								</h2>
								<p className='text-gray-700'>
									Market actors analyze data, including recent sales, local real
									estate trends, and economic indicators to determine the
									asset&apos;s value.
								</p>
							</section>

							<section>
								<h2 className='text-lg font-semibold text-custom-primary mb-2'>
									3. Risk Assessment
								</h2>
								<p className='text-gray-700'>
									The algorithm assesses potential risks associated with the
									property, including market volatility, seasonal demand
									fluctuations, and environmental factors.
								</p>
							</section>

							<section>
								<h2 className='text-lg font-semibold text-custom-primary mb-2'>
									4. Collateral Percentage Determination
								</h2>
								<p className='text-gray-700'>
									Based on the evaluation, a collateral percentage is suggested.
									This represents the portion of the property&apos;s value that
									can be used as collateral for the loan.
								</p>
							</section>

							<section>
								<h2 className='text-lg font-semibold text-custom-primary mb-2'>
									5. Oracle Confirmation
								</h2>
								<p className='text-gray-700'>
									The final pricing and collateral percentage are confirmed by
									our oracle service, ensuring accuracy and fairness for both
									borrowers and lenders.
								</p>
							</section>
						</div>
					</div>
				</div>
			</Section>
		</Page>
	)
}
