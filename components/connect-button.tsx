import { useState } from "react"
import { useWeb3OnboardContext } from "@/providers/web3-onboard"
import { useConnect } from "@/services/web3/use-connect"

import { useIsConnecting } from "@/lib/web3/auth"
import { Button } from "@/components/ui/button"

import { AccountDropdownButton } from "./account-dropdown/button"

export function ConnectButton({ children }: { children?: React.ReactNode }) {
  const { isConnected, setIsconnected, reconnecting, storeWalletAddress } =
    useWeb3OnboardContext()
  const { connect } = useConnect()
  const isConnecting = useIsConnecting()
  const [isLoading, setIsLoading] = useState(false)

  if (isConnected && !children)
    return <AccountDropdownButton variant="default" />

  async function handleConnect(isAlembicWallet = false) {
    setIsLoading(true)
    try {
      await connect({
        isAlembicWallet,
        existingWalletAddress: storeWalletAddress,
      })
      setIsconnected(true)
    } catch (e) {
      console.error("Erreur lors de la connexion au portefeuille:", e)
    } finally {
      setIsLoading(false)
    }
  }

  if (reconnecting) {
    return <Button>Reconnecting...</Button>
  }

  if (!isConnected || isLoading) {
    const label = isConnecting ? (
      "Connecting..."
    ) : (
      <>
        Connect&nbsp;<span className="max-md:hidden">wallet</span>
      </>
    )

    return (
      <div className="flex items-center gap-2">
        <Button
          size="default"
          onClick={() => handleConnect()}
          disabled={isLoading}
        >
          {label}
        </Button>
        <Button
          size="default"
          onClick={() => handleConnect(true)}
          disabled={isLoading}
        >
          Connect with cometh
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
