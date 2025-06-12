// 参議院議員CSVデータの取得と分析
const csvUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/giin-zG8FOGvFP9zbjsbr0Bs97O1g5dkHYG.csv"

async function fetchAndAnalyzeSangiinData() {
  try {
    console.log("参議院議員データを取得中...")
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    // CSVをパース（簡易版）
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

    console.log("CSVヘッダー:", headers)
    console.log("総行数:", lines.length - 1, "件")

    const data = []
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      // 最初の5件を表示
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
        const record = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ""
        })
        data.push(record)
      }
    }

    console.log("\n=== サンプルデータ（最初の5件）===")
    data.forEach((record, index) => {
      console.log(`\n${index + 1}. ${record["議員氏名"]}`)
      console.log(`   読み方: ${record["読み方"]}`)
      console.log(`   会派: ${record["会派"]}`)
      console.log(`   選挙区: ${record["選挙区"]}`)
      console.log(`   当選回数: ${record["当選回数"]}`)
      console.log(`   任期満了: ${record["任期満了"]}`)
    })

    // 会派別集計
    const partyCount = {}
    const allLines = lines.slice(1).filter((line) => line.trim())

    allLines.forEach((line) => {
      const values = line.split(",").map((v) => v.replace(/"/g, "").trim())
      const party = values[4] || "不明" // 会派カラム
      partyCount[party] = (partyCount[party] || 0) + 1
    })

    console.log("\n=== 会派別議員数 ===")
    Object.entries(partyCount)
      .sort(([, a], [, b]) => b - a)
      .forEach(([party, count]) => {
        console.log(`${party}: ${count}人`)
      })

    console.log(`\n総議員数: ${allLines.length}人`)

    return {
      totalCount: allLines.length,
      partyDistribution: partyCount,
      sampleData: data,
    }
  } catch (error) {
    console.error("データ取得エラー:", error)
    return null
  }
}

// 実行
fetchAndAnalyzeSangiinData()
