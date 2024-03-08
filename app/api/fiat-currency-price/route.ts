import { NextRequest } from "next/server"
import { coingeckoClient } from "@/services/coingecko/client"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const id = searchParams.get("id")
  const currency = searchParams.get("currency")

  try {
    if (!id || !currency) {
      throw new Error("Invalid request")
    }

    const res = await coingeckoClient.get(
      `/simple/price?ids=${id}&vs_currencies=${currency}`,
      {
        id: `fiat-currency-price-${id}-${currency}`,
        cache: {
          ttl: 15 * 60 * 1000,
        },
      }
    )
    console.log("CACHED " + res.cached + ' for ' + id + ' ' + currency)
    const currentFiatPrice = res.data

    return Response.json({ currentFiatPrice }, { status: 200 })
  } catch (error: any) {
    console.error(error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
