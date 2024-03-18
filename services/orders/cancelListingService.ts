import { useEthersSigner } from "@/providers/authentication/viemToEthersHelper"
import { AssetWithTradeData } from "@cometh/marketplace-sdk"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useNFTSwapv4 } from "@/lib/web3/nft-swap-sdk"
import { toast } from "@/components/ui/toast/hooks/useToast"

import { getFirstListing } from "../cometh-marketplace/buyOffersService"
import { cancelOrder } from "./cancelOrderService"

export const useCancelListing = () => {
  const client = useQueryClient()
  const nftSwapSdk = useNFTSwapv4()
  const signer = useEthersSigner()

  return useMutation({
    mutationKey: ["cancelListing"],
    mutationFn: async (asset: AssetWithTradeData) => {
      const nonce = (await getFirstListing(asset.tokenId)).nonce
      if (!nonce) throw new Error("No nonce found on asset")
      if (!signer) throw new Error("Could not get signer")

      return await cancelOrder({ nonce, nftSwapSdk })
    },

    onSuccess: (_, asset) => {
      client.invalidateQueries({ queryKey: ["cometh", "assets", asset.tokenId] })
      client.invalidateQueries({ queryKey: ["cometh", "search"] }) 
      toast({
        title: "Your order has been canceled.",
      })
    },
  })
}
