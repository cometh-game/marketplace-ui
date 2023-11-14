"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { AccountWallet } from "./account-wallet"

export type SigninDropdownProps = {
  buttonVariant?: ButtonProps["variant"]
  handleConnect?: (isAlembicWallet: boolean) => Promise<void>
}

export function SigninDropdown({ buttonVariant, handleConnect }: SigninDropdownProps) {
  const wallets = [
    {
      name: "Cometh",
      icon: "/icons/cometh-connect.png",
      isComethWallet: true,
    },
    {
      name: "Metamask",
      icon: "/icons/metamask.svg",
      isComethWallet: false,
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant}>Signin</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" asChild>
        <Card className="p-4" style={{ width: "324px" }}>
          <CardHeader className="mb-4 p-0">
            <CardTitle className="text-xl">Signin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-0">
            {wallets.map((wallet) => (
              <AccountWallet
                key={wallet.name}
                name={wallet.name}
                icon={wallet.icon}
                isComethWallet={wallet.isComethWallet}
                handleConnect={handleConnect}
              />
            ))}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
