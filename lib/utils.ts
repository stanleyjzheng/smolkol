import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getToken } from 'next-auth/jwt'
import { NextApiRequest } from 'next'
import axios from 'axios'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function extractTweetId(tweetLink: string): string | null {
	const regex = /x\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/
	const match = tweetLink.match(regex)
	return match ? match[3] : null
}

type TweetDetails = {
	username: string
	likeCount: number
	viewCount: number
	text: string
}

function extractTweetDetails(apiResponse: any): TweetDetails | null {
	try {
		const tweetData =
			apiResponse.data.threaded_conversation_with_injections_v2.instructions[0]
				.entries[0].content.itemContent.tweet_results.result

		const username = tweetData.core.user_results.result.legacy.screen_name
		const likeCount = tweetData.legacy.favorite_count
		const viewCount = parseInt(tweetData.views.count, 10) // Assuming the count is a string and needs to be converted to a number
		const text = tweetData.legacy.full_text

		return {
			username,
			likeCount,
			viewCount,
			text,
		}
	} catch (error) {
		console.error('Error extracting tweet details:', error)
		return null
	}
}

async function fetchTweetDetails(
	tweet_id: string,
): Promise<TweetDetails | null> {
	try {
		const response = await axios.get(
			'https://x.com/i/api/graphql/nBS-WpgA6ZG0CyNHD517JQ/TweetDetail',
			{
				params: {
					variables: `{"focalTweetId":"${tweet_id}","with_rux_injections":false,"rankingMode":"Relevance","includePromotedContent":true,"withCommunity":true,"withQuickPromoteEligibilityTweetFields":true,"withBirdwatchNotes":true,"withVoice":true}`,
					features:
						'{"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"articles_preview_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"creator_subscriptions_quote_tweet_preview_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_enhance_cards_enabled":false}',
					fieldToggles:
						'{"withArticleRichContentState":true,"withArticlePlainText":false,"withGrokAnalyze":false,"withDisallowedReplyControls":false}',
				},
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0',
					Accept: '*/*',
					'Accept-Language': 'en-US,en;q=0.5',
					'Accept-Encoding': 'gzip, deflate, br, zstd',
					Referer: `https://x.com/PyTorch/status/${tweet_id}`,
					'content-type': 'application/json',
					'X-Client-UUID': '0123b28b-e624-4004-b780-a1a70847178c',
					'x-twitter-auth-type': 'OAuth2Session',
					'x-csrf-token':
						'32cc2b53c000123929166d17e100e09226bc4cdd434ee12c70f9f78d0d2274db63e80c24bf5b52c4920a354828fa9e0597a7569276af1015b825fd06ac64d2d693d8461b72fa63cf79430ac956ff6e67',
					'x-twitter-client-language': 'en',
					'x-twitter-active-user': 'yes',
					'x-client-transaction-id':
						'Y1JBDYdR9MSDg1A4BSgtkzgbFkPyUmlKW+4WuG5X3/VUKj9OclAH60XUNT+9cYkO6OLbp2H+2ZTW8FfAokUw+mezfUylYA',
					'Sec-Fetch-Dest': 'empty',
					'Sec-Fetch-Mode': 'cors',
					'Sec-Fetch-Site': 'same-origin',
					authorization:
						'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
					Connection: 'keep-alive',
					Cookie:
						'guest_id_marketing=v1%3A172912413878990301; guest_id_ads=v1%3A172912413878990301; night_mode=0; auth_token=6af37960ad6e5c9c67a0efcf0b936ec2efafcbf2; kdt=SoCkk6cKIyJxFioDk3pQH63PlKAdTICnCkB52kcR; auth_multi="1530747804976439296:708674f078e94fee9aca8f4f05eeb77b5b898d39"; personalization_id="v1_ZzGJBGWFgcpgkM2r8C+Nvg=="; twid=u%3D4240324273; ads_prefs="HBIRAAA="; lang=en; guest_id=v1%3A172912413878990301; ct0=32cc2b53c000123929166d17e100e09226bc4cdd434ee12c70f9f78d0d2274db63e80c24bf5b52c4920a354828fa9e0597a7569276af1015b825fd06ac64d2d693d8461b72fa63cf79430ac956ff6e67',
					Pragma: 'no-cache',
					'Cache-Control': 'no-cache',
					TE: 'trailers',
				},
			},
		)

		// Extract tweet details using the extraction function
		return extractTweetDetails(response.data)
	} catch (error) {
		console.error('Error fetching tweet details:', error)
		return null
	}
}

export async function fetchTweetData(req: NextApiRequest, tweetId: string) {
	const token = await getToken({ req })
	const accessToken = token?.accessToken as string

	if (!accessToken) {
		throw new Error('User is not authenticated')
	}

	const response = await fetchTweetDetails(tweetId)

	return response
}
