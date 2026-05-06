import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Users,
  Play
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Card from "@/components/ui/Card";

export default function AnalyticsTab() {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState('30D');

  const timeframes = ['7D', '30D', '90D', 'ALL'];

  return (
    <div className="space-y-8 lg:space-y-12 p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-xl">
          <h1 className="text-3xl lg:text-5xl font-display font-medium text-white tracking-tight leading-none mb-4">
            Insights <span className="text-white/20">& Stats</span>
          </h1>
          <p className="text-white/30 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em]">Deep insights into your listener base and core growth patterns.</p>
        </div>
        
        <div className="flex bg-white/[0.03] p-1.5 rounded-[4px] border border-white/5 shadow-2xl backdrop-blur-3xl w-full md:w-auto relative group overflow-hidden">
          <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          {timeframes.map(item => (
            <button 
              key={item} 
              onClick={() => setTimeframe(item)}
              className={`relative flex-1 md:flex-none min-w-[60px] px-6 py-3 text-[9px] font-black tracking-[0.25em] uppercase transition-all rounded-[2px] z-10 ${
                timeframe === item ? "text-white" : "text-white/20 hover:text-white/60"
              }`}
            >
              {timeframe === item && (
                <motion.div 
                  layoutId="activeTimeframe"
                  className="absolute inset-0 bg-brand-primary rounded-[2px] shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-20">{item}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card variant="outline" className="lg:col-span-2 p-8 lg:p-10 border-white/10 bg-brand-black min-h-[400px] backdrop-blur-3xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-display font-medium text-white tracking-tight">Audience Growth</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(124,58,237,0.5)]"></div>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">New</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Returning</span>
              </div>
            </div>
          </div>
          <div className="h-64 bg-white/[0.02] border border-dashed border-white/5 rounded-[4px] flex flex-col items-center justify-center p-10 group cursor-crosshair">
             <div className="flex items-end gap-1 w-full h-full opacity-20 group-hover:opacity-100 transition-opacity">
                {[30, 45, 25, 60, 40, 75, 50, 90, 70, 85, 55, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-brand-primary transition-all" style={{ height: `${h}%` }}></div>
                ))}
             </div>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <BarChart3 className="w-10 h-10 text-white/5 mb-4" />
                <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">Live Data Feed Processing</span>
             </div>
          </div>
        </Card>

        <Card variant="outline" className="p-8 lg:p-10 border-white/10 bg-brand-black backdrop-blur-3xl">
          <h3 className="text-lg font-display font-medium text-white tracking-tight mb-8">Top Platforms</h3>
          <div className="space-y-8">
            {[
              { name: 'Spotify', share: '45%', color: 'bg-brand-primary shadow-[0_0_10px_rgba(124,58,237,0.3)]' },
              { name: 'Apple Music', share: '30%', color: 'bg-white' },
              { name: 'YouTube Music', share: '15%', color: 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]' },
              { name: 'Amazon Music', share: '10%', color: 'bg-blue-400' },
            ].map((p, i) => (
              <div key={i} className="space-y-3 group cursor-pointer">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.15em] text-white/60 group-hover:text-white transition-colors">{p.name}</span>
                  <span className="text-[10px] font-black text-brand-primary">{p.share}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: p.share }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className={`h-full ${p.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card variant="outline" className="p-8 lg:p-10 border-white/10 bg-brand-black backdrop-blur-3xl">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-[2px] border border-brand-primary/20">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-display font-medium text-white">Global Reach</h4>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mt-1">Top countries by stream count</p>
              </div>
           </div>
           <div className="grid grid-cols-1 gap-2.5">
              {[
                { name: 'Tanzania', count: '450k', trend: '+12%' },
                { name: 'Kenya', count: '320k', trend: '+8%' },
                { name: 'USA', count: '120k', trend: '+25%' },
                { name: 'Nigeria', count: '90k', trend: '+5%' },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-[2px] hover:bg-white/[0.05] transition-all border border-white/5 group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-brand-primary transition-all">{c.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-white/40">{c.count}</span>
                    <span className="text-[9px] font-black text-green-500">{c.trend}</span>
                  </div>
                </div>
              ))}
           </div>
        </Card>

        <Card variant="outline" className="p-8 lg:p-10 border-white/10 bg-brand-black backdrop-blur-3xl flex flex-col">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-[2px] border border-brand-primary/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-display font-medium text-white">Demographics</h4>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mt-1">Age and gender breakdown</p>
              </div>
           </div>
           <div className="flex-1 border border-dashed border-white/5 rounded-[4px] bg-white/[0.01] flex flex-col items-center justify-center p-8 text-center group cursor-help">
              <div className="relative w-24 h-24 lg:w-32 lg:h-32 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-white/5 group-hover:border-brand-primary/20 transition-all border-t-brand-primary animate-spin-slow"></div>
                <div className="absolute inset-4 rounded-full border-4 border-white/5 group-hover:border-white/20 transition-all border-b-white/40"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg lg:text-xl font-display font-medium text-white">65%</span>
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Male</span>
                </div>
              </div>
              <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.25em]">Audience Profiling Active</p>
           </div>
        </Card>
      </div>
    </div>
  );
}
