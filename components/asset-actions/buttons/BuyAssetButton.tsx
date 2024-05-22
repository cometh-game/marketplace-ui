import { useEffect, useMemo, useState } from "react"
import { useCheapestListing } from "@/services/cometh-marketplace/buyOffersService"
import {
  AssetWithTradeData,
  OrderWithAsset,
  SearchAssetWithTradeData,
} from "@cometh/marketplace-sdk"
import { BigNumber } from "ethers"
import { Loader } from "lucide-react"

import { OrderAsset } from "@/types/assets"
import { useBuyAssetButton } from "@/lib/web3/flows/buy"
import { useValidateSellListing } from "@/lib/web3/hooks/useValidateSellListing"
import { Button } from "@/components/ui/Button"
import { Price } from "@/components/ui/Price"
import { useAssetIs1155 } from "@/components/erc1155/ERC1155Hooks"
import { TransactionDialogButton } from "@/components/TransactionDialogButton"
import { generateErrorMessages } from "@/components/utils/OrderErrorMessages"
import { Case, Switch } from "@/components/utils/Switch"

import { AddGasStep } from "../transaction-steps/AddGasStep"
import { AllowanceStep } from "../transaction-steps/AllowanceStep"
import { BuyQuantityStep } from "../transaction-steps/BuyQuantityStep"
import { BuyStep } from "../transaction-steps/BuyStep"
import { FundsStep } from "../transaction-steps/FundsStep"
import { UnwrapStep } from "../transaction-steps/UnwrapStep"

export type BuyAssetButtonProps = {
  asset: SearchAssetWithTradeData | AssetWithTradeData | OrderAsset
  listing?: OrderWithAsset
} & React.ComponentProps<typeof Button>

const useDefinedOrCheapestOrder = (
  tokenAddress: string,
  tokenId: string,
  order?: OrderWithAsset
) => {
  const { data: cheapestListing } = useCheapestListing(tokenAddress, tokenId)

  if (order) return order
  return cheapestListing
}

export function BuyAssetButton({
  asset,
  listing,
  size = "lg",
}: BuyAssetButtonProps) {
  const order = useDefinedOrCheapestOrder(
    asset.contractAddress,
    asset.tokenId,
    listing
  )
  const { requiredSteps, isLoading, currentStep, nextStep, reset } =
    useBuyAssetButton({ asset, order })
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(BigInt(1))
  const unitPrice = order?.totalUnitPrice
  const [errorMessages, setErrorMessages] = useState({ title: "", message: "" })
  const [isValidationLoading, setIsValidationLoading] = useState(false)

  const transactionPrice = useMemo(
    () => (unitPrice ? BigInt(unitPrice) * quantity : BigInt(0)),
    [unitPrice, quantity]
  )
  const isErc1155 = useAssetIs1155(asset)

  const validationResult = useValidateSellListing(
    asset,
    order as OrderWithAsset,
    isErc1155,
    open
  )

  useEffect(() => {
    if (open) {
      setIsValidationLoading(true)
    }
  }, [open])

  useEffect(() => {
    if (validationResult) {
      const newErrorMessages = generateErrorMessages(
        validationResult,
        order as OrderWithAsset
      )
      setErrorMessages(newErrorMessages)
    }
    setIsValidationLoading(false)
  }, [validationResult, order])
  if (!requiredSteps?.length || !currentStep || !order) return null

  const closeDialog = () => {
    setQuantity(BigInt(1))
    setOpen(false)
  }

  return (
    <TransactionDialogButton
      label={
        <>
          {size === "sm" ? (
            "Buy now"
          ) : (
            <span>
              Buy now for&nbsp;
              <Price amount={unitPrice} />
            </span>
          )}
        </>
      }
      open={open}
      onOpenChange={setOpen}
      currentStep={currentStep}
      steps={requiredSteps}
      onClose={reset}
      size={size}
      isLoading={isLoading || isValidationLoading}
      error={errorMessages.title}
    >
      <Switch value={currentStep.value}>
        <Case value="add-gas">
          <AddGasStep onValid={nextStep} />
        </Case>
        <Case value="buy-quantity">
          {isErc1155 && isValidationLoading ? (
            <div className="flex items-center justify-center ">
              <Loader size={22} className="animate-spin" />
            </div>
          ) : errorMessages.title ? (
            <div className="flex flex-col gap-5 ">
              <h3 className="w-full text-center text-xl font-semibold">
                {errorMessages.title}
              </h3>
              <p className="w-full text-center">{errorMessages.message}</p>
            </div>
          ) : (
            <BuyQuantityStep
              asset={asset}
              order={order}
              quantity={quantity}
              setQuantity={setQuantity}
              onValid={nextStep}
            />
          )}
        </Case>
        <Case value="add-funds">
          <FundsStep
            price={BigNumber.from(transactionPrice)}
            onValid={nextStep}
          />
        </Case>
        <Case value="unwrap-native-token">
          <UnwrapStep
            price={BigNumber.from(transactionPrice)}
            onValid={nextStep}
          />
        </Case>
        <Case value="allowance">
          <AllowanceStep
            price={BigNumber.from(transactionPrice)}
            onValid={nextStep}
          />
        </Case>
        <Case value="buy">
          {isValidationLoading ? (
            <div className="flex items-center justify-center ">
              <Loader size={22} className="animate-spin" />
            </div>
          ) : errorMessages.title ? (
            <div className="flex flex-col gap-5 ">
              <h3 className="w-full text-center text-xl font-semibold">
                {errorMessages.title}
              </h3>
              <p className="w-full text-center">{errorMessages.message}</p>
            </div>
          ) : (
            <BuyStep
              asset={asset}
              order={order}
              onValid={closeDialog}
              quantity={quantity}
              transactionPrice={transactionPrice}
            />
          )}
        </Case>
      </Switch>
    </TransactionDialogButton>
  )
}
