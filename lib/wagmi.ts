import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  arbitrum,
  avalanche,
  bsc,
} from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Lamina - Crypto Portfolio Dashboard",
  projectId: "YOUR_PROJECT_ID", // Get this from https://cloud.walletconnect.com/
  chains: [mainnet, arbitrum, avalanche, bsc],
  ssr: true, // For Next.js SSR support
});
