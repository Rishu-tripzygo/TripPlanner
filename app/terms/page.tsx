const sections = [
  {
    title: "Service purpose",
    text: "Wandrly is a travel planning and organization platform. It helps users generate itineraries, manage trip details, and coordinate travel information in one system.",
  },
  {
    title: "Planning recommendations",
    text: "AI suggestions, route ideas, hotel references, budgets, and activity guidance are recommendations only. Travelers remain responsible for checking availability, suitability, pricing, visas, and destination regulations.",
  },
  {
    title: "User content",
    text: "You are responsible for the documents, notes, uploaded files, and shared content stored in your account. Do not upload material you are not allowed to store or share.",
  },
  {
    title: "Availability and limits",
    text: "Because the product depends on third-party tools such as AI providers, maps, hosting, and file storage, features may occasionally be unavailable, slower, or subject to external service limits.",
  },
];

export default function TermsPage() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="app-shell">
        <div className="glass-shell overflow-hidden rounded-[34px] p-7 sm:p-10">
          <p className="section-label text-[#14518b]">Terms</p>
          <h1 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.8rem] font-bold tracking-[-0.05em] text-[#0f3460] sm:text-[4rem]">
            Terms & Conditions
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#61738C]">
            These terms describe how Wandrly should be used as a travel planning product and what
            responsibilities remain with the traveler when making real-world travel decisions.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {sections.map((section) => (
              <div key={section.title} className="rounded-[26px] border border-white/55 bg-white/48 p-6 backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-[#0f3460]">{section.title}</h2>
                <p className="mt-3 text-sm leading-8 text-[#61738C]">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[26px] border border-white/55 bg-white/48 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-[#0f3460]">Travel responsibility</h2>
            <p className="mt-3 text-sm leading-8 text-[#61738C]">
              Wandrly is designed to improve travel planning clarity, not to replace official
              travel advisories, booking confirmations, or local authority guidance. Final booking
              and travel decisions should always be reviewed carefully by the traveler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
