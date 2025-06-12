"use client"

import { useState } from "react"
import AdminLayout from "@/components/admin/admin-layout"
import AdminDashboard from "@/components/admin/admin-dashboard"
import LangChainSettings from "@/components/admin/langchain-settings"
import ApiKeyManagement from "@/components/admin/api-key-management"
import UserManagement from "@/components/admin/user-management"
import PdfManagement from "@/components/admin/pdf-management" // 新しく追加

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />
      case "langchain":
        return <LangChainSettings />
      case "api-keys":
        return <ApiKeyManagement />
      case "users":
        return <UserManagement />
      case "pdf-management": // 新しいタブのケースを追加
        return <PdfManagement />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  )
}
