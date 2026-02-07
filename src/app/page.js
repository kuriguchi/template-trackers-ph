'use client'

import TemplateTrackerIcon from "./components/TemplateTrackerIcon";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrPaymentIntentId, setQrPaymentIntentId] = useState("");

  return (
    <main className="min-h-dvh bg-white text-[#1560a8]">
      {/* Top Banner */}
      <div
        className="w-full py-6 text-center text-md font-medium"
        style={{
          background: "linear-gradient(90deg,#D3E3FD 0%,#F0F4F9 100%)",
          color: "#6b7280",
        }}
      >
        Get 10% OFF your first purchase
      </div>

      {/* Container */}
      <div className="mx-4 max-w-6xl mx-auto py-12 space-y-16">
        {/* Header / Hero */}
        <header className="text-center px-4">
          <TemplateTrackerIcon className="mx-auto text-[#2596be]" accentClass="text-[#2596be]" />
          <h1
            className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
            style={{ color: "#0b4f78" }}
          >
            Plan Smarter. Spend Wisely. Save Intentionally.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-[#1560a8]/90 italic">
            Simple, beautiful, and effective budgeting templates made for Filipinos.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="#templates"
              className="w-full sm:w-auto text-center rounded-md bg-[#2596be] px-5 py-3 text-white font-semibold shadow hover:opacity-95"
            >
              Shop Templates
            </a>
            <a
              href="#about"
              className="w-full sm:w-auto text-center rounded-md border border-[#2596be] px-5 py-3 text-[#2596be] font-semibold hover:bg-[#f0fbff]"
            >
              Learn More
            </a>
          </div>

          {/* subtle background accent (hidden on small screens) */}
          <div className="mt-8 pointer-events-none">
            <div
              className="hidden sm:block relative mx-auto w-72 h-40 opacity-30 blur-sm"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, #D3E3FD, transparent 25%), radial-gradient(circle at 80% 80%, #F0F4F9, transparent 25%)",
              }}
            />
          </div>
        </header>

        {/* About Section */}
        <section
          id="about"
          className="grid md:grid-cols-2 gap-6 items-center bg-white/60 rounded-2xl p-6 shadow-sm sm:no-border sm:no-shadow"
        >
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#0b4f78" }}>
              We make planning simple
            </h2>
            <p className="mt-3 text-[#1560a8]/90">
              We make digital templates that simplify financial planning and empower you to manage your money
              intentionally — whether you’re budgeting for your family, business, or side hustle.
            </p>

            <div className="mt-4">
              <a href="#how-it-works" className="inline-block rounded-md bg-[#2596be] px-4 py-2 text-white font-semibold">
                See How It Works
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            {/* Mockup image placeholder */}
            <div className="w-64 h-40 rounded-lg bg-gradient-to-br from-[#D3E3FD] to-[#F0F4F9] flex items-center justify-center border border-white/40 shadow">
              <span className="text-sm text-[#1560a8]/80">Mockup Preview</span>
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="products" className="space-y-6">
          <h3 className="text-2xl font-bold text-center" style={{ color: "#0b4f78" }}>
            Products
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Bookkeeping Template",
                tag: "Simple expense monitoring",
                price: "₱149",
                href: "/products/bookkeeping",
                imageUrl: "/1st.png",
              },
              {
                title: "Academic Tracking",
                tag: "Grades, assignments, and goals",
                price: "₱199",
                href: "/products/academic-tracking",
                imageUrl: "/academic_tracker_preview.png",
              },
              {
                title: "All-in-one Finance Tracker",
                tag: "Budget, savings, and cash flow",
                price: "₱249",
                href: "/products/all-in-one-finance",
                imageUrl: "/all_in_one_fin.png",
              },
            ].map((t, idx) => (
              <div key={t.title + idx} className="rounded-xl border p-4 bg-white/60 sm:m-4">
                <div className="h-36 rounded-md bg-gradient-to-tr from-[#F0F4F9] to-[#D3E3FD] flex items-center justify-center mb-4">
                  {t.imageUrl ? (
                    <img src={t.imageUrl} alt={`${t.title} Preview`} className="h-full w-full object-cover rounded-md shadow" />
                  ) : (
                    <span className="text-sm text-[#1560a8]/80">Preview</span>
                  )}
                </div>
                <h4 className="font-semibold" style={{ color: "#0b4f78" }}>
                  {t.href ? (
                    <a href={t.href} className="text-[#2596be] underline">
                      {t.title}
                    </a>
                  ) : (
                    t.title
                  )}
                </h4>
                <p className="text-sm text-[#1560a8]/80">{t.tag}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg font-bold">{t.price}</div>
                  {t.href ? (
                    <a
                      href={t.href}
                      className="rounded-md bg-[#2596be] px-3 py-1 text-white text-sm font-medium"
                    >
                      Buy Now
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* How It Works */}
        <section id="how-it-works" className="rounded-2xl bg-[#f8fbff] p-6">
          <h3 className="text-2xl font-bold text-center" style={{ color: "#0b4f78" }}>
            How It Works
          </h3>
          <ol className="mt-6 space-y-4 max-w-3xl mx-auto text-[#1560a8]">
            <li className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2596be] text-white font-semibold">
                1
              </div>
              <div>
                <div className="font-semibold">Choose your tracker</div>
                <div className="text-sm text-[#1560a8]/80">Pick the template that fits your goals.</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2596be] text-white font-semibold">
                2
              </div>
              <div>
                <div className="font-semibold">Checkout securely</div>
                <div className="text-sm text-[#1560a8]/80">GCash, Maya, Mastercard</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2596be] text-white font-semibold">
                3
              </div>
              <div>
                <div className="font-semibold">Receive your Google Sheets link instantly</div>
                <div className="text-sm text-[#1560a8]/80">Open, copy, and use right away.</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2596be] text-white font-semibold">
                4
              </div>
              <div>
                <div className="font-semibold">Customize and start tracking</div>
                <div className="text-sm text-[#1560a8]/80">Adjust categories, set targets, and monitor progress.</div>
              </div>
            </li>
          </ol>
        </section>

        {/* Testimonials */}
        {/* <section className="space-y-4">
          <h3 className="text-2xl font-bold text-center" style={{ color: "#0b4f78" }}>
            What Our Users Are Saying
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Ana (Manila)",
                text: "These templates helped me finally track my family budget. Simple and effective!",
              },
              {
                name: "Miguel (Cebu)",
                text: "Fast delivery and the sheets are easy to customize. Highly recommend.",
              },
              {
                name: "Sara (Davao)",
                text: "Saved me so much time. Great for my small business bookkeeping.",
              },
            ].map((r) => (
              <div key={r.name} className="rounded-lg border p-4 bg-white/60">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-amber-400">★★★★★</div>
                </div>
                <p className="mt-3 text-sm text-[#1560a8]/80">&quot;{r.text}&quot;</p>
              </div>
            ))}
          </div>
        </section> */}

        {/* Subscribe */}
        <section className="rounded-2xl bg-white/70 p-6 flex flex-col items-center">
          <h4 className="text-xl font-bold" style={{ color: "#0b4f78" }}>
            Join our community of smart planners — get updates and exclusive offers.
          </h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(`Subscribed: ${email}`);
              setEmail("");
            }}
            className="mt-4 flex flex-col sm:flex-row w-full max-w-xl gap-3"
          >
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-md border px-3 py-2 w-full"
            />
            <button className="rounded-md bg-[#2596be] px-4 py-2 text-white font-semibold w-full sm:w-auto">
              Subscribe Now
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TemplateTrackerIcon className="h-8 w-8 text-[#2596be]" accentClass="text-[#2596be]" />
              <div>
                <div className="font-semibold">Template Trackers PH</div>
                <div className="text-sm text-[#1560a8]/80">templatetrackersph@gmail.com</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-[#1560a8]/80">
              <div>Payments:</div>
              <div className="flex gap-2 items-center">
                <div className="px-2 py-1 bg-white rounded shadow text-[#1560a8]">GCash</div>
                <div className="px-2 py-1 bg-white rounded shadow text-[#1560a8]">Maya</div>
                <div className="px-2 py-1 bg-white rounded shadow text-[#1560a8]">Mastercard</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-[#1560a8]/70">© 2025 Template Trackers PH</div>
        </footer>
      </div>
    </main>
  );
}
