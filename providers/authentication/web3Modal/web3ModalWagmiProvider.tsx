"use client"

import { manifest } from "@/manifests/manifests"
import { Chain } from "@wagmi/chains"
import { createWeb3Modal, useWeb3Modal } from "@web3modal/wagmi/react"
import { createConfig, http, WagmiProvider } from "wagmi"

import { marketplaceChain } from "../marketplaceWagmiChain"
import { wagmiConnectors } from "./web3ModalWagmiConnectors"

export const wagmiConfig = createConfig({
  connectors: wagmiConnectors,
  chains: [marketplaceChain] as [Chain, ...Chain[]],
  transports: {
    [marketplaceChain.id]: http(manifest.rpcUrl),
  },
  ssr: true,
})

export const useOpenLoginModal = () => {
  const { open } = useWeb3Modal()
  return open
}


createWeb3Modal({
  wagmiConfig,
  projectId: manifest.walletConnectProjectId,
  connectorImages: {
    "cometh":
      "https://pbs.twimg.com/profile_images/1679433363818442753/E2kNVLBe_400x400.jpg",
  },
})

export function MarketplaceWagmiProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
}
