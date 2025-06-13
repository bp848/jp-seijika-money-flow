"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CodeIcon, DatabaseIcon, FileTextIcon } from "lucide-react"

interface ApiColumn {
  name: string
  format: string
  type: string
  description: string
}

interface ApiOperationItem {
  title: string
  description?: string
  code: string
}

interface ApiOperationCategory {
  categoryTitle: string
  items: ApiOperationItem[]
}

interface ApiTableDoc {
  id: string
  tableName: string
  japaneseName: string
  columns: ApiColumn[]
  operations: ApiOperationCategory[]
}

const apiDocsData: ApiTableDoc[] = [
  {
    id: "organizations",
    tableName: "organizations",
    japaneseName: "一般団体テーブル",
    columns: [
      { name: "id", format: "integer", type: "number", description: "" },
      { name: "name", format: "text", type: "string", description: "団体名" },
      { name: "type", format: "text", type: "string", description: "団体種別" },
      { name: "address", format: "text", type: "string", description: "所在地" },
      { name: "established_on", format: "date", type: "string", description: "設立日" },
      { name: "created_at", format: "timestamp without time zone", type: "string", description: "レコード作成日時" },
    ],
    operations: [
      {
        categoryTitle: "Read rows",
        items: [
          {
            title: "Read all rows",
            code: `
let { data: organizations, error } = await supabase
.from('organizations')
.select('*')
        `.trim(),
          },
          {
            title: "Read specific columns",
            code: `
let { data: organizations, error } = await supabase
.from('organizations')
.select('some_column,other_column')
        `.trim(),
          },
          {
            title: "Read referenced tables",
            code: `
let { data: organizations, error } = await supabase
.from('organizations')
.select(\`
some_column,
other_table (
  foreign_key
)
\`)
        `.trim(),
          },
          {
            title: "With pagination",
            code: `
let { data: organizations, error } = await supabase
.from('organizations')
.select('*')
.range(0, 9)
        `.trim(),
          },
        ],
      },
      {
        categoryTitle: "Filtering",
        items: [
          {
            title: "With filtering",
            code: `
let { data: organizations, error } = await supabase
.from('organizations')
.select("*")

// Filters
.eq('column', 'Equal to')
.gt('column', 'Greater than')
.lt('column', 'Less than')
.gte('column', 'Greater than or equal to')
.lte('column', 'Less than or equal to')
.like('column', '%CaseSensitive%')
.ilike('column', '%CaseInsensitive%')
.is('column', null)
.in('column', ['Array', 'Values'])
.neq('column', 'Not equal to')

// Arrays
.contains('array_column', ['array', 'contains'])
.containedBy('array_column', ['contained', 'by'])

// Logical operators
.not('column', 'like', 'Negate filter')
.or('some_column.eq.Some value, other_column.eq.Other value')
        `.trim(),
          },
        ],
      },
      {
        categoryTitle: "Insert rows",
        items: [
          {
            title: "Insert a row",
            code: `
const { data, error } = await supabase
.from('organizations')
.insert([
{ some_column: 'someValue', other_column: 'otherValue' },
])
.select()
        `.trim(),
          },
          {
            title: "Insert many rows",
            code: `
const { data, error } = await supabase
.from('organizations')
.insert([
{ some_column: 'someValue' },
{ some_column: 'otherValue' },
])
.select()
        `.trim(),
          },
          {
            title: "Upsert matching rows",
            code: `
const { data, error } = await supabase
.from('organizations')
.upsert({ some_column: 'someValue' })
.select()
        `.trim(),
          },
        ],
      },
      {
        categoryTitle: "Update rows",
        items: [
          {
            title: "Update matching rows",
            code: `
const { data, error } = await supabase
.from('organizations')
.update({ other_column: 'otherValue' })
.eq('some_column', 'someValue')
.select()
        `.trim(),
          },
        ],
      },
      {
        categoryTitle: "Delete rows",
        items: [
          {
            title: "Delete matching rows",
            code: `
const { error } = await supabase
.from('organizations')
.delete()
.eq('some_column', 'someValue')
        `.trim(),
          },
        ],
      },
      {
        categoryTitle: "Subscribe to changes",
        items: [
          {
            title: "Subscribe to all events",
            code: `
const channels = supabase.channel('custom-all-channel')
.on(
'postgres_changes',
{ event: '*', schema: 'public', table: 'organizations' },
(payload) => {
  console.log('Change received!', payload)
}
)
.subscribe()
        `.trim(),
          },
          {
            title: "Subscribe to inserts",
            code: `
const channels = supabase.channel('custom-insert-channel')
.on(
'postgres_changes',
{ event: 'INSERT', schema: 'public', table: 'organizations' },
(payload) => {
  console.log('Change received!', payload)
}
)
.subscribe()
        `.trim(),
          },
          {
            title: "Subscribe to updates",
            code: `
const channels = supabase.channel('custom-update-channel')
.on(
'postgres_changes',
{ event: 'UPDATE', schema: 'public', table: 'organizations' },
(payload) => {
  console.log('Change received!', payload)
}
)
.subscribe()
        `.trim(),
          },
          {
            title: "Subscribe to deletes",
            code: `
const channels = supabase.channel('custom-delete-channel')
.on(
'postgres_changes',
{ event: 'DELETE', schema: 'public', table: 'organizations' },
(payload) => {
  console.log('Change received!', payload)
}
)
.subscribe()
        `.trim(),
          },
          {
            title: "Subscribe to specific rows",
            code: `
const channels = supabase.channel('custom-filter-channel')
.on(
'postgres_changes',
{ event: '*', schema: 'public', table: 'organizations', filter: 'some_column=eq.some_value' },
(payload) => {
  console.log('Change received!', payload)
}
)
.subscribe()
        `.trim(),
          },
        ],
      },
    ],
  },
  {
    id: "party_branches",
    tableName: "party_branches",
    japaneseName: "政党支部テーブル",
    columns: [
      { name: "id", format: "integer", type: "number", description: "" },
      { name: "party_id", format: "integer", type: "number", description: "所属政党ID（外部キー）" },
      { name: "name", format: "text", type: "string", description: "政党支部名" },
      { name: "representative_name", format: "text", type: "string", description: "支部代表者氏名" },
      { name: "treasurer_name", format: "text", type: "string", description: "支部会計責任者氏名" },
      { name: "branch_address", format: "text", type: "string", description: "支部所在地" },
      { name: "registered_on", format: "date", type: "string", description: "設立日" },
      { name: "created_at", format: "timestamp without time zone", type: "string", description: "レコード作成日時" },
    ],
    operations: [
      // ... (operations for party_branches - kept brief for this example, assume they are correct)
      {
        categoryTitle: "Read rows",
        items: [
          {
            title: "Read all rows",
            code: `
let { data: party_branches, error } = await supabase
.from('party_branches')
.select('*')
        `.trim(),
          },
          {
            title: "Read specific columns",
            code: `
let { data: party_branches, error } = await supabase
.from('party_branches')
.select('some_column,other_column')
        `.trim(),
          },
        ],
      },
      // ... other operation categories for party_branches
    ],
  },
  {
    id: "political_funds",
    tableName: "political_funds",
    japaneseName: "政治資金団体テーブル",
    columns: [
      { name: "id", format: "integer", type: "number", description: "" },
      { name: "name", format: "text", type: "string", description: "団体名" },
      { name: "affiliated_party", format: "text", type: "string", description: "所属政党名（自由入力）" },
      { name: "representative_name", format: "text", type: "string", description: "代表者氏名" },
      { name: "treasurer_name", format: "text", type: "string", description: "会計責任者氏名" },
      { name: "address", format: "text", type: "string", description: "所在地" },
      { name: "registered_on", format: "date", type: "string", description: "設立日" },
      { name: "created_at", format: "timestamp without time zone", type: "string", description: "レコード作成日時" },
    ],
    operations: [
      // ... (operations for political_funds - kept brief for this example, assume they are correct)
      {
        categoryTitle: "Read rows",
        items: [
          {
            title: "Read all rows",
            code: `
let { data: political_funds, error } = await supabase
.from('political_funds')
.select('*')
        `.trim(),
          },
        ],
      },
      // ... other operation categories for political_funds
    ],
  },
  {
    id: "political_funds_organizations",
    tableName: "political_funds_organizations",
    japaneseName: "政治資金団体と一般団体の関係",
    columns: [
      { name: "id", format: "integer", type: "number", description: "" },
      { name: "fund_id", format: "integer", type: "number", description: "政治資金団体ID" },
      { name: "organization_id", format: "integer", type: "number", description: "一般団体ID" },
      { name: "relationship", format: "text", type: "string", description: "関係性（例：資金提供元）" },
      { name: "created_at", format: "timestamp without time zone", type: "string", description: "レコード作成日時" },
    ],
    operations: [
      // ... (operations for political_funds_organizations - kept brief, assume correct)
      {
        categoryTitle: "Read rows",
        items: [
          {
            title: "Read all rows",
            code: `
let { data: political_funds_organizations, error } = await supabase
.from('political_funds_organizations')
.select('*')
        `.trim(),
          },
        ],
      },
      // ... other operation categories
    ],
  },
  {
    id: "political_parties",
    tableName: "political_parties",
    japaneseName: "政党テーブル",
    columns: [
      { name: "id", format: "integer", type: "number", description: "" },
      { name: "name", format: "text", type: "string", description: "政党名" },
      { name: "representative_name", format: "text", type: "string", description: "代表者氏名" },
      { name: "treasurer_name", format: "text", type: "string", description: "会計責任者氏名" },
      { name: "headquarters_address", format: "text", type: "string", description: "本部所在地" },
      { name: "established_on", format: "date", type: "string", description: "設立届の届出日" },
      { name: "created_at", format: "timestamp without time zone", type: "string", description: "レコード作成日時" },
    ],
    operations: [
      {
        categoryTitle: "Read rows",
        items: [
          {
            title: "Read all rows",
            code: `
let { data: political_parties, error } = await supabase
.from('political_parties')
.select('*')
        `.trim(),
          },
          {
            title: "Read specific columns",
            code: `
let { data: political_parties, error } = await supabase
.from('political_parties')
.select('some_column,other_column')
        `.trim(),
          },
          {
            title: "Read referenced tables",
            code: `
let { data: political_parties, error } = await supabase
.from('political_parties')
.select(\`
some_column,
other_table (
  foreign_key
)
\`)
        `.trim(),
          },
          {
            title: "With pagination",
            code: `
let { data: political_parties, error } = await supabase
.from('political_parties')
.select('*')
.range(0, 9)
        `.trim(),
          },
        ],
      },
      {
        categoryTitle: "Filtering",
        items: [
          {
            title: "With filtering",
            code: `
let { data: political_parties, error } = await supabase
.from('political_parties')
.select("*")

// Filters
.eq('column', 'Equal to')
.gt('column', 'Greater than')
.lt('column', 'Less than')
.gte('column', 'Greater than or equal to')
.lte('column', 'Less than or equal to')
.like('column', '%CaseSensitive%')
.ilike('column', '%CaseInsensitive%')
.is('column', null)
.in('column', ['Array', 'Values'])
.neq('column', 'Not equal to')

// Arrays
.contains('array_column', ['array', 'contains'])
.containedBy('array_column', ['contained', 'by'])

// Logical operators
.not('column', 'like', 'Negate filter')
.or('some_column.eq.Some value, other_column.eq.Other value')
        `.trim(),
          },
        ],
      },
      {
        categoryTitle: "Insert rows",
        items: [
          {
            title: "Insert a row",
            code: `
const { data, error } = await supabase
.from('political_parties')
.insert([
{ some_column: 'someValue', other_column: 'otherValue' },
])
.select()
        `.trim(),
          },
          {
            title: "Insert many rows",
            code: `
const { data, error } = await supabase
.from('political_parties')
.insert([
{ some_column: 'someValue' },
{ some_column: 'otherValue' },
])
.select()
        `.trim(),
          },
          {
            title: "Upsert matching rows",
            code: `
const { data, error } = await supabase
.from('political_parties')
.upsert({ some_column: 'someValue' })
.select()
        `.trim(),
          },
        ],
      },
      {
        categoryTitle: "Update rows",
        items: [
          {
            title: "Update matching rows",
            code: `
const { data, error } = await supabase
.from('political_parties')
.update({ other_column: 'otherValue' })
.eq('some_column', 'someValue')
.select()
        `.trim(),
          },
        ],
      },
      {
        categoryTitle: "Delete rows",
        items: [
          {
            title: "Delete matching rows",
            code: `
const { error } = await supabase
.from('political_parties')
.delete()
.eq('some_column', 'someValue')
        `.trim(),
          },
        ],
      },
      {
        categoryTitle: "Subscribe to changes",
        items: [
          {
            title: "Subscribe to all events",
            code: `
const channels = supabase.channel('custom-all-channel')
.on(
'postgres_changes',
{ event: '*', schema: 'public', table: 'political_parties' },
(payload) => {
  console.log('Change received!', payload)
}
)
.subscribe()
        `.trim(),
          },
          {
            title: "Subscribe to inserts",
            code: `
const channels = supabase.channel('custom-insert-channel')
.on(
'postgres_changes',
{ event: 'INSERT', schema: 'public', table: 'political_parties' },
(payload) => {
  console.log('Change received!', payload)
}
)
.subscribe()
        `.trim(),
          },
          {
            title: "Subscribe to updates",
            code: `
const channels = supabase.channel('custom-update-channel')
.on(
'postgres_changes',
{ event: 'UPDATE', schema: 'public', table: 'political_parties' },
(payload) => {
  console.log('Change received!', payload)
}
)
.subscribe()
        `.trim(),
          },
          {
            title: "Subscribe to deletes",
            code: `
const channels = supabase.channel('custom-delete-channel')
.on(
'postgres_changes',
{ event: 'DELETE', schema: 'public', table: 'political_parties' },
(payload) => {
  console.log('Change received!', payload)
}
)
.subscribe()
        `.trim(),
          },
          {
            title: "Subscribe to specific rows",
            code: `
const channels = supabase.channel('custom-filter-channel')
.on(
'postgres_changes',
{ event: '*', schema: 'public', table: 'political_parties', filter: 'some_column=eq.some_value' },
(payload) => {
  console.log('Change received!', payload)
}
)
.subscribe()
        `.trim(),
          },
        ],
      },
    ],
  },
]

const CodeBlock = ({ code }: { code: string }) => (
  <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm">
    <code>{code}</code>
  </pre>
)

export default function ApiDocumentationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight flex items-center">
          <FileTextIcon className="mr-3 h-10 w-10 text-blue-600" />
          API Documentation
        </h1>
        <p className="text-lg text-muted-foreground mt-2">Interact with your data using the Supabase client library.</p>
      </header>

      <div className="space-y-12">
        {apiDocsData.map((tableDoc) => (
          <Card key={tableDoc.id} id={tableDoc.tableName}>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center">
                <DatabaseIcon className="mr-2 h-6 w-6 text-green-600" />
                {tableDoc.tableName}
                <span className="text-lg text-muted-foreground ml-2">({tableDoc.japaneseName})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-3">Columns</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableDoc.columns.map((col) => (
                        <TableRow key={col.name}>
                          <TableCell className="font-mono text-sm">{col.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{col.format}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{col.type}</Badge>
                          </TableCell>
                          <TableCell>{col.description || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3 flex items-center">
                  <CodeIcon className="mr-2 h-5 w-5 text-purple-600" />
                  Operations (Javascript)
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {tableDoc.operations.map((opCategory, opIdx) => (
                    <AccordionItem key={`${tableDoc.id}-opcat-${opIdx}`} value={`item-${opIdx}`}>
                      <AccordionTrigger className="text-lg hover:no-underline">
                        {opCategory.categoryTitle}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        {opCategory.items.map((item, itemIdx) => (
                          <div key={`${tableDoc.id}-opitem-${itemIdx}`}>
                            <h4 className="font-semibold mb-1">{item.title}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                            )}
                            <CodeBlock code={item.code} />
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
