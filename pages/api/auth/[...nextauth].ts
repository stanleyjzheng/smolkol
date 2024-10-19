// pages/api/auth/[...nextauth].ts

import NextAuth from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'

export default NextAuth({
	providers: [
		TwitterProvider({
			clientId: process.env.AUTH_TWITTER_ID as string,
			clientSecret: process.env.AUTH_TWITTER_SECRET as string,
			version: '2.0',
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			// Persist the OAuth access_token and access_token_secret to the token right after signin
			if (account) {
				token.accessToken = account.access_token
			}
			return token
		},
		async session({ session, token }) {
			// Send properties to the client, like an access_token and user id from a provider.
			session.accessToken = token.accessToken
			return session
		},
	},
})
