"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Zap, CheckCircle } from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"

interface WalletState {
  isConnected: boolean
  address: string
  balance: string
  chainId: number
  isConnecting: boolean
}

interface DynamicWalletConnectProps {
  walletState: WalletState
  setWalletState: (state: WalletState) => void
}

export function DynamicWalletConnect({ walletState, setWalletState }: DynamicWalletConnectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState("")

  const walletOptions = [
    {
      name: "MetaMask",
      icon: "🦊",
      description: "Connect using MetaMask",
      installed: typeof window !== "undefined" && window.ethereum?.isMetaMask,
    },
    {
      name: "WalletConnect",
      icon: "🔗",
      description: "Scan with WalletConnect",
      installed: true,
    },
    {
      name: "Coinbase Wallet",
      icon: "🔵",
      description: "Connect to Coinbase Wallet",
      installed: typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet,
    },
    {
      name: "Rainbow",
      icon: "🌈",
      description: "Connect using Rainbow",
      installed: true,
    },
  ]

  // Simulate real Web3 connection
  const handleWalletConnect = async (walletName: string) => {
    setSelectedWallet(walletName)
    setWalletState({ ...walletState, isConnecting: true })

    try {
      // Check if MetaMask is available and user selected it
      if (walletName === "MetaMask" && window.ethereum?.isMetaMask) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        })

        const balanceInEth = Number.parseInt(balance, 16) / Math.pow(10, 18)

        setWalletState({
          isConnected: true,
          address: accounts[0],
          balance: balanceInEth.toFixed(4),
          chainId: 1,
          isConnecting: false,
        })
      } else {
        // Simulate connection for other wallets
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const mockAddress = "0x742d35Cc6634C0532925a3b8D4C2C4e0C8b8E8E8"
        setWalletState({
          isConnected: true,
          address: mockAddress,
          balance: "2.4567",
          chainId: 1,
          isConnecting: false,
        })
      }

      setIsDialogOpen(false)
      toast({
        title: "Wallet Connected!",
        description: `Successfully connected to ${walletName}`,
      })
    } catch (error) {
      setWalletState({ ...walletState, isConnecting: false })
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = () => {
    setWalletState({
      isConnected: false,
      address: "",
      balance: "0",
      chainId: 1,
      isConnecting: false,
    })
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletState.address)
    toast({
      title: "Address Copied!",
      description: "Wallet address copied to clipboard",
    })
  }

  // Listen for account changes if MetaMask is available
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          handleDisconnect()
        } else if (walletState.isConnected) {
          setWalletState({
            ...walletState,
            address: accounts[0],
          })
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [walletState])

  if (walletState.isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className="bg-slate-800/50 border border-slate-600/50 text-white hover:bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-300"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(34, 197, 94, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              />
              <span>{formatAddress(walletState.address)}</span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                {walletState.balance} ETH
              </Badge>
              <ChevronDown className="w-4 h-4" />
            </div>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-800/95 border-slate-600 backdrop-blur-sm">
          <DropdownMenuItem onClick={copyAddress} className="text-white hover:bg-slate-700">
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem className="text-white hover:bg-slate-700">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Etherscan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDisconnect} className="text-red-400 hover:bg-slate-700">
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
        <motion.button
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          animate={
            walletState.isConnecting
              ? {
                  scale: [1, 1.05, 1],
                  opacity: [1, 0.8, 1],
                }
              : {}
          }
          transition={{ duration: 0.5, repeat: walletState.isConnecting ? Number.POSITIVE_INFINITY : 0 }}
        >
          <div className="flex items-center space-x-2">
            {walletState.isConnecting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
                <Zap className="w-4 h-4" />
              </>
            )}
          </div>
        </motion.button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800/95 border-slate-600 text-white backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose your preferred wallet to connect to NebulaLend
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <AnimatePresence>
            {walletOptions.map((wallet, index) => (
              <motion.button
                key={wallet.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleWalletConnect(wallet.name)}
                disabled={walletState.isConnecting}
                className="flex items-center justify-between p-4 bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{wallet.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-white">{wallet.name}</p>
                    <p className="text-sm text-gray-400">{wallet.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {wallet.installed && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + index * 0.1 }}>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </motion.div>
                  )}
                  {selectedWallet === wallet.name && walletState.isConnecting && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full"
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
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
