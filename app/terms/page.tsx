import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="app-shell px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <p className="section-label">Terms</p>
          <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-8 text-[#61738C]">
          <p>
            Wandrly provides AI-assisted planning recommendations. Itineraries, weather,
            transport suggestions, and hotel guidance should be reviewed by the traveler before
            any real booking or travel decision is made.
          </p>
          <p>
            Users are responsible for verifying visas, safety advisories, pricing, bookings,
            and destination-specific restrictions independently.
          </p>
          <p>
            By using the platform, you agree that Wandrly is a planning and organization tool,
            not a guarantee of availability, safety, or pricing accuracy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
