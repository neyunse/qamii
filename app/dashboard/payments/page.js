import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Question from "@/models/Question";
import { redirect } from "next/navigation";
import { Receipt, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import RefundButton from "./RefundButton";
import { CURRENCY_MAP } from "@/lib/constants";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();

  const user = await User.findById(session.user.id);
  const currency = user.profile?.currency || "ARS";

  // Find all transactions (paid, answered, refunded)
  const transactions = await Question.find({
    creatorId: session.user.id,
    status: { $in: ['paid', 'answered', 'refunded'] }
  }).sort({ createdAt: -1 });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
        <div className="px-6 py-8 md:px-10 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <Receipt className="w-6 h-6 text-white" />
              Payments & Orders
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">View your incoming payments and manage refunds.</p>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
              <Receipt className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No transactions yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto text-sm">
                When fans pay for your questions, they will appear here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/20 text-xs uppercase tracking-wider text-zinc-500 font-bold">
                  <th className="px-4 py-4 font-bold">Date</th>
                  <th className="px-4 py-4 font-bold">Question Details</th>
                  <th className="px-4 py-4 font-bold">Amount</th>
                  <th className="px-4 py-4 font-bold">Status</th>
                  <th className="px-4 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {transactions.map((t) => {
                  const isRefunded = t.status === 'refunded';
                  const createdAtDate = new Date(t.createdAt);
                  const date = createdAtDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });

                  // Calculate hours since transaction
                  const msSinceTransaction = new Date().getTime() - createdAtDate.getTime();
                  const hoursSinceTransaction = msSinceTransaction / (1000 * 3600);
                  const isPastGracePeriod = hoursSinceTransaction > 48;

                  const amount = t.amount || t.priceARS || 0;
                  const itemCurrency = t.currency || "ARS";

                  return (
                    <tr key={t._id.toString()} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="px-4 py-4 text-sm text-zinc-400 whitespace-nowrap">
                        {date}
                      </td>
                      <td className="px-4 py-4 max-w-[150px] sm:max-w-[250px]">
                        <p className="text-sm font-medium text-white truncate w-full" title={t.content}>
                          "{t.content}"
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1.5 text-sm font-bold ${isRefunded ? 'text-zinc-500 line-through' : 'text-emerald-400'}`}>
                          {isRefunded ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                          {itemCurrency} {CURRENCY_MAP[itemCurrency]?.symbol || "$"}{amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${t.status === 'paid' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          t.status === 'answered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-zinc-800/50 text-zinc-400 border-zinc-700'
                          }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        {!isRefunded ? (
                          isPastGracePeriod ? (
                            <span className="text-xs font-semibold text-zinc-600 block" title="The 48-hour refund window has expired.">Non-refundable</span>
                          ) : (
                            <RefundButton
                              questionId={t._id.toString()}
                              paymentId={t.paymentId}
                              amount={amount}
                              currency={itemCurrency}
                            />
                          )
                        ) : (
                          <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Refunded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 md:p-8 mt-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div className="bg-zinc-900/50 p-5 rounded-lg border border-zinc-800/50">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
              Why can't I process a refund?
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              If a refund fails, it usually means your MercadoPago account does not have enough available balance to cover the full original purchase price.
              Because QAmii deducts a small platform fee at the time of purchase, you must have enough funds (often from other recent sales or your own balance) to return the 100% gross amount back to the fan.
            </p>
          </div>

          <div className="bg-zinc-900/50 p-5 rounded-lg border border-zinc-800/50">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
              When do fans get their money back?
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Once you click Refund and it processes successfully, MercadoPago immediately reverses the charge. If they paid with a credit card, it may take a few days to appear on their billing statement depending on their bank.
            </p>
          </div>

          <div className="bg-zinc-900/50 p-5 rounded-lg border border-zinc-800/50">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
              Is there a time limit for refunds?
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Yes, for security and accounting reasons, refunds can only be issued within the first <strong>48 hours</strong> strictly after the original transaction date. Once this grace period expires, the transaction becomes permanently non-refundable on the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
