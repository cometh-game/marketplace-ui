import { useEffect, useState } from "react"
import {
  useERC20Balance,
  useNativeBalance,
} from "@/services/balance/balanceService"
import { OrderWithAsset } from "@cometh/marketplace-sdk"
import { Address } from "viem"

import globalConfig from "@/config/globalConfig"

import {
  validateBuyOffer,
  ValidateBuyOfferResult,
} from "../flows/validateOrder"
import { useNFTSwapv4 } from "../nft-swap-sdk"

export const useValidateBuyOffer = (order: OrderWithAsset, isOpen: boolean) => {
  const [validationResult, setValidationResult] =
    useState<ValidateBuyOfferResult | null>(null)
  const [isLoadingValidation, setIsLoadingValidation] = useState(false)
  const nftSwapSdk = useNFTSwapv4()
  const { balance: nativeBalance } = useNativeBalance(order.maker as Address)
  const { balance: erc20Balance } = useERC20Balance(
    globalConfig.ordersErc20.address,
    order.maker as Address
  )

  useEffect(() => {
    async function validate() {
      if (order.totalPrice && nftSwapSdk) {
        setIsLoadingValidation(true)
        const validationResults = await validateBuyOffer({
          order,
          erc20Balance,
          nativeBalance,
          nftSwapSdk,
        })
        setValidationResult(validationResults)
        setIsLoadingValidation(false)
      }
    }
    if (isOpen) {
      validate()
    } else {
      setValidationResult(null)
      setIsLoadingValidation(false)
    }
  }, [order, nativeBalance, nftSwapSdk, erc20Balance, isOpen])

  return { validationResult, isLoadingValidation }
}
