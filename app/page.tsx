import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { businessModules } from "@/lib/modules";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Amazon Partner Operations</p>
        <h1 className="text-3xl font-semibold tracking-normal">亚马逊合伙经营总站</h1>
        <p className="max-w-2xl text-muted-foreground">两个核心模块可以独立运行，也可以挂到后续总站导航中：合伙记账负责资金流，销售分析负责报表导入和经营洞察。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {businessModules.map((module) => (
          <Link key={module.key} href={module.href} className="rounded-lg border border-border bg-card p-5 shadow-panel transition hover:border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-muted p-2">
                  <module.icon className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h2 className="font-semibold">{module.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
