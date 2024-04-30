import wethAbi from "@/abis/wethAbi"
import { useMutation } from "@tanstack/react-query"
import { BigNumber, Signer } from "ethers"
import { Address } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

import globalConfig from "@/config/globalConfig"
import { toast } from "@/components/ui/toast/hooks/useToast"

export type WrapTokenOptions = {
  amount: BigNumber
  account: Address
  signer: Signer
  wrapContractAddress: Address
}

export type WrapTokenMutationOptions = {
  amount: BigNumber
}

export const useWrapToken = () => {
  const account = useAccount()
  const viewerAddress = account?.address
  const viemPublicClient = usePublicClient()
  const { data: viemWalletClient } = useWalletClient()

  return useMutation({
    mutationKey: ["wrap"],
    mutationFn: async ({ amount }: WrapTokenMutationOptions) => {
      if (
        !viemPublicClient ||
        !viemWalletClient ||
        !globalConfig.network.wrappedNativeToken.address
      ) {
        throw new Error("Could not wrap token")
      }

      const txHash = await viemWalletClient.writeContract({
        address: globalConfig.ordersErc20.address,
        abi: wethAbi,
        functionName: "deposit",
        args: [],
        value: amount.toBigInt()
      })
      const transaction = await viemPublicClient.waitForTransactionReceipt({
        hash: txHash,
      })
      return transaction
    },

    onSuccess: () => {
      toast({
        title: "Token wrapped!",
        description: "Your token has been wrapped.",
      })
    },
  })
}
