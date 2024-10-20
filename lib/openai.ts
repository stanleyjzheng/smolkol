import zod from 'zod'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

const BountyJudgeSchema = zod.object({
	matched_request: zod.boolean(),
	reason: zod.string().nullable(), // Reason is null if matched_request is true
})

type BountyJudgeResponse = zod.infer<typeof BountyJudgeSchema>

export async function judgeBounty(condition: string, tweet: string) {
	try {
		const completion = await openai.beta.chat.completions.parse({
			model: 'gpt-4o-2024-08-06',
			messages: [
				{
					role: 'system',
					content: `You are an AI judge for a bounty. You will be given a bounty request and a tweet. The bounty request is made by a company which wishes to have a tweet which meets certain conditions. You must decide if the tweet meets those conditions.

          If it is a close decision (ie, if the tweet is neutral but the bounty asks for a positive sentiment), bias towards letting the bounty pay; but if it's unrelated at all, don't pay it out.

          Examples:

          > Bounty requirement: A positive tweet about Uniswap.
          > Tweet: "Think CZ is wrong; no Uniswap exploit. All Uniswap NFT's from a single address which approved exploiter. Plus, transaction trace checks out too. '_isApprovedOrOwner' is legit."

          Since this is denying an exploit occurred, it's a positive tweet. Pay out the bounty.

          > Bounty requirement: A positive tweet about Uniswap.
          > Tweet: "Uniswap is a scam. It's a front for the government to track your transactions."

          This is not a positive tweet. Do not pay out the bounty.

          > Bounty requirement: A positive tweet about Uniswap.
          > Tweet: "Cryptokitties is my favourite NFT project."

          This is not a tweet about Uniswap at all. Do not pay out the bounty.

          > Bounty requirement: A shitpost about Uniswap.
          > Tweet: "New Uniswap"

          This isn't super clear, but there may be an image attached, so it's likely a shitpost. Pay out the bounty.
          `,
				},
				{
					role: 'user',
					content: `Bounty requirement: "${condition}"
                    Tweet: "${tweet}"`,
				},
			],
			response_format: zodResponseFormat(BountyJudgeSchema, 'bounty_judge'),
		})
		const publisher = 'https://walrus-testnet-publisher.nodes.guru'
		const response = await fetch(`${publisher}/v1/store`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				completion,
			}),
		})
		const data = await response.json()
		const blobId = data.newlyCreated.blobObject.blobId
		const storedBlobs = localStorage.getItem('storedBlobs')
		if (!storedBlobs) {
			localStorage.setItem('storedBlobs', blobId)
		} else {
			localStorage.setItem('storedBlobs', storedBlobs + '|' + blobId)
		}

		const bounty_judge = completion.choices[0].message

		// If the model refuses to respond, handle the refusal
		if (bounty_judge.refusal) {
			console.log('Refusal:', bounty_judge.refusal)
		} else {
			const parsedResponse: BountyJudgeResponse | null = bounty_judge.parsed
			return parsedResponse
		}
	} catch (error) {
		console.error('Error:', error)
	}
	return null
}
