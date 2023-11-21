import { manifest } from "@/manifests"
import { AssetWithTradeData } from "@cometh/marketplace-sdk"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ContractTransaction } from "ethers"

import { useCurrentViewerAddress } from "@/lib/web3/auth"
import { useNFTSwapv4 } from "@/lib/web3/nft-swap-sdk"
import { toast } from "@/components/ui/toast/use-toast"

import { getFirstListing } from "../cometh-marketplace/offers"
import { handleOrderbookError } from "../errors"

export type BuyAssetOptions = {
  asset: AssetWithTradeData
}

export const useBuyAsset = () => {
  const client = useQueryClient()
  const nftSwapSdk = useNFTSwapv4()
  const viewerAddress = useCurrentViewerAddress()

  return useMutation(
    ["buy-asset"],
    async ({ asset }: BuyAssetOptions) => {
      if (!nftSwapSdk || !viewerAddress)
        throw new Error("Could not initialize SDK")

      const order = await getFirstListing(asset.tokenId)

      const signature = order.signature || {
        signatureType: 4,
        v: 0,
        r: "0x0000000000000000000000000000000000000000000000000000000000000000",
        s: "0x0000000000000000000000000000000000000000000000000000000000000000",
      }

      const fillTx: ContractTransaction = await nftSwapSdk.fillSignedOrder({
        direction: 0,
        maker: order.maker,
        taker: order.taker,
        expiry: new Date(order.expiry).getTime() / 1000,
        nonce: order.nonce,
        erc20Token: order.erc20Token,
        erc20TokenAmount: order.erc20TokenAmount,
        fees: [
          {
            recipient: order.fees[0].recipient,
            amount: order.fees[0].amount,
            feeData: order.fees[0].feeData!,
          },
        ],
        erc721Token: manifest.contractAddress,
        erc721TokenId: order.tokenId,
        erc721TokenProperties: [],
        signature: signature,
      })

      const fillTxReceipt = await fillTx.wait()
      console.log(
        `🎉 🥳 Order filled (buy-asset). TxHash: ${fillTxReceipt.transactionHash}`
      )
      return fillTxReceipt
    },
    {
      onSuccess: (_, { asset }) => {
        client.invalidateQueries(["cometh", "assets", asset.tokenId])
        toast({
          title: "NFT bought!",
        })
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: handleOrderbookError(error, {
            400: "Bad request",
            500: "Internal orderbook server error",
          }),
        })
      },
    }
  )
}
