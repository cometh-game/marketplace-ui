"use client"

import { useEffect, useMemo, useState } from "react"
import { useFilterableNFTsQuery } from "@/services/cometh-marketplace/search-assets"
import { AssetSearchFilters } from "@cometh/marketplace-sdk"
import { useInView } from "react-intersection-observer"

import {
  SerializedMarketplacePanelFilters,
  deserializeFilters,
} from "@/lib/utils/seed"
import { Loading } from "@/components/ui/loading"

import { AssetCard } from "./asset-card"
import { AssetCardsList } from "./asset-cards-list"
import { AssetsSearchEmpty } from "./asset-search-empty"
import { MarketplaceFiltersDropdown } from "./filters-dropdown"
import { NFTStateFilters } from "./nft-state-filters"
import { SearchAsset } from "./search-asset"
import { MarketplaceSortDropdown } from "./sort-dropdown"

export type AssetsSearchGridProps = {
  filters: SerializedMarketplacePanelFilters
  filteredBy?: Omit<AssetSearchFilters, "contractAddress">
}

export const AssetsSearchGrid = ({
  filters: filtersRaw,
  filteredBy = {},
}: any) => {
  const { ref: loadMoreRef, inView } = useInView({ threshold: 1 })
  const [search, setSearch] = useState("")
  const [initialResults, setInitialResults] = useState<number | null>(null)

  const filtersDefinition = useMemo(
    () => deserializeFilters(filtersRaw),
    [filtersRaw]
  )
  const {
    data: nfts,
    refetch,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFilterableNFTsQuery({
    search,
    ...filteredBy,
  })

  const assets = useMemo(() => {
    return (nfts?.pages ?? []).map((r) => r?.nfts.assets).flat()
  }, [nfts?.pages])

  const results = useMemo(() => {
    return nfts?.pages[0]?.total ?? 0
  }, [nfts?.pages])

  useEffect(() => {
    if (results && initialResults === null) {
      setInitialResults(results)
    }
  }, [results])

  useEffect(() => {
    if (nfts) refetch()
  }, [nfts])

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [inView])

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="relative mb-10 flex w-full flex-wrap items-center justify-between gap-4">
        <NFTStateFilters assets={assets} results={initialResults} />
        <div className="flex items-center gap-x-3">
          <SearchAsset onChange={setSearch} />
          <MarketplaceFiltersDropdown filters={filtersDefinition} />
          <MarketplaceSortDropdown />
        </div>
      </div>

      {isLoading && <Loading />}

      {!isLoading && assets.length === 0 ? (
        <AssetsSearchEmpty />
      ) : (
        <>
          <AssetCardsList>
            {assets.map((asset, index) => (
              <AssetCard key={index} asset={asset} />
            ))}
          </AssetCardsList>
          <div ref={loadMoreRef} className="mt-10">
            {isFetchingNextPage ? "Loading more..." : hasNextPage}
          </div>
        </>
      )}
    </div>
  )
}