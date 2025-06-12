"use client"

import { useState, useEffect } from "react"
import { NetworkGraphView } from "@/components/network-graph-view"
import { RightSidebar } from "@/components/right-sidebar"
import type { Entity, FundFlow } from "@/types"
import { getInitialData } from "@/lib/data"

export function MainView() {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [fundFlows, setFundFlows] = useState<FundFlow[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const { entities, fundFlows } = await getInitialData()
        setEntities(entities)
        setFundFlows(fundFlows)
      } catch (error) {
        console.error("Failed to fetch initial data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleNodeClick = (entity: Entity) => {
    setSelectedEntity(entity)
  }

  const handleDeselect = () => {
    setSelectedEntity(null)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 relative">
        <NetworkGraphView
          entities={entities}
          fundFlows={fundFlows}
          onNodeClick={handleNodeClick}
          selectedEntity={selectedEntity}
          isLoading={isLoading}
        />
      </div>
      <RightSidebar entity={selectedEntity} onClose={handleDeselect} fundFlows={fundFlows} />
    </div>
  )
}
