import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CURRENCY_MAP } from "@/lib/constants";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="bg-black min-h-screen selection:bg-white selection:text-black">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <div className="inline-flex space-x-6 border border-zinc-800 p-1 rounded-full">
                <span className="bg-white px-3 py-1 text-sm font-bold leading-6 text-black uppercase tracking-wider rounded-full">
                  What's new
                </span>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-zinc-300 pr-4">
                  <span>v1.0-BETA</span>
                </span>
              </div>
            </div>
            <h1 className="mt-10 text-5xl font-light tracking-tight text-white sm:text-7xl">
              Monetize your <span className="font-bold">audience's questions.</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-zinc-400 font-light max-w-2xl">
              QAmii allows creators to receive paid anonymous questions.
              Your fans pay you directly, and we just take a small platform fee. <br /><br />
              <span className="inline-block bg-zinc-900 text-zinc-300 text-sm px-3 py-1 border border-zinc-800 uppercase tracking-widest font-bold">Currently available for creators in Latin America</span>
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-3 text-sm font-bold text-black bg-white border border-white hover:bg-zinc-200 transition-colors rounded-full"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="px-8 py-3 text-sm font-bold text-black bg-white border border-white hover:bg-zinc-200 transition-colors rounded-full"
                  >
                    Start For Free
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-3 text-sm font-bold text-white border border-zinc-800 hover:border-white transition-colors rounded-full"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="bg-black p-4 border border-zinc-800 rounded-2xl">
                <div className="relative bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden flex items-center justify-center w-[400px] h-[500px]">
                  {/* Sleek UI representation */}
                  <div className="flex flex-col items-center justify-center p-8 space-y-6 w-full">
                    <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800" />
                    <div className="h-4 w-32 bg-zinc-800 rounded-full" />
                    <div className="h-3 w-48 bg-zinc-900 rounded-full" />
                    <div className="w-full bg-black p-5 space-y-4 mt-4 border border-zinc-800 rounded-xl">
                      <div className="h-3 w-full bg-zinc-900 rounded-full" />
                      <div className="h-3 w-3/4 bg-zinc-900 rounded-full" />
                      <div className="mt-6 flex items-center justify-center py-3 bg-white text-black text-sm font-bold rounded-full w-full">Pay $100 & Ask</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 border-t border-zinc-800">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How QAmii Works</h2>
          <p className="mt-4 text-lg text-zinc-400 font-light">
            Start earning from your audience's curiosity in just a few minutes.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-[#0f0f0f] border border-zinc-800">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-700">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <dt className="flex items-center gap-x-3 text-xl font-bold leading-7 text-white">
                Create your Profile
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                <p className="flex-auto">Sign up, customize your sleek public page, and connect your MercadoPago account securely.</p>
              </dd>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-[#0f0f0f] border border-zinc-800">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-700">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <dt className="flex items-center gap-x-3 text-xl font-bold leading-7 text-white">
                Share your Link
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                <p className="flex-auto">Put your QAmii link in your bio, Twitch panels, or YouTube descriptions for your fans to find.</p>
              </dd>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-[#0f0f0f] border border-zinc-800">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-700">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <dt className="flex items-center gap-x-3 text-xl font-bold leading-7 text-white">
                Earn Instantly & Answer
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                <p className="flex-auto">Fans pay to ask questions. The money goes straight to you <b>immediately</b>. You then answer them on your dashboard.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 border-t border-zinc-800">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-zinc-400 font-light">
            Everything you need to know about the platform and payments.
          </p>
        </div>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-3">Do I get a refund if the creator doesn't answer?</h3>
            <p className="text-zinc-400 leading-relaxed">
              When you pay, you are directly supporting the creator. Answering a question or issuing a refund is entirely at the <strong>discretion of the creator</strong>. Creators have the ability to click a button and issue a full refund back to you (within 48 hours) if they choose not to answer your question. However, QAmii does not force refunds, so treat it as a supportive tip jar.
            </p>
          </div>
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-3">How do creators get paid?</h3>
            <p className="text-zinc-400 leading-relaxed">
              Payments are processed securely via MercadoPago. The money is transferred directly into the creator's MercadoPago account the moment a fan pays. QAmii only retains a platform fee (minimum 10% to run the servers) that the creator can customize. <br /><br />
              <strong>Supported Creator Countries:</strong> {Object.values(CURRENCY_MAP).map(c => c.name).join(', ')}. Fans can pay from anywhere using enabled local payment methods.
            </p>
          </div>
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-3">Are questions really anonymous?</h3>
            <p className="text-zinc-400 leading-relaxed">
              Yes, on QAmii. The creator will only see the text you write in the question box on their dashboard. <br /><br />
              <strong>However:</strong> The transaction is processed directly between the fan and the creator via MercadoPago. Like any bank transfer, MercadoPago generates a payment receipt that may show real names or account details to <strong>both parties</strong> (the buyer and the receiver). QAmii has no control over the data MercadoPago displays on those receipts.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center">
          <span className="text-xl font-bold text-white tracking-widest uppercase mb-4">QAmii</span>
          <p className="text-zinc-500 text-sm">Empowering creators to monetize their knowledge.</p>
        </div>
      </footer>
    </div>
  );
}
