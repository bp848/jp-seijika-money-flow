import useSWR from "swr"
import { z } from "zod"
import { supabase } from "@/lib/supabase-client"

const EntitySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1),
  })
  .nullable()

const FundFlowSchema = z.object({
  id: z.string().uuid(),
  source_entity_id: z.string().uuid(),
  target_entity_id: z.string().uuid(),
  amount: z.number().int().positive(),
  flow_date: z.string().transform((v) => new Date(v)),
  source_entity: EntitySchema,
  target_entity: EntitySchema,
})

const FundFlowsResponseSchema = z.array(FundFlowSchema)

export type FundFlow = z.infer<typeof FundFlowSchema>

const fetcher = async (limit: number): Promise<FundFlow[]> => {
  const { data, error } = await supabase
    .from("fund_flows")
    .select(`
      id,
      source_entity_id,
      target_entity_id,
      amount,
      flow_date,
      source_entity:politicians!left(id, name),
      target_entity:politicians!left(id, name)
    `)
    .order("flow_date", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Supabase fetch failed:", error)
    throw error
  }

  return FundFlowsResponseSchema.parse(data || [])
}

export const useFundFlows = (limit = 5000) => {
  const { data, error, isLoading } = useSWR(["fund_flows", limit], () => fetcher(limit))

  return {
    flows: data,
    isLoading,
    isError: !!error,
    isEmpty: !isLoading && (!data || data.length === 0),
  }
}
