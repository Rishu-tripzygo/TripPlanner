import { auth } from "@/auth";
import AssistantPanel from "@/components/assistant-panel";
import AuthButton from "@/components/auth-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function AssistantPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="app-shell px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl text-center">
          <CardHeader>
            <p className="section-label">Assistant</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
              Sign in to use your travel assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-[#61738C]">
            <p className="mx-auto max-w-2xl text-sm leading-8">
              The assistant works best when it knows your trips, dates, budgets, and route context.
            </p>
            <AuthButton
              isLoggedIn={false}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-6 py-3 text-sm font-semibold text-white"
            >
              Sign in with GitHub
            </AuthButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
    },
  });

  return <AssistantPanel trips={trips} />;
}
