import { createPublicClient, http, formatUnits } from "viem";
import { mainnet, arbitrum, avalanche, bsc } from "viem/chains";

// Default address to use when no address is provided
export const DEFAULT_ADDRESS = "0xf7b10d603907658f690da534e9b7dbc4dab3e2d6";

// Common token contracts by chain
const TOKEN_CONTRACTS = {
  // Ethereum Mainnet
  1: {
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
    LINK: "0x514910771af9ca656af840dff83e8264ecf986ca",
  },
  // BSC
  56: {
    CAKE: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    USDT: "0x55d398326f99059ff775485246999027b3197955",
    BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  },
  // Avalanche
  43114: {
    JOE: "0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd",
    USDT: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
    USDC: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
  },
  // Arbitrum
  42161: {
    GMX: "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
    MAGIC: "0x539bde0d7dbd336b79148aa742883198bbf60342",
    USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  },
};

// ERC20 ABI for balanceOf and decimals
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

// Create public clients for each chain
const clients = {
  1: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  56: createPublicClient({
    chain: bsc,
    transport: http(),
  }),
  43114: createPublicClient({
    chain: avalanche,
    transport: http(),
  }),
  42161: createPublicClient({
    chain: arbitrum,
    transport: http(),
  }),
};

interface TokenBalance {
  symbol: string;
  balance: number;
  usdValue: number;
  icon: string;
}

interface ChainPortfolio {
  chain: string;
  chainId: number;
  symbol: string;
  balance: number;
  usdValue: number;
  icon: string;
  assets: TokenBalance[];
}

/**
 * Fetch native token balance (ETH, BNB, AVAX, etc.)
 */
async function getNativeBalance(
  chainId: number,
  address: `0x${string}`
): Promise<bigint> {
  const client = clients[chainId as keyof typeof clients];
  if (!client) return 0n;

  try {
    const balance = await client.getBalance({ address });
    return balance;
  } catch (error) {
    console.error(`Failed to fetch native balance for chain ${chainId}:`, error);
    return 0n;
  }
}

/**
 * Fetch ERC20 token balance
 */
async function getTokenBalance(
  chainId: number,
  tokenAddress: `0x${string}`,
  walletAddress: `0x${string}`
): Promise<{ balance: bigint; decimals: number }> {
  const client = clients[chainId as keyof typeof clients];
  if (!client) return { balance: 0n, decimals: 18 };

  try {
    const [balance, decimals] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [walletAddress],
      }) as Promise<bigint>,
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "decimals",
      }) as Promise<number>,
    ]);

    return { balance, decimals };
  } catch (error) {
    console.error(
      `Failed to fetch token balance for ${tokenAddress} on chain ${chainId}:`,
      error
    );
    return { balance: 0n, decimals: 18 };
  }
}

/**
 * Fetch portfolio data for a wallet address
 */
export async function fetchWalletPortfolio(
  address: string,
  prices: Record<string, { usd: number }> = {}
): Promise<ChainPortfolio[]> {
  const walletAddress = address as `0x${string}`;
  const portfolio: ChainPortfolio[] = [];

  // Ethereum
  const ethBalance = await getNativeBalance(1, walletAddress);
  const ethBalanceFormatted = parseFloat(formatUnits(ethBalance, 18));
  const ethAssets: TokenBalance[] = [];

  // Fetch Ethereum tokens
  const ethTokens = TOKEN_CONTRACTS[1];
  for (const [symbol, tokenAddress] of Object.entries(ethTokens)) {
    const { balance, decimals } = await getTokenBalance(
      1,
      tokenAddress as `0x${string}`,
      walletAddress
    );
    const balanceFormatted = parseFloat(formatUnits(balance, decimals));
    if (balanceFormatted > 0) {
      ethAssets.push({
        symbol,
        balance: balanceFormatted,
        usdValue: balanceFormatted * (prices[symbol]?.usd || 0),
        icon: `/media/token/${symbol.toLowerCase()}.svg`,
      });
    }
  }

  portfolio.push({
    chain: "Ethereum",
    chainId: 1,
    symbol: "ETH",
    balance: ethBalanceFormatted,
    usdValue: ethBalanceFormatted * (prices.ETH?.usd || 0),
    icon: "/media/token/eth.svg",
    assets: ethAssets,
  });

  // BSC
  const bnbBalance = await getNativeBalance(56, walletAddress);
  const bnbBalanceFormatted = parseFloat(formatUnits(bnbBalance, 18));
  const bnbAssets: TokenBalance[] = [];

  const bscTokens = TOKEN_CONTRACTS[56];
  for (const [symbol, tokenAddress] of Object.entries(bscTokens)) {
    const { balance, decimals } = await getTokenBalance(
      56,
      tokenAddress as `0x${string}`,
      walletAddress
    );
    const balanceFormatted = parseFloat(formatUnits(balance, decimals));
    if (balanceFormatted > 0) {
      bnbAssets.push({
        symbol,
        balance: balanceFormatted,
        usdValue: balanceFormatted * (prices[symbol]?.usd || 0),
        icon: `/media/token/${symbol.toLowerCase()}.svg`,
      });
    }
  }

  portfolio.push({
    chain: "Binance Smart Chain",
    chainId: 56,
    symbol: "BNB",
    balance: bnbBalanceFormatted,
    usdValue: bnbBalanceFormatted * (prices.BNB?.usd || 0),
    icon: "/media/token/bnb.svg",
    assets: bnbAssets,
  });

  // Avalanche
  const avaxBalance = await getNativeBalance(43114, walletAddress);
  const avaxBalanceFormatted = parseFloat(formatUnits(avaxBalance, 18));
  const avaxAssets: TokenBalance[] = [];

  const avaxTokens = TOKEN_CONTRACTS[43114];
  for (const [symbol, tokenAddress] of Object.entries(avaxTokens)) {
    const { balance, decimals } = await getTokenBalance(
      43114,
      tokenAddress as `0x${string}`,
      walletAddress
    );
    const balanceFormatted = parseFloat(formatUnits(balance, decimals));
    if (balanceFormatted > 0) {
      avaxAssets.push({
        symbol,
        balance: balanceFormatted,
        usdValue: balanceFormatted * (prices[symbol]?.usd || 0),
        icon: `/media/token/${symbol.toLowerCase()}.svg`,
      });
    }
  }

  portfolio.push({
    chain: "Avalanche",
    chainId: 43114,
    symbol: "AVAX",
    balance: avaxBalanceFormatted,
    usdValue: avaxBalanceFormatted * (prices.AVAX?.usd || 0),
    icon: "/media/token/avax.svg",
    assets: avaxAssets,
  });

  // Arbitrum
  const arbBalance = await getNativeBalance(42161, walletAddress);
  const arbBalanceFormatted = parseFloat(formatUnits(arbBalance, 18));
  const arbAssets: TokenBalance[] = [];

  const arbTokens = TOKEN_CONTRACTS[42161];
  for (const [symbol, tokenAddress] of Object.entries(arbTokens)) {
    const { balance, decimals } = await getTokenBalance(
      42161,
      tokenAddress as `0x${string}`,
      walletAddress
    );
    const balanceFormatted = parseFloat(formatUnits(balance, decimals));
    if (balanceFormatted > 0) {
      arbAssets.push({
        symbol,
        balance: balanceFormatted,
        usdValue: balanceFormatted * (prices[symbol]?.usd || 0),
        icon: `/media/token/${symbol.toLowerCase()}.svg`,
      });
    }
  }

  portfolio.push({
    chain: "Arbitrum One",
    chainId: 42161,
    symbol: "ARB",
    balance: arbBalanceFormatted,
    usdValue: arbBalanceFormatted * (prices.ARB?.usd || 0),
    icon: "/media/token/arb.svg",
    assets: arbAssets,
  });

  return portfolio;
}
