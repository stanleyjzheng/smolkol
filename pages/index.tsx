import Page from '@/components/page'
import Section from '@/components/section'
import BountyPage from '@/components/bounties'

const Index = () => {
	return (
		<Page>
			<Section>
				<div className='container mx-auto px-4 py-8'></div>
			</Section>
			<BountyPage />
		</Page>
	)
}

export default Index
