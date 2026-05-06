'use client';

import React from "react";
import { motion } from "motion/react";
import { 
  Music, 
  Wallet, 
  Plus, 
  PlayCircle,
  TrendingUp,
  Sparkles,
  Layers,
  CreditCard
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Card from "@/components/ui/Card";

export default function OverviewTab() {
  const { t } = useLanguage();

  const stats = [
    { label: t('dashboard.stats_streams'), value: '1.2M', trend: '+12%', icon: PlayCircle },
    { label: t('dashboard.stats_royalties'), value: '$4,250', trend: '+$450', icon: Wallet },
    { label: t('dashboard.stats_releases'), value: '24', trend: '+2', icon: Music },
    { label: t('dashboard.stats_reach'), value: '450k', trend: '+18%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 lg:space-y-12 p-6 lg:p-10">
      {/* WELCOME SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-5xl font-display font-medium text-white tracking-tight leading-none mb-3">
            Artist <span className="text-brand-primary">Profile</span>
          </h1>
          <p className="text-white/30 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em]">Manage your identity and brand across platforms.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-5 py-3 rounded-[2px] font-black text-[9px] uppercase tracking-widest hover:bg-brand-primary transition-all active:scale-[0.98]">
            Edit Profile
          </button>
          <button className="w-full sm:w-auto bg-brand-primary text-white px-5 py-3 rounded-[2px] font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl active:scale-[0.98]">
            View Public Page
          </button>
        </div>
      </div>

      {/* STATS HIGHLIGHT */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} variant="outline" className="flex flex-col justify-between p-6 group hover:border-brand-primary/30 transition-all bg-[#111111]/40 backdrop-blur-xl border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="p-2 bg-white/5 rounded-[2px] text-white/40 group-hover:text-brand-primary transition-colors">
                <stat.icon className="w-4 h-4" />
              </div>
              <span className="text-[8px] font-black text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-[1px]">{stat.trend}</span>
            </div>
            <div>
              <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl lg:text-3xl font-display font-medium text-white tracking-tighter leading-tight">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART SECTION */}
        <Card variant="outline" className="lg:col-span-2 p-8 lg:p-10 border-white/10 bg-[#111111]/40 backdrop-blur-xl min-h-[400px]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-display font-medium text-white mb-1">Fan Engagement</h3>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Growth over the last 30 days</p>
            </div>
            <div className="flex gap-2">
               <button className="bg-white/5 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">Month</button>
               <button className="bg-brand-primary text-white px-3 py-1.5 text-[8px] font-black uppercase tracking-widest shadow-lg">Year</button>
            </div>
          </div>
          <div className="flex-1 w-full flex items-end justify-between p-2 gap-2 min-h-[200px]">
            {[40, 70, 45, 90, 65, 80, 50, 85, 95, 70, 60, 100].map((h, i) => (
              <motion.div 
                key={i} 
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.8 }}
                className="flex-1 bg-white/5 hover:bg-brand-primary rounded-[1px] transition-all relative group"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 text-[8px] font-black rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl">
                  {h}k
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* RECENT FEEDBACK/ACTIVITY */}
        <Card variant="outline" className="p-8 lg:p-10 border-white/10 bg-[#111111]/40 backdrop-blur-xl">
          <h3 className="text-lg font-display font-medium text-white mb-8">Latest Updates</h3>
          <div className="space-y-6">
            {[
              { title: 'New Artist Verified', date: '2h ago', desc: 'Your profile is now blue-ticked.' },
              { title: 'Bio Updated', date: '5h ago', desc: 'Spotted by curators in London.' },
              { title: 'Global Milestone', date: '1d ago', desc: 'Top 10 in East Africa charts.' },
              { title: 'Smart Link Ready', date: '2d ago', desc: 'Summer Vibe pre-save live.' },
            ].map((act, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className="w-[1px] h-10 bg-white/10 group-hover:bg-brand-primary transition-all"></div>
                <div>
                  <p className="text-white font-black text-[10px] lg:text-[11px] uppercase tracking-widest leading-none mb-1 group-hover:text-brand-primary transition-colors">{act.title}</p>
                  <p className="text-white/40 text-[11px] font-medium leading-tight">{act.desc}</p>
                  <span className="text-[8px] font-black text-white/10 uppercase tracking-widest block mt-2">{act.date}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-3 text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-brand-primary transition-all rounded-[2px]">
            View Notification Center
          </button>
        </Card>
      </div>

      {/* FOOTER ACTION */}
      <Card variant="glass" className="bg-gradient-to-r from-brand-black to-[#1A1A1A] border-white/5 p-8 lg:p-12 text-center group">
        <Sparkles className="w-8 h-8 text-brand-primary mx-auto mb-6 group-hover:scale-110 transition-transform" />
        <h3 className="text-xl lg:text-3xl font-display font-medium text-white mb-4 tracking-tight">Ready for your next hit?</h3>
        <p className="text-white/40 text-xs lg:text-sm max-w-lg mx-auto mb-8 leading-relaxed italic">"The best way to predict the future of your music career is to create it. Start your next release today."</p>
        <button className="bg-brand-primary text-white px-10 py-4 rounded-[2px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-2xl active:scale-[0.98]">
          Create New Release
        </button>
      </Card>
    </div>
  );
}
