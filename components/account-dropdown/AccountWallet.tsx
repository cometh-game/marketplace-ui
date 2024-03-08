import Image from "next/image"
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu"

import { Button } from "../ui/Button"

type AccountWalletProps = {
  name: string
  icon: string
  isComethWallet: boolean
  handleConnect?: () => void
}

export function AccountWallet({
  name,
  icon,
  isComethWallet,
  handleConnect,
}: AccountWalletProps) {
  return (
    <DropdownMenuItem className="outline-none">
      {isComethWallet ? (
        <div className="mb-1 text-sm font-semibold">
          Smart wallet (biometric)
        </div>
      ) : (
        <div className="mb-1 text-sm font-semibold">Wallets</div>
      )}
      <Button
        variant="secondary"
        className="h-12 w-full justify-start gap-2 text-[15px]"
        onClick={() => handleConnect && handleConnect()}
      >
        <Image
          src={icon}
          width={30}
          height={30}
          alt={name}
          className="rounded-full"
        />
        {name}
      </Button>
    </DropdownMenuItem>
  )
}
