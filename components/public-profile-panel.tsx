"use client";

import { PublicProfileRecord } from "@/lib/phase-one-types";
import { Button } from "@/components/ui/button";
import PublicTripCard from "@/components/public-trip-card";
import { MapPinned, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function PublicProfilePanel({
  profile,
}: {
  profile: PublicProfileRecord;
}) {
  const [following, setFollowing] = useState(Boolean(profile.isFollowing));
  const [followersCount, setFollowersCount] = useState(profile.followersCount);

  async function toggleFollow() {
    const response = await fetch(`/api/profile/${profile.username}/follow`, {
      method: "POST",
    });
    if (!response.ok) return;
    const data = (await response.json()) as { following: boolean; total: number };
    setFollowing(data.following);
    setFollowersCount(data.total);
  }

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-[rgba(2,71,133,0.08)] bg-white shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
        <div
          className="h-52 bg-cover bg-center"
          style={{
            backgroundImage: profile.coverImageUrl
              ? `linear-gradient(180deg,rgba(2,71,133,0.16),rgba(2,71,133,0.34)),url(${profile.coverImageUrl})`
              : "linear-gradient(135deg,#dfeaf7,#f8f7f4)",
          }}
        />
        <div className="px-8 pb-8">
          <div className="-mt-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-5">
              <div className="relative h-28 w-28 overflow-hidden rounded-[28px] border-4 border-white bg-[#F4F3F1] shadow-[0_16px_30px_rgba(26,28,27,0.08)]">
                {profile.image ? (
                  <Image src={profile.image} alt={profile.name} fill className="object-cover" />
                ) : null}
              </div>
              <div>
                <p className="font-[family-name:var(--font-noto-serif)] text-[42px] font-bold tracking-[-0.04em] text-[#024785]">
                  {profile.name}
                </p>
                <p className="mt-1 text-sm text-[#61738C]">@{profile.username}</p>
                {profile.location ? (
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#61738C]">
                    <MapPinned className="size-4 text-[#024785]" />
                    {profile.location}
                  </p>
                ) : null}
              </div>
            </div>

            <Button onClick={() => void toggleFollow()}>
              <Users className="size-4" />
              {following ? "Following" : "Follow traveler"}
            </Button>
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-8 text-[#61738C]">
            {profile.bio || "A traveler sharing curated journeys, favorite routes, and useful trip memories."}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["Trips shared", profile.tripsShared],
              ["Destinations", profile.destinationsVisited],
              ["Followers", followersCount],
              ["Following", profile.followingCount],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[20px] bg-[#F4F3F1] p-5">
                <p className="text-sm text-[#61738C]">{label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#024785]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <p className="section-label">Public journeys</p>
          <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[42px] font-bold tracking-[-0.04em] text-[#024785]">
            Shared itineraries from this traveler
          </h2>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {profile.publicTrips.map((trip) => (
            <PublicTripCard key={trip.shareId} trip={trip} />
          ))}
        </div>
      </section>
    </div>
  );
}
