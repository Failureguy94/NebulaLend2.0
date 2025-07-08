"use client"

import { useState } from "react"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface WalletConnectProps {
  isConnected: boolean
  address: string
  onConnect: (address: string) => void
  onDisconnect: () => void
}

export function WalletConnect({ isConnected, address, onConnect, onDisconnect }: WalletConnectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const walletOptions = [
    { name: "MetaMask", icon: "🦊", description: "Connect using MetaMask" },
    { name: "WalletConnect", icon: "🔗", description: "Scan with WalletConnect" },
    { name: "Coinbase Wallet", icon: "🔵", description: "Connect to Coinbase Wallet" },
    { name: "Rainbow", icon: "🌈", description: "Connect using Rainbow" },
  ]

  const handleWalletConnect = (walletName: string) => {
    // Mock wallet connection - in real app, this would integrate with actual wallet
    const mockAddress = "0x742d35Cc6634C0532925a3b8D4C2C4e0C8b8E8E8"
    onConnect(mockAddress)
    setIsDialogOpen(false)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
  }

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{formatAddress(address)}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-600">
          <DropdownMenuItem onClick={copyAddress} className="text-white hover:bg-slate-700">
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem className="text-white hover:bg-slate-700">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Etherscan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDisconnect} className="text-red-400 hover:bg-slate-700">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-600 text-white">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose your preferred wallet to connect to NebulaLend
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="justify-start h-16 bg-slate-700 border-slate-600 hover:bg-slate-600"
              onClick={() => handleWalletConnect(wallet.name)}
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{wallet.icon}</span>
                <div className="text-left">
                  <p className="font-semibold">{wallet.name}</p>
                  <p className="text-sm text-gray-400">{wallet.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <Badge variant="outline" className="border-green-500 text-green-400">
            Ethereum Mainnet
          </Badge>
          <span>•</span>
          <span>Secure & Decentralized</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
