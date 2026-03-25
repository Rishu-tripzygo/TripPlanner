import { auth } from "@/auth";
import PublicProfilePanel from "@/components/public-profile-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicProfile } from "@/lib/public-travel";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await auth();
  const { username } = await params;
  const profile = await getPublicProfile(username, session?.user?.id);

  if (!profile) {
    return (
      <div className="app-shell px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
              Public profile unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[#61738C]">
            This traveler has not enabled a public profile yet, or the link is no longer active.
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PublicProfilePanel profile={profile} />;
}
