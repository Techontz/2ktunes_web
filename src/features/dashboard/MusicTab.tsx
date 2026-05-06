'use client';

import React, { useState } from "react";
import { 
  Plus, 
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  ExternalLink,
  Play,
  Filter,
  ArrowRight,
  Disc,
  XCircle,
  BarChart3
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Card from "@/components/ui/Card";
import { motion } from "motion/react";

export default function MusicTab() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const releases = [
    { 
      id: '1', 
      title: 'Midnight Echoes', 
      type: 'Single', 
      status: 'Live', 
      date: 'May 12, 2026',
      artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&h=200&auto=format&fit=crop',
      stats: '1.2M streams'
    },
    { 
      id: '2', 
      title: 'Lost in Translation', 
      type: 'Album', 
      status: 'Pending', 
      date: 'Pending',
      artwork: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200&h=200&auto=format&fit=crop',
      stats: '-'
    },
    { 
      id: '3', 
      title: 'Cyber City', 
      type: 'Single', 
      status: 'Rejected', 
      date: 'N/A',
      artwork: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200&h=200&auto=format&fit=crop',
      stats: 'Copyright Issue'
    },
    { 
      id: '4', 
      title: 'Velvet Sky', 
      type: 'EP', 
      status: 'Live', 
      date: 'Jan 15, 2026',
      artwork: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=200&h=200&auto=format&fit=crop',
      stats: '450k streams'
    },
  ];

  const filteredReleases = releases.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full px-6 lg:px-12 py-8 lg:py-12 bg-brand-black/20">
      {/* HEADER ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-3xl lg:text-5xl font-display font-medium text-white tracking-tight leading-none mb-4">
            Music <span className="text-brand-primary">Catalog</span>
          </h1>
          <p className="text-white/30 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] italic">Manage and track all your global releases.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-yellow transition-colors" />
            <input 
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-[2px] pl-12 pr-6 py-4 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-primary focus:bg-white/[0.08] transition-all w-full sm:w-64"
            />
          </div>
          <button className="w-full sm:w-auto bg-brand-primary hover:bg-white hover:text-black text-white px-8 py-4 rounded-[2px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-primary/10 group active:scale-95">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            New Release
          </button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Releases', value: '24', icon: Disc, color: 'text-brand-primary' },
          { label: 'Global Reaches', value: '182', icon: Globe, color: 'text-brand-yellow' },
          { label: 'Active Streams', value: '2.4M', icon: BarChart3, color: 'text-green-400' },
          { label: 'Royalties Ready', value: '$842', icon: Wallet, color: 'text-white' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-[4px] group hover:bg-white/5 transition-all">
             <div className="flex items-center justify-between mb-4">
               <stat.icon className={`w-4 h-4 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
               <ArrowRight className="w-3 h-3 text-white/5 group-hover:text-white/20 transition-colors" />
             </div>
             <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">{stat.label}</p>
             <h4 className="text-2xl font-display font-medium text-white">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* CATALOG LIST */}
      <div className="bg-[#111111]/40 border border-white/5 rounded-[4px] overflow-hidden backdrop-blur-3xl">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Your Content</h3>
          <div className="flex items-center gap-6">
             <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                <Filter className="w-3 h-3" />
                Filter
             </button>
             <button className="text-[9px] font-black uppercase tracking-widest text-brand-primary hover:text-white transition-colors">View All</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.03] text-white/20">
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Release</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Released</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-right">Analytics</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody>
              {filteredReleases.map((release) => (
                <motion.tr 
                  key={release.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-[2px] overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 group-hover:scale-105 transition-transform shadow-lg relative">
                          <img src={release.artwork} alt={release.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Play className="w-4 h-4 text-white fill-current" />
                          </div>
                       </div>
                       <div>
                         <p className="text-[11px] font-black uppercase tracking-widest text-white mb-1 group-hover:text-brand-primary transition-colors">{release.title}</p>
                         <p className="text-[9px] font-medium text-white/20 italic">UPC: 84029302{release.id}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 border border-white/5 px-2.5 py-1 rounded-[1px]">{release.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    {release.status === 'Live' && (
                      <div className="flex items-center gap-2 text-green-500 bg-green-500/5 px-3 py-1.5 rounded-full w-fit border border-green-500/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
                      </div>
                    )}
                    {release.status === 'Pending' && (
                      <div className="flex items-center gap-2 text-brand-yellow bg-brand-yellow/5 px-3 py-1.5 rounded-full w-fit border border-brand-yellow/20">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">In Review</span>
                      </div>
                    )}
                    {release.status === 'Rejected' && (
                      <div className="flex items-center gap-2 text-red-500 bg-red-500/5 px-3 py-1.5 rounded-full w-fit border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Issues</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                    {release.date}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{release.stats}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-white/20 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 p-8 border border-white/5 border-dashed rounded-[4px] flex flex-col items-center text-center">
         <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mb-6 italic">Looking for older releases?</p>
         <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-brand-primary transition-all flex items-center gap-2 group">
            Check Archives
            <ExternalLink className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
         </button>
      </div>
    </div>
  );
}

// Fixed missing icons in mapping
const Globe = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
const Wallet = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>;
