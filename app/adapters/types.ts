import { AssetWithTradeData } from "@cometh/marketplace-sdk"
import { Provider } from "@ethersproject/providers"
import {
  NftOrderV4Serialized,
  NftSwapV4,
  SignedNftOrderV4,
} from "@traderxyz/nft-swap-sdk"
import { Signer } from "ethers"

export type OrderParams = {
  signer: Signer | Provider
  signedOrder: SignedNftOrderV4
  order: NftOrderV4Serialized
}

export type MakeBuyOfferParams = {
  asset: AssetWithTradeData
} & OrderParams

export type CancelOrderParams = {
  nonce: string
  signer: Signer
  nftSwapSdk: NftSwapV4 | null
}

export type SellAssetOptions = {
  asset: AssetWithTradeData
} & OrderParams
