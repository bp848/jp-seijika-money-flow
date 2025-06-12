"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Settings, Shield, Clock } from "lucide-react"

export default function UserManagement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          ユーザー管理
        </h1>
        <p className="text-gray-400 mt-2">アクセス権限とユーザーアカウントの管理</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-[#161926] border-gray-800">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-600/20 flex items-center justify-center">
              <Users className="h-10 w-10 text-cyan-400" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">ユーザー管理機能</h2>
              <p className="text-gray-400 leading-relaxed">
                この機能は現在開発中です。将来的に以下の機能を提供予定です：
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <UserPlus className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-300">ユーザーアカウントの作成・管理</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <Shield className="h-5 w-5 text-purple-400" />
                <span className="text-gray-300">役割ベースのアクセス制御 (RBAC)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <Settings className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">権限の詳細設定</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-400" />
                <span className="text-gray-300">ログイン履歴とアクティビティ監視</span>
              </div>
            </div>

            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Clock className="h-3 w-3 mr-1" />
              将来実装予定
            </Badge>

            <div className="pt-4">
              <Button disabled className="bg-gray-700 text-gray-400 cursor-not-allowed">
                開発中のため利用不可
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planned Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#161926] border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              予定されている権限管理機能
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <h4 className="font-medium text-white mb-1">管理者権限</h4>
                <p className="text-sm text-gray-400">全機能へのフルアクセス</p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <h4 className="font-medium text-white mb-1">編集者権限</h4>
                <p className="text-sm text-gray-400">設定変更とAPIキー管理</p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <h4 className="font-medium text-white mb-1">閲覧者権限</h4>
                <p className="text-sm text-gray-400">ダッシュボードの閲覧のみ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161926] border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-400" />
              認証・セキュリティ機能
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <h4 className="font-medium text-white mb-1">OAuth連携</h4>
                <p className="text-sm text-gray-400">Google、GitHub等での認証</p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <h4 className="font-medium text-white mb-1">二要素認証</h4>
                <p className="text-sm text-gray-400">TOTP、SMS認証対応</p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <h4 className="font-medium text-white mb-1">セッション管理</h4>
                <p className="text-sm text-gray-400">自動ログアウト、デバイス管理</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Timeline */}
      <Card className="bg-[#161926] border-gray-800">
        <CardHeader>
          <CardTitle>開発ロードマップ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
              <div>
                <h4 className="font-medium text-cyan-400">Phase 1: 基本認証システム</h4>
                <p className="text-sm text-gray-400">ユーザー登録、ログイン、基本的な権限管理</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <div>
                <h4 className="font-medium text-purple-400">Phase 2: 高度な権限制御</h4>
                <p className="text-sm text-gray-400">RBAC、詳細な権限設定、監査ログ</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <h4 className="font-medium text-green-400">Phase 3: 外部認証連携</h4>
                <p className="text-sm text-gray-400">OAuth、SSO、二要素認証の実装</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
