"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  AssetAttribute,
  AssetWithTradeData,
  SearchAssetWithTradeData,
} from "@cometh/marketplace-sdk"
import { animated, config, useSpring } from "react-spring"
import { useBoolean } from "usehooks-ts"

import { getRandomArrayElement } from "@/lib/utils/arrays"
import { getAssetColor } from "@/lib/utils/colors-attributes"
import { shortenTokenId } from "@/lib/utils/token"
import { cn } from "@/lib/utils/utils"
import { useCurrentViewerAddress } from "@/lib/web3/auth"
import { Appear } from "@/components/ui/appear"
import { AssetImage } from "@/components/ui/asset-image"
import { Card } from "@/components/ui/card"
import { MakeBuyOfferButton } from "@/components/asset-actions/buttons/make-buy-offer"
import { SellAssetButton } from "@/components/asset-actions/buttons/sell"

import { Price } from "../../ui/price"

export type AssetCardProps = {
  asset: SearchAssetWithTradeData & {
    metadata: {
      attributes?: AssetAttribute[]
    }
  }
  children?: React.ReactNode | React.ReactNode[]
}

export type AssetCardBaseProps = {
  src?: string | null
  owner?: boolean
  children?: React.ReactNode | React.ReactNode[]
  fallback?: string | null
  asset: SearchAssetWithTradeData
}

export type AssetImageContainerProps = {
  children?: React.ReactNode | React.ReactNode[]
  color?: string | null
  className?: string
}

export function AssetImageContainer({
  children,
  color,
  className,
}: AssetImageContainerProps) {
  const active = useBoolean(false)
  const hover = useBoolean(false)

  const style = useSpring({
    to: {
      transform: hover.value
        ? `rotateX(2deg) rotateY(0deg) rotateZ(0deg) translateY(-8px) scale(${
            active.value ? 0.95 : 1.01
          })`
        : `rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(0px) scale(${
            active.value ? 0.95 : 1
          })`,
    },
    config: config.gentle,
  })

  return (
    <animated.div
      className="z-10"
      onMouseEnter={hover.setTrue}
      onMouseLeave={hover.setFalse}
      onMouseDown={active.setTrue}
      onMouseUp={active.setFalse}
      style={style}
    >
      <div
        className={cn(
          "relative h-auto w-[84px] overflow-hidden rounded-md px-2 py-5 max-sm:rounded-md sm:h-[380px] sm:w-full sm:px-4 sm:py-10",
          !color && "bg-muted",
          className
        )}
      >
        {children}
      </div>
    </animated.div>
  )
}

export function AssetCardBase({
  src,
  fallback,
  children,
  owner,
  asset,
}: AssetCardBaseProps) {
  return (
    <Appear
      enabled={true}
      condition={!!true}
      delay={getRandomArrayElement([0, 50, 100, 150, 200])}
      className="relative w-full cursor-pointer justify-self-center"
    >
      <Card
        className={cn(
          "flex w-full flex-1 flex-row items-center gap-3 border-transparent bg-transparent p-0 shadow-none transition-all duration-200 ease-in-out sm:inline-flex sm:flex-col sm:items-start sm:border-2"
        )}
      >
        <Link href={`/marketplace/${asset.tokenId}`} className="sm:w-full">
          <AssetImageContainer
            color={getAssetColor(asset)}
            className={cn(owner && "bg-[#f4f2e8]")}
          >
            <AssetImage
              src={src}
              fallback={fallback}
              height={380}
              width={320}
              className="z-20 h-full w-full rounded-lg object-contain"
            />
          </AssetImageContainer>
        </Link>
        <div className="w-full">{children}</div>
      </Card>
    </Appear>
  )
}

export function AssetCard({ asset, children }: AssetCardProps) {
  const viewerAddress = useCurrentViewerAddress()

  const owner = useMemo(() => {
    return asset.owner === viewerAddress
  }, [viewerAddress, asset.owner])

  if (!asset.metadata.name) {
    return null
  }

  return (
    <AssetCardBase
      src={asset.cachedImageUrl}
      fallback={asset.metadata.image}
      owner={owner}
      asset={asset}
    >
      <div>
        <Link
          href={`/marketplace/${asset.tokenId}`}
          className={cn(
            "mb-4 flex flex-nowrap items-center text-base font-semibold leading-tight text-primary sm:mb-2"
          )}
        >
          <span className="inline-block max-w-[100%_-_80px] truncate">
            {asset.metadata.name}
          </span>
          <span>&nbsp;#{shortenTokenId(asset.tokenId, 4)}</span>
        </Link>
        <div className="w-full rounded-lg bg-muted/80 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                Price
              </div>
              {asset.orderbookStats.lowestSalePrice ? (
                <Price amount={asset.orderbookStats.lowestSalePrice} />
              ) : owner ? (
                <SellAssetButton
                  asset={asset as unknown as AssetWithTradeData}
                  isVariantLink
                />
              ) : (
                "No listed yet"
              )}
            </div>
            <div>
              <div className="text-sm font-medium">
                Highest offer
              </div>
              <div className="text-end">
                {asset.orderbookStats.highestOfferPrice ? (
                  <Price amount={asset.orderbookStats.highestOfferPrice} />
                ) : !owner ? (
                  <MakeBuyOfferButton
                    asset={asset as unknown as AssetWithTradeData}
                    isVariantLink
                  />
                ) : (
                  "No offers yet"
                )}
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </AssetCardBase>
  )
}
