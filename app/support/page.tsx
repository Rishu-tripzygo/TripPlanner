const supportTopics = [
  {
    title: "Account and sign-in",
    text: "If sign-in fails, confirm that your GitHub OAuth callback URLs, environment variables, and deployment domain match exactly.",
  },
  {
    title: "AI itinerary generation",
    text: "If the planner is not generating correctly, review the configured AI provider order, API keys, and the server logs for provider or schema errors.",
  },
  {
    title: "Trip workspace issues",
    text: "If trips, budgets, packing, or documents feel out of sync, confirm the database connection is healthy and that your deployment has the latest Prisma migrations applied.",
  },
  {
    title: "Uploads and documents",
    text: "Document and image issues usually point to storage token problems, upload route configuration, or permissions around the active trip.",
  },
];

export default function SupportPage() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="landing-shell">
        <div className="overflow-hidden rounded-[34px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(247,243,237,0.9))] p-7 shadow-[0_20px_44px_rgba(26,28,27,0.06)] sm:p-10">
          <p className="section-label text-[#14518b]">Support</p>
          <h1 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.8rem] font-bold tracking-[-0.05em] text-[#0f3460] sm:text-[4rem]">
            Support Center
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#61738C]">
            Wandrly support is centered around keeping the travel planning flow dependable from
            sign-in through itinerary generation and into the trip workspace.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {supportTopics.map((topic) => (
              <div key={topic.title} className="rounded-[26px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-6">
                <h2 className="text-xl font-semibold text-[#0f3460]">{topic.title}</h2>
                <p className="mt-3 text-sm leading-8 text-[#61738C]">{topic.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[26px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-6">
            <h2 className="text-xl font-semibold text-[#0f3460]">Recommended support flow</h2>
            <ol className="mt-3 space-y-3 text-sm leading-8 text-[#61738C]">
              <li>1. Confirm you are on the correct live domain or local environment.</li>
              <li>2. Verify authentication, storage, database, and AI environment variables.</li>
              <li>3. Check deployment logs for the exact failing route or API.</li>
              <li>4. Re-test the trip flow from sign-in to itinerary generation to workspace save.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
