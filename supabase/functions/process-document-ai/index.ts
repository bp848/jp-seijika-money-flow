// supabase/functions/process_document-ai/index.ts

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleAuth } from "https://esm.sh/google-auth-library@9.11.0" // Google認証用ライブラリ

// Define types for Document AI response (simplified)
interface AiEntity {
  type: string
  mentionText: string
  confidence: number
  // Add other properties if needed, like 'normalizedValue'
}

interface AiTableCell {
  layout: {
    textSegments: { startIndex: string; endIndex: string }[] // Assuming text is segmented
    text: string // Helper, might need to be constructed if not directly available
  }
  // Add other properties if needed
}

interface AiTableRow {
  cells: AiTableCell[]
}

interface AiTable {
  headerRows: AiTableRow[]
  bodyRows: AiTableRow[]
  // Add other properties if needed
}

interface AiDocument {
  text: string
  entities: AiEntity[]
  tables?: AiTable[]
  // Add other properties if needed
}

interface AiResponse {
  document: AiDocument
  // Add other properties if needed
}

// Helper function to find entity value
const findEntityValue = (entities: AiEntity[], type: string): string | undefined => {
  const entity = entities.find((e) => e.type === type)
  return entity ? entity.mentionText.trim() : undefined
}

// Helper function to convert Japanese Era to AD year
const convertJapaneseEraToYear = (eraDate: string | undefined): string | undefined => {
  if (!eraDate) return undefined
  // Example: R3/1/13, H30/12/5, S60/5/20
  const match = eraDate.match(/([RHS])(\d{1,2})\/(\d{1,2})\/(\d{1,2})/i) //令和, 平成, 昭和
  if (!match) {
    // Try to match with a dot separator as well, e.g., R3.1.13
    const dotMatch = eraDate.match(/([RHS])(\d{1,2})\.(\d{1,2})\.(\d{1,2})/i)
    if (!dotMatch) {
      console.warn(`Unknown date format: ${eraDate}`)
      return eraDate // Return original if format is unknown
    }
    const [_, eraChar, yearStr, monthStr, dayStr] = dotMatch
    let baseYear = 0
    const year = Number.parseInt(yearStr, 10)
    switch (eraChar.toUpperCase()) {
      case "R":
        baseYear = 2018
        break // 令和 (Reiwa) started in 2019, so R1 is 2019. R3 = 2018 + 3 = 2021.
      case "H":
        baseYear = 1988
        break // 平成 (Heisei) started in 1989, H1 is 1989. H30 = 1988 + 30 = 2018.
      case "S":
        baseYear = 1925
        break // 昭和 (Showa) started in 1926, S1 is 1926. S60 = 1925 + 60 = 1985.
      default:
        return eraDate // Should not happen with the regex
    }
    const adYear = baseYear + year
    return `${adYear}-${monthStr.padStart(2, "0")}-${dayStr.padStart(2, "0")}`
  }

  const [_, eraChar, yearStr, monthStr, dayStr] = match
  let baseYear = 0
  const year = Number.parseInt(yearStr, 10)

  switch (eraChar.toUpperCase()) {
    case "R":
      baseYear = 2018
      break // 令和 (Reiwa) R1 = 2019. R3 = 2018 + 3 = 2021.
    case "H":
      baseYear = 1988
      break // 平成 (Heisei) H1 = 1989. H30 = 1988 + 30 = 2018.
    case "S":
      baseYear = 1925
      break // 昭和 (Showa) S1 = 1926. S60 = 1925 + 60 = 1985.
    // T (Taisho) and M (Meiji) could be added if necessary
    default:
      console.warn(`Unknown era character: ${eraChar} in date ${eraDate}`)
      return eraDate // Return original if era is unknown
  }
  const adYear = baseYear + year
  return `${adYear}-${monthStr.padStart(2, "0")}-${dayStr.padStart(2, "0")}`
}

Deno.serve(async (req: Request) => {
  let supabaseClient: SupabaseClient
  try {
    supabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
  } catch (e) {
    console.error("Failed to create Supabase client:", e)
    return new Response(JSON.stringify({ success: false, error: "Supabase client initialization failed." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { record: fileObject } = await req.json()
  if (!fileObject || !fileObject.name) {
    return new Response(JSON.stringify({ success: false, error: "Invalid file object in request." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
  const filePath = fileObject.name
  const bucketName = fileObject.bucket_id || "pdf_documents" // Default to 'pdf_documents' if not provided

  try {
    console.log(`Processing ${filePath} from bucket ${bucketName}...`)
    // 1. PDFをStorageからダウンロード
    const { data: fileData, error: downloadError } = await supabaseClient.storage.from(bucketName).download(filePath)

    if (downloadError) {
      console.error(`Storage Download Error for ${filePath}:`, downloadError)
      throw downloadError
    }
    if (!fileData) {
      throw new Error(`No data returned from storage download for ${filePath}`)
    }

    const fileBuffer = await fileData.arrayBuffer()
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))

    // 2. Google認証トークンの取得
    const gcpServiceAccountKeyJson = Deno.env.get("GCP_SERVICE_ACCOUNT_KEY_JSON")
    if (!gcpServiceAccountKeyJson) {
      throw new Error("GCP_SERVICE_ACCOUNT_KEY_JSON environment variable not set.")
    }
    const serviceAccountJson = JSON.parse(gcpServiceAccountKeyJson)
    const auth = new GoogleAuth({
      credentials: {
        client_email: serviceAccountJson.client_email,
        private_key: serviceAccountJson.private_key,
      },
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    })
    const authToken = await auth.getAccessToken()

    // 3. Document AI APIへのリクエスト送信
    const processorId = Deno.env.get("GCP_DOCUMENTAI_PROCESSOR_ID")
    if (!processorId) {
      throw new Error("GCP_DOCUMENTAI_PROCESSOR_ID environment variable not set.")
    }
    const gcpProjectId = serviceAccountJson.project_id
    // The location should match your processor's location (e.g., 'us', 'eu')
    const location = Deno.env.get("GCP_DOCUMENTAI_PROCESSOR_LOCATION") || "us"
    const apiUrl = `https://${location}-documentai.googleapis.com/v1/projects/${gcpProjectId}/locations/${location}/processors/${processorId}:process`

    const requestBody = {
      rawDocument: {
        content: base64File,
        mimeType: "application/pdf",
      },
      // Optional: Add processOptions for specific features like OCR versions or layout parsing
      // processOptions: {
      //   ocrConfig: {
      //     enableNativePdfParsing: true, // Use text embedded in PDF if available
      //     // premiumFeatures: { computeStyleInfo: true } // If you need style info
      //   }
      // }
    }

    console.log(`Sending request to Document AI API: ${apiUrl}`)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Document AI API Error (${response.status}) for ${filePath}: ${errorText}`)
      throw new Error(`Document AI API Error (${response.status}): ${errorText}`)
    }

    const result = (await response.json()) as AiResponse
    const document = result.document

    if (!document || !document.entities) {
      throw new Error("Document AI response is missing document or entities.")
    }

    console.log(`--- Document AI processing successful for ${filePath} ---`)

    // -----------------------------------------------------------------
    // 4. 解析結果をDBに格納 (この部分をプロジェクトに合わせて拡張)
    // -----------------------------------------------------------------
    // --- INSERT LOGIC HERE ---
    // This is the section we will build together based on your JSON output from Step 1.
    // Please provide the JSON file.
    console.log("--- Placeholder for DB Insertion Logic ---")
    // Example structure:
    // 4.1. Upsert Organization Info
    // 4.2. Parse Tables and Upsert/Insert Transactions and Entities
    // 4.3. Link to Politicians
    // --- END INSERT LOGIC ---

    // 5. `pdf_documents`テーブルのステータスを更新
    console.log(`Updating status for ${filePath} in pdf_documents...`)
    const { error: updateStatusError } = await supabaseClient
      .from("pdf_documents") // Assuming this is your table for tracking PDFs
      .update({
        status: "completed",
        ocr_text: document.text.substring(0, 50000), // Store full text, or a truncated version
        processed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("name", filePath) // Assuming 'name' is the unique path in storage

    if (updateStatusError) {
      console.error(`Failed to update status for ${filePath}:`, updateStatusError.message)
    }

    return new Response(JSON.stringify({ success: true, message: `Processed ${filePath}` }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message, error.stack)
    // Ensure supabaseClient is defined before using it in catch
    if (supabaseClient) {
      await supabaseClient
        .from("pdf_documents")
        .update({
          status: "failed",
          error_message: error.message.substring(0, 1000), // Truncate error message if too long
          processed_at: new Date().toISOString(),
        })
        .eq("name", filePath)
    }
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
