import { UserFacingFeeStruct } from "@traderxyz/nft-swap-sdk"
import { BigNumber } from "ethers"

const FEE_PERCENTAGE_PRECISION = 6

export const calculateFeesAmount = (price: BigNumber, percentage: number): string => {
  const intFeePercentage = percentage * 10 ** FEE_PERCENTAGE_PRECISION

  const feeAmount = 
    BigNumber.from(intFeePercentage)
      .mul(price)
      .div(100)
      .div(10 ** FEE_PERCENTAGE_PRECISION)
      .toString()

  return feeAmount.toString()
}

export const totalFeesFromCollection = (fees: UserFacingFeeStruct[]) => {
  return fees.reduce((total, fee) => total.add(fee.amount), BigNumber.from(0))
}
