'use client';

export default function NotifyForm() {
  function onSubmit(e) {
    e.preventDefault();
    // TODO: send to your email service / API route
    alert('Thanks! We’ll notify you.');
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]"
    >
      <input
        type="email"
        required
        placeholder="Enter your email"
        className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 outline-none focus:border-white/30"
      />
      <button className="rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-zinc-900">
        Notify me
      </button>
    </form>
  );
}