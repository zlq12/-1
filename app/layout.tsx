import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Database, LayoutDashboard } from "lucide-react";
import "./globals.css";
import { businessModules } from "@/lib/modules";

export const metadata: Metadata = {
  title: "亚马逊合伙经营分析系统",
  description: "面向两位合伙人的轻量级记账与销售分析系统"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen">
          <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card px-4 py-5 lg:block">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <Database className="h-5 w-5 text-primary" />
              合伙经营总站
            </Link>
            <nav className="mt-8 space-y-6">
              <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                总览看板
              </Link>
              {businessModules.map((module) => (
                <div key={module.key}>
                  <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href={module.href}>
                    <module.icon className="h-4 w-4" />
                    {module.name}
                  </Link>
                  <div className="mt-1 space-y-1 pl-8">
                    {module.links.map((link) => (
                      <Link key={link.href} href={link.href} className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" href="/settings">
                <BarChart3 className="h-4 w-4" />
                基础设置
              </Link>
            </nav>
          </aside>
          <main className="lg:pl-64">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
