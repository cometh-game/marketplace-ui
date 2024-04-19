import { useMemo } from "react"
import { CollectionStandard } from "@cometh/marketplace-sdk"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"

import { comethMarketplaceClient } from "@/lib/clients"

export const fetchGetCollection = async (contractAddress: Address) => {
  return comethMarketplaceClient.collection.getCollection(
    contractAddress.toLocaleLowerCase()
  )
}

export const useGetCollection = (collectionAddress: Address) => {
  return useQuery({
    queryKey: ["cometh", "collection", collectionAddress],
    queryFn: () => {
      return fetchGetCollection(collectionAddress)
    },
    staleTime: 1000 * 15,
  })
}

export const useGetCollectionStandard = (
  collectionAddress: Address
): CollectionStandard | undefined => {
  const collection = useGetCollection(collectionAddress)
  return collection.data?.standard
}

export const useCollectionIsERC1155 = (collectionAddress: Address) => {
  const collectionStandard = useGetCollectionStandard(collectionAddress)
  return useMemo(() => {
    return collectionStandard === CollectionStandard.ERC1155
  }, [collectionStandard])
}
