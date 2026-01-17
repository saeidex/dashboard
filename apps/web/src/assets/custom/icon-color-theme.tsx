import type { SVGProps } from "react";

export function IconColorTheme({
  color = "purple",
  ...props
}: SVGProps<SVGSVGElement> & { color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" {...props}>
      <rect width="200" height="120" rx="8" className="fill-sidebar" />
      <rect x="12" y="12" width="40" height="96" rx="6" className="fill-card" />
      <rect
        x="60"
        y="12"
        width="128"
        height="96"
        rx="6"
        className="fill-card"
      />

      {/* Sidebar items */}
      <rect
        x="18"
        y="20"
        width="28"
        height="8"
        rx="2"
        style={{ fill: color }}
        opacity="0.8"
      />
      <rect x="18" y="34" width="28" height="8" rx="2" className="fill-muted" />
      <rect x="18" y="48" width="28" height="8" rx="2" className="fill-muted" />

      {/* Content area */}
      <rect
        x="68"
        y="20"
        width="48"
        height="10"
        rx="2"
        style={{ fill: color }}
      />
      <rect
        x="68"
        y="36"
        width="112"
        height="6"
        rx="2"
        className="fill-muted"
      />
      <rect
        x="68"
        y="46"
        width="112"
        height="6"
        rx="2"
        className="fill-muted"
      />
      <rect
        x="68"
        y="58"
        width="52"
        height="20"
        rx="4"
        style={{ fill: color }}
        opacity="0.2"
      />
      <rect
        x="128"
        y="58"
        width="52"
        height="20"
        rx="4"
        className="fill-muted"
      />
    </svg>
  );
}

export function IconColorCatppuccin(props: SVGProps<SVGSVGElement>) {
  return <IconColorTheme color="oklch(0.5547 0.2503 297.0156)" {...props} />;
}

export function IconColorBubblegum(props: SVGProps<SVGSVGElement>) {
  return <IconColorTheme color="oklch(0.6209 0.1801 348.1385)" {...props} />;
}

export function IconColorCaffeine(props: SVGProps<SVGSVGElement>) {
  return <IconColorTheme color="oklch(0.4341 0.0392 41.9938)" {...props} />;
}

export function IconColorCosmicNight(props: SVGProps<SVGSVGElement>) {
  return <IconColorTheme color="oklch(0.5417 0.179 288.0332)" {...props} />;
}

export function IconColorVioletBloom(props: SVGProps<SVGSVGElement>) {
  return <IconColorTheme color="oklch(0.5393 0.2713 286.7462)" {...props} />;
}

export function IconColorElegantLuxury(props: SVGProps<SVGSVGElement>) {
  return <IconColorTheme color="oklch(0.465 0.147 24.9381)" {...props} />;
}

export function IconColorMono(props: SVGProps<SVGSVGElement>) {
  return <IconColorTheme color="oklch(0.5555 0 0)" {...props} />;
}

export function IconColorCyberpunk(props: SVGProps<SVGSVGElement>) {
  return <IconColorTheme color="oklch(0.5555 0 0)" {...props} />;
}

export function IconColorPastelDreams(props: SVGProps<SVGSVGElement>) {
  return <IconColorTheme color="oklch(0.7090 0.1592 293.5412)" {...props} />;
}
