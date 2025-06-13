// components/dashboard/fundraising-party-income-widget.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PartyPopper } from "lucide-react"
import { useEffect, useState } from "react"

interface PartyTicketPurchaser {
  id: string
  name: string
  amount: number
}
interface FundraisingParty {
  id: string
  partyName: string
  date: string
  venue: string
  totalIncome: number
  topPurchasers: PartyTicketPurchaser[]
}

// Placeholder data
const fetchFundraisingParties = async (entityId: string): Promise<FundraisingParty[]> => {
  console.log(`Fetching fundraising parties for ${entityId}`)
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [
    {
      id: "party1",
      partyName: "未来を語る会2023",
      date: "2023-04-15",
      venue: "東京グランドホテル",
      totalIncome: 12000000,
      topPurchasers: [
        { id: "pur1", name: "株式会社X", amount: 2000000 },
        { id: "pur2", name: "業界団体Y", amount: 1500000 },
      ],
    },
    {
      id: "party2",
      partyName: "新春の集い",
      date: "2023-01-20",
      venue: "ホテルニューパレス",
      totalIncome: 8500000,
      topPurchasers: [{ id: "pur3", name: "支援者連合Z", amount: 1000000 }],
    },
  ]
}

export function FundraisingPartyIncomeWidget({ entityId }: { entityId: string }) {
  const [parties, setParties] = useState<FundraisingParty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFundraisingParties(entityId).then((data) => {
      setParties(data)
      setLoading(false)
    })
  }, [entityId])

  if (loading) {
    return (
      <Card className="bg-gray-800/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center">
            <PartyPopper className="h-5 w-5 mr-2 text-pink-400" />
            政治資金パーティー収入
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(1)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/70 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center">
          <PartyPopper className="h-5 w-5 mr-2 text-pink-400" />
          政治資金パーティー収入
        </CardTitle>
      </CardHeader>
      <CardContent>
        {parties.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {parties.map((party) => (
              <AccordionItem key={party.id} value={party.id} className="border-gray-700">
                <AccordionTrigger className="hover:no-underline hover:bg-gray-700/50 px-4 py-3 rounded-t-md text-gray-200">
                  <div className="flex justify-between w-full items-center">
                    <span className="font-medium">
                      {party.partyName} ({party.date})
                    </span>
                    <span className="text-pink-300 font-semibold">¥{party.totalIncome.toLocaleString()}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-gray-700/30 px-4 py-3 rounded-b-md">
                  <p className="text-sm text-gray-400 mb-2">会場: {party.venue}</p>
                  <h4 className="text-sm font-semibold mb-1 text-gray-300">主な購入者:</h4>
                  {party.topPurchasers.length > 0 ? (
                    <ul className="list-disc list-inside pl-1 space-y-1 text-xs">
                      {party.topPurchasers.map((purchaser) => (
                        <li key={purchaser.id} className="text-gray-400">
                          {purchaser.name}: <span className="text-gray-200">¥{purchaser.amount.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">購入者情報なし</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-sm text-gray-500">開催された政治資金パーティーはありません。</p>
        )}
      </CardContent>
    </Card>
  )
}
