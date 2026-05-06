'use client';

import React from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download,
  CreditCard,
  History,
  AlertCircle,
  Plus
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Card from "@/components/ui/Card";

export default function RoyaltiesTab() {
  const { t } = useLanguage();

  const history = [
    { id: 1, type: 'Payout', amount: '-$500.00', status: 'Completed', date: 'April 28, 2024', method: 'PayPal' },
    { id: 2, type: 'Earnings', amount: '+$1,240.50', status: 'Added', date: 'April 20, 2024', method: 'Spotify' },
    { id: 3, type: 'Earnings', amount: '+$890.00', status: 'Added', date: 'April 15, 2024', method: 'Apple Music' },
    { id: 4, type: 'Payout', amount: '-$1,200.00', status: 'Completed', date: 'March 30, 2024', method: 'Bank Transfer' },
  ];

  return (
    <div className="space-y-8 lg:space-y-12 p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-5xl font-display font-medium text-white tracking-tight leading-none mb-3">
            Royalties <span className="text-white/20">& Wallet</span>
          </h1>
          <p className="text-white/30 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em]">Track your earnings and withdraw your funds instantly.</p>
        </div>
        <button className="bg-brand-primary text-white px-8 py-4 rounded-[2px] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-brand-yellow hover:text-black transition-all shadow-xl active:scale-95">
          Request Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card variant="outline" className="md:col-span-2 p-8 lg:p-10 border-white/10 bg-gradient-to-br from-brand-black to-[#1A1A1A]">
          <div className="flex flex-col h-full justify-between gap-12">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Available for Payout</p>
                 <h2 className="text-4xl lg:text-7xl font-display font-medium text-white tracking-tighter">$4,250.75</h2>
               </div>
               <div className="p-4 bg-white/5 text-brand-primary rounded-[2px] border border-white/5">
                 <Wallet className="w-8 h-8 lg:w-10 lg:h-10" />
               </div>
            </div>
            <div className="flex flex-wrap items-center gap-10">
               <div>
                  <div className="flex items-center gap-2 text-green-500 text-[9px] font-black uppercase tracking-widest mb-2">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Month Earnings
                  </div>
                  <p className="text-2xl font-display font-medium text-white">+$1,420.00</p>
               </div>
               <div className="hidden sm:block w-px h-12 bg-white/5"></div>
               <div>
                  <div className="flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-widest mb-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    Pending Clear
                  </div>
                  <p className="text-2xl font-display font-medium text-white/40">$840.45</p>
               </div>
            </div>
          </div>
        </Card>

        <Card variant="outline" className="p-8 lg:p-10 border-white/10 bg-brand-black space-y-8">
           <h3 className="text-lg font-display font-medium text-white tracking-tight">Payout Settings</h3>
           <div className="space-y-4">
              <div className="p-5 bg-white/[0.02] rounded-[2px] border border-white/5 group hover:border-brand-primary/40 transition-all cursor-pointer">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">Bank Account</span>
                    <Download className="w-4 h-4 text-white/10" />
                 </div>
                 <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white">KCB BANK **** 4321</p>
              </div>
              <div className="p-5 bg-white/[0.02] rounded-[2px] border border-white/5 group hover:border-brand-primary/40 transition-all cursor-not-allowed">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Mobile Money</span>
                    <Plus className="w-4 h-4 text-white/10" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/10">Add Number</p>
              </div>
           </div>
           <div className="flex items-start gap-4 p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-[2px]">
             <AlertCircle className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
             <p className="text-[9px] font-medium text-white/40 leading-relaxed italic">Royalties might take up to 30 days to reflect after month end from DSPs.</p>
           </div>
        </Card>
      </div>

      <Card variant="outline" className="border-white/10 overflow-hidden bg-brand-black">
        <div className="p-8 lg:p-10 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <History className="w-5 h-5 text-white/20" />
              <h3 className="text-lg font-display font-medium text-white tracking-tight">Transaction History</h3>
           </div>
           <button className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-primary hover:text-white transition-colors">Export .CSV</button>
        </div>
        <div className="overflow-x-auto text-nowrap lg:text-wrap">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5">
                  <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Type</th>
                  <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Date</th>
                  <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Method</th>
                  <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 ${item.type === 'Earnings' ? 'text-green-500' : 'text-brand-primary'}`}>
                          {item.type === 'Earnings' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em] text-white group-hover:text-brand-primary transition-colors">{item.type}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">{item.date}</td>
                    <td className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">{item.method}</td>
                    <td className={`px-10 py-6 text-right font-display font-medium text-sm lg:text-lg ${item.type === 'Earnings' ? 'text-green-500' : 'text-white'}`}>
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </Card>
    </div>
  );
}
