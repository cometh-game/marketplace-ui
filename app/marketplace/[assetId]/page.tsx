"use client"

import { manifest } from "@/manifests"
import { useAssetDetails } from "@/services/cometh-marketplace/search-assets"
import { useAssetTransfers } from "@/services/cometh-marketplace/transfers"

import { AssetActivities } from "@/components/activities/asset-details/tabs"
import AssetDetails from "@/components/marketplace/asset/header"
import { Loading } from "@/components/ui/loading"
import { AssetHeaderImage } from "@/components/marketplace/asset/image"

export default function DetailsPage({
  params,
}: {
  params: { assetId: string }
}) {
  const { assetId } = params
  const { data: asset } = useAssetDetails(manifest.contractAddress, assetId)
  const { data: assetTransfers } = useAssetTransfers(
    manifest.contractAddress,
    assetId
  )

  const loading = !asset || !assetTransfers

  return (
    <div className="container py-10">
      {loading && <Loading />}
      {asset && (
        <div className="flex w-full flex-col flex-wrap gap-6 md:gap-12 lg:flex-row lg:items-center">
          <AssetHeaderImage asset={asset} />
          <AssetDetails asset={asset} />
          {assetTransfers && (
            <AssetActivities
              asset={asset}
              assetTransfers={assetTransfers}
            />
          )}
        </div>
      )}
    </div>
  )
}
