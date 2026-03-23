import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SafetyPage() {
  return (
    <div className="app-shell px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <p className="section-label">Safety</p>
          <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
            Safety Guidance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-8 text-[#61738C]">
          <p>
            Wandrly can help organize safety-related notes, but travelers should always check
            government advisories, local regulations, weather conditions, and health guidance
            before departure.
          </p>
          <p>
            Keep emergency contacts, documents, insurance details, and local transport options
            accessible inside your trip workspace.
          </p>
          <p>
            For critical situations, rely on official sources and local authorities rather than
            AI-generated recommendations alone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
