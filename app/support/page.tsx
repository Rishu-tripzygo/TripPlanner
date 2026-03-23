import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="app-shell px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <p className="section-label">Support</p>
          <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
            Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-8 text-[#61738C]">
          <p>
            If a trip is not generating correctly, first check that your AI provider keys,
            database connection, and authentication settings are valid in your environment.
          </p>
          <p>
            For itinerary, upload, or sign-in issues, review deployment logs and confirm that
            OAuth callback URLs, database access, and storage tokens match your live domain.
          </p>
          <p>
            Wandrly is designed to keep planning, logistics, and memory tools connected, so the
            best support path is usually checking the trip workspace flow end to end.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
