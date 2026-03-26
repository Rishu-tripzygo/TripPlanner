const sections = [
  {
    title: "What Wandrly collects",
    text: "We collect account details, trip information, itinerary preferences, uploaded files, and usage activity needed to provide the Wandrly travel planning workspace.",
  },
  {
    title: "How data is used",
    text: "Your information is used to generate itineraries, save trip workspaces, organize documents, manage reminders, and improve the planning experience across the product.",
  },
  {
    title: "Third-party services",
    text: "Wandrly relies on services such as authentication providers, hosting, database infrastructure, AI model providers, mapping tools, and file storage tools to deliver core functionality.",
  },
  {
    title: "Your control",
    text: "You can edit trip information, remove saved items, and stop using the service at any time. Sensitive travel decisions should still be reviewed independently before booking.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="landing-shell">
        <div className="overflow-hidden rounded-[34px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(247,243,237,0.9))] p-7 shadow-[0_20px_44px_rgba(26,28,27,0.06)] sm:p-10">
          <p className="section-label text-[#14518b]">Privacy</p>
          <h1 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.8rem] font-bold tracking-[-0.05em] text-[#0f3460] sm:text-[4rem]">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#61738C]">
            This policy explains how Wandrly handles account information, trip content, uploaded
            travel materials, and product activity in order to deliver a connected AI travel
            planning experience.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {sections.map((section) => (
              <div key={section.title} className="rounded-[26px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-6">
                <h2 className="text-xl font-semibold text-[#0f3460]">{section.title}</h2>
                <p className="mt-3 text-sm leading-8 text-[#61738C]">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[26px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-6">
            <h2 className="text-xl font-semibold text-[#0f3460]">Contact and updates</h2>
            <p className="mt-3 text-sm leading-8 text-[#61738C]">
              If Wandrly updates the way personal data is handled, this page should be revised to
              reflect the current service behavior. For product support or privacy questions, use
              the support page linked in the footer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
