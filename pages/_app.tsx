import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

import { getConfig } from '@/lib/wagmi'

// Setting up list of evmNetworks
const evmNetworks = [
	{
		blockExplorerUrls: ['https://sepolia.basescan.org/'],
		chainId: 84532,
		chainName: 'Base Sepolia',
		iconUrls: ['https://app.dynamic.xyz/assets/networks/eth.svg'],
		name: 'Base Sepolia',
		nativeCurrency: {
			decimals: 18,
			name: 'Ether',
			symbol: 'ETH',
			iconUrl: 'https://app.dynamic.xyz/assets/networks/eth.svg',
		},
		networkId: 1,
		rpcUrls: ['https://sepolia.base.org'],
	},
	{
		blockExplorerUrls: [
			'https://giant-half-dual-testnet.explorer.testnet.skalenodes.com',
		],
		chainId: 974399131,
		chainName: 'Skale Calypso Hub Testnet',
		iconUrls: [''],
		name: 'Skale Calypso Hub Testnet',
		nativeCurrency: {
			decimals: 18,
			name: 'sFuel',
			symbol: 'SFUEL',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://testnet.skalenodes.com/v1/giant-half-dual-testnet'],
	},
	{
		blockExplorerUrls: ['	https://sepolia.uniscan.xyz/'],
		chainId: 1301,
		chainName: 'Unichain Sepolia',
		iconUrls: [''],
		name: 'Unichain Sepolia',
		nativeCurrency: {
			decimals: 18,
			name: 'Ether',
			symbol: 'ETH',
			iconUrl: 'https://app.dynamic.xyz/assets/networks/eth.svg',
		},
		networkId: 1,
		rpcUrls: ['	https://sepolia.unichain.org'],
	},
	{
		blockExplorerUrls: ['https://cardona-zkevm.polygonscan.com/'],
		chainId: 1101,
		chainName: 'Polygon zkEVM Mainnet',
		iconUrls: [''],
		name: 'Polygon zkEVM Mainnet',
		nativeCurrency: {
			decimals: 18,
			name: 'Polygon',
			symbol: 'POL',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://zkevm-rpc.com'],
	},
	{
		blockExplorerUrls: ['https://testnet.storyscan.xyz/'],
		chainId: 1513,
		chainName: 'Story Public Testnet',
		iconUrls: [''],
		name: 'Story Public Testnet',
		nativeCurrency: {
			decimals: 18,
			name: 'Story',
			symbol: 'IP',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://testnet.storyrpc.io/'],
	},
	{
		blockExplorerUrls: ['https://testnet.airdao.io/explorer/'],
		chainId: 22040,
		chainName: 'AirDAO Testnet',
		iconUrls: [''],
		name: 'AirDAO Testnet',
		nativeCurrency: {
			decimals: 18,
			name: 'Ambrosus',
			symbol: 'AMB',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://network.ambrosus-test.io'],
	},
	{
		blockExplorerUrls: ['https://testnet.flowdiver.io/'],
		chainId: 545,
		chainName: 'Flow EVM testnet',
		iconUrls: [''],
		name: 'Flow EVM testnet',
		nativeCurrency: {
			decimals: 18,
			name: 'Flow',
			symbol: 'FLOW',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://testnet.evm.nodes.onflow.org/'],
	},
	{
		// Bridged XDAI
		blockExplorerUrls: ['https://gnosisscan.io/'],
		chainId: 100,
		chainName: 'Gnosis Mainnet',
		iconUrls: [''],
		name: 'Gnosis Mainnet',
		nativeCurrency: {
			decimals: 18,
			name: 'xDAI',
			symbol: 'xDAI',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://rpc.ankr.com/gnosis/'],
	},
	{
		// Testnet Obtained
		blockExplorerUrls: ['https://devnet.neonscan.org'],
		chainId: 245022926,
		chainName: 'Neon EVM Testnet',
		iconUrls: [''],
		name: 'Neon EVM Testnet',
		nativeCurrency: {
			decimals: 18,
			name: 'Neon Token',
			symbol: 'NEON',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://devnet.neonevm.org'],
	},
	{
		// Rootstock - Bridged
		blockExplorerUrls: ['https://explorer.testnet.rootstock.io/'],
		chainId: 31,
		chainName: 'Rootstock Testnet',
		iconUrls: [''],
		name: 'Rootstock Testnet',
		nativeCurrency: {
			decimals: 18,
			name: 'Rootstock BTC',
			symbol: 'trBTC',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://mycrypto.testnet.rsk.co/'],
	},
	{
		blockExplorerUrls: ['https://hashscan.io/testnet/'],
		chainId: 296,
		chainName: 'Hedera EVM Testnet',
		iconUrls: [''],
		name: 'Hedera EVM Testnet',
		nativeCurrency: {
			decimals: 18,
			name: 'Hedera',
			symbol: 'HBAR',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://testnet.hashio.io/api'],
	},
	// Unlimit
	{
		// Zircuit - Bridged
		blockExplorerUrls: ['https://explorer.testnet.zircuit.com/'],
		chainId: 48899,
		chainName: 'Zircuit Testnet',
		iconUrls: [''],
		name: 'Zircuit Testnet',
		nativeCurrency: {
			decimals: 18,
			name: 'Ethereum',
			symbol: 'ETH',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://zircuit1-testnet.p2pify.com'],
	},
	// Morph Bridged
	{
		blockExplorerUrls: ['https://explorer-holesky.morphl2.io/'],
		chainId: 2810,
		chainName: 'Morph Holesky Testnet',
		iconUrls: [''],
		name: 'Morph Holesky Testnet',
		nativeCurrency: {
			decimals: 18,
			name: 'Ethereum',
			symbol: 'ETH',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://rpc-quicknode-holesky.morphl2.io/'],
	},
	// Phenix
	{
		blockExplorerUrls: ['https://explorer.helium.fhenix.zone/'],
		chainId: 8008135,
		chainName: 'Fhenix Helium Testnet',
		iconUrls: [''],
		name: 'Morph Holesky Testnet',
		nativeCurrency: {
			decimals: 18,
			name: 'Test Fhenix',
			symbol: 'tFHE',
			iconUrl: '',
		},
		networkId: 1,
		rpcUrls: ['https://api.helium.fhenix.zone/'],
	},
]

export default function App({ Component, pageProps }: AppProps) {
	const [config] = useState(() => getConfig())
	const [queryClient] = useState(() => new QueryClient())

	return (
		<SessionProvider session={pageProps.session}>
			<WagmiProvider config={config} initialState={pageProps.initialState}>
				<QueryClientProvider client={queryClient}>
					<DynamicContextProvider
						settings={{
							environmentId: 'f8b26bda-3d5a-4c6c-86e3-ce0fc5008e8c',
							walletConnectors: [EthereumWalletConnectors],
							overrides: { evmNetworks },
						}}
					>
						<ThemeProvider
							attribute='class'
							defaultTheme='system'
							disableTransitionOnChange
						>
							<Toaster />
							<Component {...pageProps} />
						</ThemeProvider>
					</DynamicContextProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</SessionProvider>
	)
}
