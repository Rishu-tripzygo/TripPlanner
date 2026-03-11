"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function geocodeAddress(address: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
      address
    )}`,
    {
      headers: {
        "User-Agent": "travel-planner-app/1.0",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to geocode address.");
  }

  const data: Array<{ lat: string; lon: string }> = await response.json();
  const result = data[0];

  if (!result) {
    throw new Error("Address not found.");
  }

  return { lat: Number(result.lat), lng: Number(result.lon) };
}

export async function addLocation(formData: FormData, tripId: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const address = formData.get("address")?.toString();
  if (!address) {
    throw new Error("Missing address");
  }

  const { lat, lng } = await geocodeAddress(address);

  const count = await prisma.location.count({
    where: { tripId },
  });

  await prisma.location.create({
    data: {
      locationTitle: address,
      lat,
      lng,
      tripId,
      order: count,
    },
  });

  redirect(`/trips/${tripId}`);
}
