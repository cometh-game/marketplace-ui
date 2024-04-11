import Link from "next/link"
import { useGetCollection } from "@/services/cometh-marketplace/collectionService"
import { Row } from "@tanstack/react-table"
import { Address } from "viem"

import { BuyOffer } from "@/types/buy-offers"
import { Button } from "@/components/ui/Button"

export type CollectionCellProps = {
  row: Row<BuyOffer>
}

export const CollectionCell = ({ row }: CollectionCellProps) => {
  const tokenAddress = row.original.trade.tokenAddress
  const { data: collection } = useGetCollection(tokenAddress as Address)

  return (
    <Link href={`/nfts/${tokenAddress}`}>
      <Button variant="ghost" className="gap-x-2 font-medium">
        {collection?.name || "Collection"}
      </Button>
    </Link>
  )
}
