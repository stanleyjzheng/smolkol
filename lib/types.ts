export type Bounty = {
	creator_address: string
	creator_ens: string | null
	amount: string // Using string to handle large ETH amounts with 18 decimals
	chainid: number
	completed: boolean
	search_string: string
	condition: {
		type: string
		count: number
	}
	slug: string
}
