interface GeocodeResult {
  country: string;
  formattedAddress: string;
}

interface NominatimAddress {
  country?: string;
}

interface NominatimReverseResponse {
  display_name?: string;
  address?: NominatimAddress;
}

export async function getCountryFromCoordinates(
  lat: number,
  lng: number
): Promise<GeocodeResult> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
    {
      headers: {
        "User-Agent": "travel-planner-app/1.0",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return {
      country: "Unknown",
      formattedAddress: `${lat}, ${lng}`,
    };
  }

  const data: NominatimReverseResponse = await response.json();

  return {
    country: data.address?.country || "Unknown",
    formattedAddress: data.display_name || `${lat}, ${lng}`,
  };
}
