"use client"

import { motion } from "framer-motion"
import { LayoutDashboard, Coins, TrendingDown, ArrowUpDown, User, Activity } from "lucide-react"

interface DynamicNavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function DynamicNavigation({ activeSection, setActiveSection }: DynamicNavigationProps) {
  // Add the oracles navigation item to the navItems array
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "lend", label: "Lend", icon: Coins },
    { id: "borrow", label: "Borrow", icon: TrendingDown },
    { id: "swap", label: "Swap", icon: ArrowUpDown },
    { id: "portfolio", label: "Portfolio", icon: User },
    { id: "pools", label: "Pools", icon: Activity },
    { id: "oracles", label: "Oracles", icon: Activity },
  ]

  return (
    <motion.nav
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="sticky top-0 z-20 backdrop-blur-md bg-black/20 border-b border-white/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 bg-slate-800/50 rounded-2xl p-2 border border-white/10">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    relative px-4 py-2 rounded-xl font-medium transition-all duration-300
                    ${isActive ? "text-white" : "text-gray-400 hover:text-white"}
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  <div className="relative flex items-center space-x-2">
                    <motion.div
                      animate={
                        isActive
                          ? {
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1],
                            }
                          : {}
                      }
                      transition={{ duration: 0.5 }}
                    >
                      <Icon size={18} />
                    </motion.div>
                    <span className="hidden sm:block">{item.label}</span>
                  </div>

                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-1 h-1 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
