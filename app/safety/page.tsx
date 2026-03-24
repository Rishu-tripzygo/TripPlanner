const safetyItems = [
  {
    title: "Verify official guidance",
    text: "Always confirm entry rules, local advisories, weather alerts, and health notices using official government or destination sources before travel.",
  },
  {
    title: "Keep essentials accessible",
    text: "Store insurance information, emergency contacts, travel documents, and accommodation details in your trip workspace so they are easy to access when needed.",
  },
  {
    title: "Review AI outputs critically",
    text: "Wandrly can help organize safe planning habits, but AI-generated suggestions should never replace official safety guidance or on-the-ground judgment.",
  },
];

export default function SafetyPage() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="app-shell">
        <div className="glass-shell overflow-hidden rounded-[34px] p-7 sm:p-10">
          <p className="section-label text-[#14518b]">Safety</p>
          <h1 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.8rem] font-bold tracking-[-0.05em] text-[#0f3460] sm:text-[4rem]">
            Travel Safety Guidance
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#61738C]">
            Wandrly supports organized travel preparation, but safe travel decisions still depend on
            verified guidance, local conditions, and traveler judgment.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {safetyItems.map((item) => (
              <div key={item.title} className="rounded-[26px] border border-white/55 bg-white/48 p-6 backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-[#0f3460]">{item.title}</h2>
                <p className="mt-3 text-sm leading-8 text-[#61738C]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
