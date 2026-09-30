import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { errorMessage, useResource } from "@/lib/api/useResource";
import {
  fetchRoyalties,
  MIN_WITHDRAWAL_USD,
  num,
  requestWithdrawal,
  usd,
  type RoyaltyResponse,
} from "@/lib/api/dashboard";
import {
  Badge,
  Button,
  DataState,
  Field,
  Notice,
  PageHeader,
  Panel,
  SectionLabel,
  SelectField,
  Skeleton,
  StatTile,
} from "./ui";

/**
 * EARNINGS — GET /api/royalties, POST /api/royalties/withdraw
 *
 * This is the web equivalent of the mobile app's "Bank" tab, but reading live
 * figures: that screen renders hard-coded "$0.0" / "$10.00" strings.
 *
 * Two backend behaviours worth knowing, both surfaced rather than hidden:
 *
 *  1. GET /api/royalties CREATES a $10 "Welcome Bonus" earnings row the first
 *     time an account calls it. That is why a brand-new account shows a $10
 *     balance — it is a real row in `royalty_transactions`, not a placeholder.
 *  2. Withdrawals are stored as NEGATIVE amounts, and the $25 minimum is
 *     enforced server-side (422). The client mirrors the rule so the user gets
 *     an instant answer, but the server remains the authority — its message is
 *     what gets displayed when it rejects.
 *
 * The payout block is READ-ONLY on purpose: `bank_name`, `bank_account_number`,
 * `mobile_money_number` and `payout_method` are returned by this endpoint but
 * are absent from `User::$fillable`, so no endpoint in this backend can write
 * them. Rendering an editable form would be a lie about what saving does.
 */

/** Free-text server-side; these are the two the payout columns describe. */
const METHODS = ["Bank transfer", "Mobile money"];

function WithdrawForm({
  data,
  onDone,
}: {
  data: RoyaltyResponse;
  onDone: () => void;
}) {
  const balance = num(data.stats.balance);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(data.payout.payout_method || METHODS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const belowMinimum = balance < MIN_WITHDRAWAL_USD;

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    setError(null);
    setDone(null);

    const value = Number.parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter the amount you want to withdraw.");
      return;
    }
    if (value < MIN_WITHDRAWAL_USD) {
      setError(`The minimum withdrawal is ${usd(MIN_WITHDRAWAL_USD)}.`);
      return;
    }
    if (value > balance) {
      setError("That’s more than your available balance.");
      return;
    }

    setBusy(true);
    try {
      const res = await requestWithdrawal(value, method);
      setDone(res.message || "Withdrawal request submitted.");
      setAmount("");
      onDone();
    } catch (err) {
      // The server owns the rules; show what it said when it says something
      // specific (minimum, insufficient balance), otherwise a mapped message.
      if (err instanceof ApiError && err.status === 422) {
        setError(err.fieldErrors.amount || err.fieldErrors.method || err.message);
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    /* noValidate: the amount input carries min/max so assistive tech and the
       spinner behave, but native validation would swallow the submit and pop a
       browser tooltip instead of the styled message the rest of the app uses. */
    <Panel as="form" onSubmit={submit} noValidate>
      <SectionLabel>Withdraw</SectionLabel>

      {belowMinimum ? (
        <p className="mt-3.5 text-[0.875rem] font-medium leading-relaxed text-white/40">
          You need at least {usd(MIN_WITHDRAWAL_USD)} available before you can
          request a withdrawal. Your balance is {usd(balance)}.
        </p>
      ) : (
        <>
          <div className="mt-4 space-y-4">
            <Field
              label="Amount (USD)"
              type="number"
              inputMode="decimal"
              min={MIN_WITHDRAWAL_USD}
              max={balance}
              step="0.01"
              placeholder={String(MIN_WITHDRAWAL_USD)}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              hint={`Available ${usd(balance)} · minimum ${usd(MIN_WITHDRAWAL_USD)}`}
            />
            <SelectField
              label="Payout method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </SelectField>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-[11px] border border-clay/30 bg-clay/[0.07] px-3.5 py-2.5 text-[0.8125rem] font-medium text-clay"
            >
              {error}
            </p>
          )}
          {done && (
            <p
              role="status"
              className="mt-4 rounded-[11px] border border-lime/30 bg-lime/[0.07] px-3.5 py-2.5 text-[0.8125rem] font-medium text-lime"
            >
              {done}
            </p>
          )}

          <Button type="submit" busy={busy} className="mt-5 w-full">
            Request withdrawal
          </Button>
          <p className="mt-3 text-[0.75rem] font-medium leading-relaxed text-white/25">
            A request is recorded against your balance immediately. 2K Tunes
            settles it manually — there is no automated payment provider
            connected to this account yet.
          </p>
        </>
      )}
    </Panel>
  );
}

export default function EarningsPage() {
  const royalties = useResource((signal) => fetchRoyalties(signal));

  return (
    <>
      <PageHeader
        eyebrow="2K Tunes / Wallet"
        title="Earnings"
        lede="Your royalty balance, transaction history and withdrawals, exactly as the backend has them recorded."
      />

      <DataState
        state={royalties}
        skeleton={
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <Skeleton className="h-[8.5rem]" />
              <Skeleton className="h-[8.5rem]" />
              <Skeleton className="h-[8.5rem]" />
              <Skeleton className="h-[8.5rem]" />
            </div>
            <Skeleton className="h-[16rem]" />
          </div>
        }
      >
        {(data) => (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile
                label="Available balance"
                value={usd(data.stats.balance)}
                tone="positive"
                meta="Earnings less withdrawals and adjustments"
              />
              <StatTile label="Total earnings" value={usd(data.stats.total_earnings)} />
              <StatTile label="Withdrawn" value={usd(data.stats.withdrawals)} />
              <StatTile label="Adjustments" value={usd(data.stats.adjustments)} />
            </div>

            <div className="mt-4">
              <Notice tone="neutral" title="Reporting delay">
                Streaming platforms typically report earnings on a two to three
                month delay, so recent releases take time to appear here.
              </Notice>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_21rem]">
              {/* ── HISTORY ── */}
              <section className="min-w-0">
                <SectionLabel>Transaction history</SectionLabel>
                <div className="mt-4">
                  {data.history.length === 0 ? (
                    <Panel>
                      <p className="text-[0.875rem] font-medium text-white/40">
                        No transactions recorded on this account yet.
                      </p>
                    </Panel>
                  ) : (
                    <Panel className="p-0 sm:p-0">
                      <ul>
                        {data.history.map((tx, i) => {
                          const amount = num(tx.amount);
                          return (
                            <li
                              key={tx.id}
                              className={`flex items-center justify-between gap-4 p-4 sm:px-5 ${
                                i > 0 ? "border-t border-white/[0.06]" : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="flex min-w-0 items-center gap-2.5">
                                  <span className="min-w-0 truncate text-[0.9375rem] font-bold text-white">
                                    {tx.description || tx.method || tx.type}
                                  </span>
                                  <Badge
                                    tone={
                                      tx.type === "earnings"
                                        ? "positive"
                                        : tx.type === "withdrawal"
                                          ? "neutral"
                                          : "attention"
                                    }
                                  >
                                    {tx.type}
                                  </Badge>
                                </p>
                                <p className="mt-1 text-[0.75rem] font-medium text-white/35">
                                  {new Date(tx.created_at).toLocaleString(undefined, {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {tx.method && tx.description ? ` · ${tx.method}` : ""}
                                </p>
                              </div>
                              <p
                                className={`shrink-0 text-[1rem] font-bold tabular-nums ${
                                  amount < 0 ? "text-white/50" : "text-lime"
                                }`}
                              >
                                {amount < 0 ? "−" : "+"}
                                {usd(Math.abs(amount))}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    </Panel>
                  )}
                </div>
              </section>

              {/* ── WITHDRAW + PAYOUT ── */}
              <aside className="min-w-0 space-y-4">
                <WithdrawForm data={data} onDone={royalties.reload} />

                <Panel>
                  <SectionLabel>Payout details</SectionLabel>
                  <dl className="mt-3">
                    {(
                      [
                        ["Method", data.payout.payout_method],
                        ["Bank", data.payout.bank_name],
                        ["Account number", data.payout.bank_account_number],
                        ["Mobile money", data.payout.mobile_money_number],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-baseline justify-between gap-4 border-t border-white/[0.06] py-3"
                      >
                        <dt className="text-[0.8125rem] font-medium text-white/40">
                          {label}
                        </dt>
                        <dd className="min-w-0 truncate text-[0.8125rem] font-semibold text-white">
                          {value || "Not set"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 text-[0.75rem] font-medium leading-relaxed text-white/25">
                    Payout details are held by 2K Tunes and can’t be edited from
                    the app yet — this backend has no endpoint that writes them.
                    Contact support to change them.
                  </p>
                </Panel>
              </aside>
            </div>
          </>
        )}
      </DataState>
    </>
  );
}
