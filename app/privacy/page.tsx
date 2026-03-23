import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="app-shell px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <p className="section-label">Privacy</p>
          <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-8 text-[#61738C]">
          <p>
            Wandrly stores account, trip, itinerary, and planning information to provide a
            connected travel workspace experience.
          </p>
          <p>
            We use data only to support planning features such as itinerary generation,
            budgeting, route organization, document storage, and trip collaboration.
          </p>
          <p>
            Sensitive credentials and third-party API keys are managed separately from user
            trip content. Users should avoid uploading confidential documents unless they are
            comfortable storing them digitally.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
