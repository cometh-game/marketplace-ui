import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Address, isAddressEqual } from "viem"
import { useAccount } from "wagmi"

import { BuyOffer } from "@/types/buy-offers"
import { useNFTSwapv4 } from "@/lib/web3/nft-swap-sdk"
import { useInvalidateAssetQueries } from "@/components/marketplace/asset/AssetDataHook"

import { cancelOrder } from "./cancelOrderService"

export type UseCanCancelBuyOfferParams = {
  offer: BuyOffer
}

export const useCanCancelBuyOffer = ({ offer }: UseCanCancelBuyOfferParams) => {
  const account = useAccount()
  const viewer = account.address
  return useMemo(() => {
    if (!viewer) return false
    if (isAddressEqual(offer.emitter.address, viewer)) return true
    return false
  }, [viewer, offer])
}

export type CancelBuyOfferParams = {
  offer: BuyOffer
}

export const useCancelBuyOffer = () => {
  const client = useQueryClient()
  const nftSwapSdk = useNFTSwapv4()
  const invalidateAssetQueries = useInvalidateAssetQueries()

  return useMutation({
    mutationKey: ["cancelBuyOffer"],
    mutationFn: async ({ offer }: CancelBuyOfferParams) => {
      const nonce = offer.trade.nonce

      return await cancelOrder({
        nonce,
        nftSwapSdk,
      })
    },

    onSuccess: (_, { offer }) => {
      invalidateAssetQueries(
        offer.asset?.contractAddress as Address,
        offer.asset?.tokenId || "",
        offer.asset?.owner || ""
      )
      client.invalidateQueries({
        queryKey: ["cometh", "received-buy-offers", offer.owner.address],
      })
      client.invalidateQueries({
        queryKey: ["cometh", "sent-buy-offers", offer.emitter.address],
      })
    },
  })
}
