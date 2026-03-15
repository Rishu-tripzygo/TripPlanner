"use client";

import CountUpNumber from "@/components/ui/count-up-number";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatCard({
  icon,
  label,
  value,
  suffix = "",
  prefix = "",
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: string;
}) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-[#00C2FF]">
            {icon}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-[#8B9BB4]">{label}</p>
            <p className="text-4xl font-semibold tracking-[-0.04em] text-[#F0F2F7]">
              <CountUpNumber value={value} suffix={suffix} prefix={prefix} />
            </p>
            {trend ? <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">{trend}</p> : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
