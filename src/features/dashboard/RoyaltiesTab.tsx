import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  History,
  AlertCircle,
  Plus,
  ChevronRight,
  Globe2,
  Download,
} from "lucide-react";

export default function RoyaltiesTab() {
  const [currency, setCurrency] = useState("USD");

  const currencyRates: Record<string, number> = {
    USD: 1,
    TZS: 2600,
    EUR: 0.92,
    GBP: 0.79,
    KES: 129,
  };

  const currencySymbols: Record<string, string> = {
    USD: "$",
    TZS: "TSh",
    EUR: "€",
    GBP: "£",
    KES: "KSh",
  };

  const convertAmount = (usdAmount: number) => {
    const converted = usdAmount * currencyRates[currency];

    return `${currencySymbols[currency]}${converted.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const history = [
    {
      id: 1,
      type: "Withdrawal",
      amount: -500,
      date: "April 28, 2024",
      method: "PayPal",
    },
    {
      id: 2,
      type: "Earnings",
      amount: 1240.5,
      date: "April 20, 2024",
      method: "Spotify",
    },
    {
      id: 3,
      type: "Earnings",
      amount: 890,
      date: "April 15, 2024",
      method: "Apple Music",
    },
    {
      id: 4,
      type: "Withdrawal",
      amount: -1200,
      date: "March 30, 2024",
      method: "Bank Transfer",
    },
  ];

  const stats = [
    {
      title: "Total Earnings",
      value: 4250.75,
    },
    {
      title: "Withdrawals",
      value: 1700,
    },
    {
      title: "Adjustments",
      value: 120,
    },
  ];

  // PDF EXPORT
  const exportPDF = () => {
    const doc = new jsPDF();

    // HEADER
    doc.setFillColor(245, 245, 0);
    doc.rect(0, 0, 220, 28, "F");

    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("2kTunes Royalties Report", 14, 18);

    // DETAILS
    doc.setFontSize(11);
    doc.setTextColor(110);

    doc.text(`Currency: ${currency}`, 14, 40);

    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      14,
      47
    );

    // SUMMARY
    doc.setFontSize(15);
    doc.setTextColor(0);
    doc.text("Summary", 14, 63);

    autoTable(doc, {
      startY: 68,

      head: [["Metric", "Amount"]],

      body: stats.map((item) => [
        item.title,
        convertAmount(item.value),
      ]),

      theme: "grid",

      styles: {
        fillColor: [18, 18, 18],
        textColor: [255, 255, 255],
        lineColor: [40, 40, 40],
        lineWidth: 0.2,
        fontSize: 10,
      },

      headStyles: {
        fillColor: [245, 245, 0],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    // FIX FOR TYPESCRIPT
    const finalY =
      (doc as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }).lastAutoTable?.finalY || 90;

    // TITLE
    doc.setFontSize(15);
    doc.setTextColor(0);
    doc.text("Transaction History", 14, finalY + 15);

    // TABLE
    autoTable(doc, {
      startY: finalY + 20,

      head: [["Type", "Date", "Method", "Amount"]],

      body: history.map((item) => [
        item.type,
        item.date,
        item.method,
        item.amount < 0
          ? `-${convertAmount(Math.abs(item.amount))}`
          : `+${convertAmount(item.amount)}`,
      ]),

      theme: "grid",

      styles: {
        fillColor: [18, 18, 18],
        textColor: [255, 255, 255],
        lineColor: [40, 40, 40],
        lineWidth: 0.2,
        fontSize: 10,
      },

      headStyles: {
        fillColor: [245, 245, 0],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    doc.save("2kTunes-Royalties.pdf");
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white overflow-x-hidden">

      {/* HEADER */}
      <div className="border-b border-white/[0.04] bg-[#181818]">
        <div className="px-4 sm:px-6 lg:px-10 py-8">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

            {/* LEFT */}
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3">
                2kTunes Bank
              </p>

              <h1 className="text-[28px] sm:text-[34px] font-bold leading-none mb-4">
                Royalties & Wallet
              </h1>

              <p className="text-white/40 text-sm leading-relaxed">
                Track your earnings, payouts and withdrawal activity across all
                platforms.
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">

              {/* CURRENCY */}
              <div className="relative w-full sm:w-auto">

                <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F500] pointer-events-none" />

                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="
                    h-[44px]
                    w-full
                    sm:w-[180px]
                    pl-11
                    pr-10
                    bg-[#1A1A1A]
                    border
                    border-white/[0.05]
                    rounded-[2px]
                    text-sm
                    text-white
                    appearance-none
                    outline-none
                    hover:border-white/[0.08]
                    transition-all
                  "
                >
                  <option value="USD">USD ($)</option>
                  <option value="TZS">TZS (TSh)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="KES">KES (KSh)</option>
                </select>
              </div>

              {/* WITHDRAW */}
              <button
                className="
                  h-[44px]
                  px-5
                  bg-[#F5F500]
                  hover:bg-white
                  text-black
                  rounded-[2px]
                  transition-all
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-sm
                  font-medium
                  active:scale-[0.98]
                "
              >
                <Wallet className="w-4 h-4" />
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* MAIN CARD */}
          <div className="xl:col-span-2 bg-[#1A1A1A] border border-white/[0.04] rounded-[2px] overflow-hidden">

            <div className="p-5 sm:p-6">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

                <p className="text-[11px] uppercase tracking-[0.18em] text-white/25">
                  September 2020 — July 2024
                </p>

                <div
                  className="
                    w-fit
                    px-3
                    h-[28px]
                    rounded-[2px]
                    bg-[#F5F500]/10
                    border
                    border-[#F5F500]/10
                    flex
                    items-center
                    text-[#F5F500]
                    text-[10px]
                    uppercase
                    tracking-[0.15em]
                  "
                >
                  {currency}
                </div>
              </div>

              <div className="divide-y divide-white/[0.04]">

                {stats.map((item, index) => (
                  <button
                    key={index}
                    className="
                      w-full
                      py-5
                      sm:py-6
                      flex
                      items-center
                      justify-between
                      gap-4
                      group
                      hover:bg-white/[0.02]
                      transition-all
                    "
                  >
                    {/* TITLE */}
                    <span
                      className="
                        text-[#F5F500]
                        text-[14px]
                        sm:text-[18px]
                        font-medium
                        text-left
                        leading-snug
                      "
                    >
                      {item.title}
                    </span>

                    {/* VALUE */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">

                      <span
                        className="
                          text-[14px]
                          sm:text-[18px]
                          font-semibold
                          text-white
                          text-right
                          break-all
                          leading-tight
                        "
                      >
                        {convertAmount(item.value)}
                      </span>

                      <ChevronRight
                        className="
                          w-4
                          h-4
                          flex-shrink-0
                          text-white/15
                          group-hover:text-[#F5F500]
                          transition-all
                        "
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* NOTICE */}
            <div className="p-5 bg-[#161616] border-t border-white/[0.04] text-center">
              <p className="text-sm text-white/40 leading-relaxed">
                Streaming services typically report earnings on a 2–3 month
                delay.
              </p>
            </div>
          </div>

          {/* PAYOUT */}
          <div className="bg-[#1A1A1A] border border-white/[0.04] rounded-[2px] p-5 sm:p-6">

            <div className="flex items-center justify-between mb-8">

              <div>
                <h3 className="text-[20px] font-semibold">
                  Payout Method
                </h3>

                <p className="text-sm text-white/35 mt-1">
                  Connected accounts.
                </p>
              </div>

              <CreditCard className="w-5 h-5 text-[#F5F500]" />
            </div>

            <div className="space-y-4">

              {/* BANK */}
              <button
                className="
                  w-full
                  bg-[#161616]
                  border
                  border-white/[0.04]
                  rounded-[2px]
                  p-5
                  text-left
                  hover:border-white/[0.08]
                  transition-all
                "
              >
                <div className="flex items-center justify-between mb-3">

                  <span className="text-[11px] uppercase tracking-[0.15em] text-[#F5F500]">
                    Bank Account
                  </span>

                  <ChevronRight className="w-4 h-4 text-white/20" />
                </div>

                <div className="flex items-center justify-between gap-3">

                  <p className="text-sm text-white truncate">
                    KCB BANK **** 4321
                  </p>

                  <span className="text-xs text-white/20 whitespace-nowrap">
                    Default
                  </span>
                </div>
              </button>

              {/* MOBILE */}
              <button
                className="
                  w-full
                  bg-[#161616]
                  border
                  border-white/[0.04]
                  rounded-[2px]
                  p-5
                  text-left
                  hover:border-white/[0.08]
                  transition-all
                "
              >
                <div className="flex items-center justify-between mb-3">

                  <span className="text-[11px] uppercase tracking-[0.15em] text-white/35">
                    Mobile Money
                  </span>

                  <Plus className="w-4 h-4 text-white/20" />
                </div>

                <p className="text-sm text-white/25">
                  Add Number
                </p>
              </button>
            </div>

            {/* ALERT */}
            <div
              className="
                mt-6
                bg-[#F5F500]/5
                border
                border-[#F5F500]/10
                rounded-[2px]
                p-4
                flex
                items-start
                gap-3
              "
            >
              <AlertCircle className="w-4 h-4 text-[#F5F500] flex-shrink-0 mt-0.5" />

              <p className="text-[12px] text-white/45 leading-relaxed">
                Royalties can take up to 30 days to reflect after reporting.
              </p>
            </div>
          </div>
        </div>

        {/* CURRENT BALANCE */}
        <div
          className="
            bg-[#1A1A1A]
            border
            border-white/[0.04]
            rounded-[2px]
            p-6
            sm:p-8
            text-center
            overflow-hidden
          "
        >
          <h3 className="text-[24px] sm:text-[32px] font-semibold mb-5">
            Current Balance
          </h3>

          <h1
            className="
              text-[34px]
              xs:text-[42px]
              sm:text-[60px]
              md:text-[75px]
              lg:text-[90px]
              font-bold
              text-[#F5F500]
              leading-none
              break-words
              overflow-hidden
            "
          >
            {convertAmount(10)}
          </h1>

          <p className="text-white/35 text-sm mt-5">
            Minus platform fees and adjustments
          </p>

          <button
            className="
              mt-8
              h-[48px]
              px-6
              sm:px-8
              bg-[#F5F500]
              hover:bg-white
              text-black
              rounded-[2px]
              transition-all
              inline-flex
              items-center
              gap-3
              text-sm
              font-medium
              active:scale-[0.98]
            "
          >
            Withdraw Earnings

            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* HISTORY */}
        <div className="bg-[#1A1A1A] border border-white/[0.04] rounded-[2px] overflow-hidden">

          {/* TOP */}
          <div
            className="
              p-5
              sm:p-6
              border-b
              border-white/[0.04]
              flex
              flex-col
              sm:flex-row
              sm:items-center
              justify-between
              gap-4
            "
          >
            <div className="flex items-center gap-3">

              <History className="w-5 h-5 text-[#F5F500]" />

              <div>
                <h3 className="text-[20px] font-semibold">
                  Transaction History
                </h3>

                <p className="text-sm text-white/35 mt-1">
                  Latest earnings and payouts.
                </p>
              </div>
            </div>

            {/* EXPORT */}
            <button
              onClick={exportPDF}
              className="
                h-[40px]
                px-4
                bg-[#161616]
                border
                border-white/[0.04]
                rounded-[2px]
                hover:border-white/[0.08]
                text-sm
                text-white/70
                hover:text-white
                transition-all
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">

            <table className="w-full min-w-[720px]">

              <thead>
                <tr className="border-b border-white/[0.04]">

                  <th className="text-left px-6 py-5 text-[10px] uppercase tracking-[0.18em] text-white/25">
                    Type
                  </th>

                  <th className="text-left px-6 py-5 text-[10px] uppercase tracking-[0.18em] text-white/25">
                    Date
                  </th>

                  <th className="text-left px-6 py-5 text-[10px] uppercase tracking-[0.18em] text-white/25">
                    Method
                  </th>

                  <th className="text-right px-6 py-5 text-[10px] uppercase tracking-[0.18em] text-white/25">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>

                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="
                      border-b
                      border-white/[0.04]
                      hover:bg-[#161616]
                      transition-all
                      cursor-pointer
                      group
                    "
                  >
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div
                          className={`
                            w-9
                            h-9
                            rounded-[2px]
                            flex
                            items-center
                            justify-center
                            ${
                              item.type === "Earnings"
                                ? "bg-[#F5F500]/10 text-[#F5F500]"
                                : "bg-white/[0.04] text-white"
                            }
                          `}
                        >
                          {item.type === "Earnings" ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <span className="text-sm font-medium">
                          {item.type}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-white/40">
                      {item.date}
                    </td>

                    <td className="px-6 py-5 text-sm text-white/40">
                      {item.method}
                    </td>

                    <td className="px-6 py-5 text-right text-sm font-semibold">

                      <div className="flex items-center justify-end gap-3">

                        <span
                          className={
                            item.type === "Earnings"
                              ? "text-[#F5F500]"
                              : "text-white"
                          }
                        >
                          {item.amount < 0
                            ? `-${convertAmount(Math.abs(item.amount))}`
                            : `+${convertAmount(item.amount)}`}
                        </span>

                        <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-[#F5F500] transition-all" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
