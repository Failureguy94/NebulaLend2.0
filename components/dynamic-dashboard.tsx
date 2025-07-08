"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { DynamicStatsCards } from "./dynamic-stats-cards"
import { AnimatedPoolsList } from "./animated-pools-list"
import { DynamicLendingInterface } from "./dynamic-lending-interface"
import { DynamicBorrowingInterface } from "./dynamic-borrowing-interface"
import { DynamicSwapInterface } from "./dynamic-swap-interface"
import { DynamicPortfolioView } from "./dynamic-portfolio-view"
import { DynamicPoolsView } from "./dynamic-pools-view"
// Import the Chainlink Oracle Dashboard
import { ChainlinkOracleDashboard } from "./chainlink-oracle-dashboard"

interface WalletState {
  isConnected: boolean
  address: string
  balance: string
  chainId: number
  isConnecting: boolean
}

interface DynamicDashboardProps {
  activeSection: string
  walletState: WalletState
}

export function DynamicDashboard({ activeSection, walletState }: DynamicDashboardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <DynamicStatsCards />
            <AnimatedPoolsList />
          </motion.div>
        )
      case "lend":
        return <DynamicLendingInterface walletState={walletState} />
      case "borrow":
        return <DynamicBorrowingInterface walletState={walletState} />
      case "swap":
        return <DynamicSwapInterface walletState={walletState} />
      case "portfolio":
        return <DynamicPortfolioView walletState={walletState} />
      case "pools":
        return <DynamicPoolsView walletState={walletState} />
      // Add a new case for the oracle dashboard in the renderSection function
      case "oracles":
        return <ChainlinkOracleDashboard />
      default:
        return <DynamicStatsCards />
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      {renderSection()}
    </motion.div>
  )
}
