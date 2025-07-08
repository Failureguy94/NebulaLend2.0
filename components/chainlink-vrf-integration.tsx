"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dice6, Shield, Zap, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface VRFRequest {
  id: string
  requestId: string
  status: "pending" | "fulfilled" | "failed"
  randomNumber?: number
  gasUsed?: number
  timestamp: number
  purpose: string
}

export function ChainlinkVRFIntegration() {
  const [vrfRequests, setVrfRequests] = useState<VRFRequest[]>([])
  const [isRequesting, setIsRequesting] = useState(false)
  const [vrfStats, setVrfStats] = useState({
    totalRequests: 0,
    successRate: 99.8,
    avgFulfillmentTime: 45,
    gasEfficiency: 92,
  })

  // Simulate VRF request
  const requestRandomness = async (purpose: string) => {
    setIsRequesting(true)

    const newRequest: VRFRequest = {
      id: Date.now().toString(),
      requestId: `0x${Math.random().toString(16).substr(2, 8)}`,
      status: "pending",
      timestamp: Date.now(),
      purpose,
    }

    setVrfRequests((prev) => [newRequest, ...prev.slice(0, 4)])

    // Simulate VRF fulfillment
    setTimeout(
      () => {
        setVrfRequests((prev) =>
          prev.map((req) =>
            req.id === newRequest.id
              ? {
                  ...req,
                  status: "fulfilled",
                  randomNumber: Math.floor(Math.random() * 1000000),
                  gasUsed: 150000 + Math.floor(Math.random() * 50000),
                }
              : req,
          ),
        )
        setIsRequesting(false)

        setVrfStats((prev) => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
        }))
      },
      3000 + Math.random() * 2000,
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "text-green-400 bg-green-500/20"
      case "pending":
        return "text-yellow-400 bg-yellow-500/20"
      case "failed":
        return "text-red-400 bg-red-500/20"
      default:
        return "text-gray-400 bg-gray-500/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fulfilled":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "failed":
        return <Shield className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* VRF Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: vrfStats.totalRequests, icon: Dice6, color: "from-blue-500 to-cyan-500" },
          {
            label: "Success Rate",
            value: `${vrfStats.successRate}%`,
            icon: CheckCircle,
            color: "from-green-500 to-emerald-500",
          },
          {
            label: "Avg Fulfillment",
            value: `${vrfStats.avgFulfillmentTime}s`,
            icon: Clock,
            color: "from-purple-500 to-pink-500",
          },
          {
            label: "Gas Efficiency",
            value: `${vrfStats.gasEfficiency}%`,
            icon: Zap,
            color: "from-orange-500 to-red-500",
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                      <motion.p
                        className="text-lg font-bold text-white"
                        key={stat.value}
                        initial={{ scale: 1.1, color: "#10b981" }}
                        animate={{ scale: 1, color: "#ffffff" }}
                        transition={{ duration: 0.3 }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* VRF Request Interface */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Dice6 className="w-5 h-5" />
            <span>Chainlink VRF (Verifiable Random Function)</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Generate cryptographically secure random numbers for DeFi protocols
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Request Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Liquidation Lottery", purpose: "liquidation_lottery", color: "from-red-500 to-pink-500" },
              { label: "Reward Distribution", purpose: "reward_distribution", color: "from-green-500 to-emerald-500" },
              { label: "Pool Selection", purpose: "pool_selection", color: "from-blue-500 to-cyan-500" },
            ].map((option, index) => (
              <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => requestRandomness(option.purpose)}
                  disabled={isRequesting}
                  className={`w-full h-16 bg-gradient-to-r ${option.color} hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center space-x-2">
                    <Dice6 className="w-5 h-5" />
                    <span>{option.label}</span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Recent Requests */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Recent VRF Requests</h3>
            <AnimatePresence>
              {vrfRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                    {/* Request Info */}
                    <div>
                      <p className="text-white font-medium">
                        {request.purpose.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-gray-400">ID: {request.requestId}</p>
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      <Badge className={getStatusColor(request.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                      </Badge>
                    </div>

                    {/* Random Number */}
                    <div className="text-center">
                      {request.randomNumber ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-mono text-green-400">
                          {request.randomNumber.toLocaleString()}
                        </motion.div>
                      ) : (
                        <div className="flex items-center justify-center">
                          {request.status === "pending" && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Gas Used */}
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Gas Used</p>
                      <p className="text-white text-sm">
                        {request.gasUsed ? `${request.gasUsed.toLocaleString()}` : "-"}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Requested</p>
                      <p className="text-white text-sm">{Math.floor((Date.now() - request.timestamp) / 1000)}s ago</p>
                    </div>
                  </div>

                  {/* Progress bar for pending requests */}
                  {request.status === "pending" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                      <Progress value={((Date.now() - request.timestamp) / 5000) * 100} className="h-1" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {vrfRequests.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Dice6 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No VRF requests yet. Click a button above to generate secure randomness!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* VRF Benefits */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Why Chainlink VRF?</CardTitle>
          <CardDescription className="text-gray-400">
            Cryptographically secure randomness for critical DeFi operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Cryptographically Secure",
                description: "Tamper-proof randomness that cannot be manipulated by miners or validators",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: CheckCircle,
                title: "Verifiable On-Chain",
                description: "All randomness can be verified on-chain using cryptographic proofs",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Zap,
                title: "Gas Efficient",
                description: "Optimized for minimal gas consumption while maintaining security",
                color: "from-purple-500 to-pink-500",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center space-y-3"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-full flex items-center justify-center mx-auto`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">{benefit.title}</h3>
                  <p className="text-sm text-gray-400">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
