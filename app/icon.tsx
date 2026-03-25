import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top right, rgba(0,194,255,0.18), transparent 36%), linear-gradient(145deg, #ffffff, #f4f3f1)",
          borderRadius: 120,
        }}
      >
        <svg width="340" height="340" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="wandrly-icon" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#024785" />
              <stop offset="1" stopColor="#00C2FF" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="15.5" stroke="url(#wandrly-icon)" strokeWidth="2.6" />
          <path
            d="M18.5 30.5c0-6.3 3.5-11 8.9-13.4 2.9-1.3 5.5-.3 5.5 2.4 0 2.7-1.8 4.7-4.4 6.8-2.5 2-4.7 4.2-6.7 7.2"
            stroke="url(#wandrly-icon)"
            strokeWidth="2.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21.2 31.8 18 34l.8-3.8"
            stroke="#024785"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="31.8" cy="16.2" r="2.7" fill="#00C2FF" />
        </svg>
      </div>
    ),
    size
  );
}
