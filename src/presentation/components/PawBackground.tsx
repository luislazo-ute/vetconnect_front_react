// src/presentation/components/PawBackground.tsx
/**
 * Fondo decorativo de huellitas translúcidas (identidad visual de VetConnect,
 * espejo del fondo del móvil). Es un SVG inline empaquetado en el bundle —no una
 * imagen enlazada de la web— para cumplir la regla del curso. El patrón se tiñe
 * con `currentColor`, así que hereda el verde del token `text-primary`.
 */
export default function PawBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 text-primary opacity-[0.05] dark:text-white dark:opacity-[0.07]"
    >
      <svg width="100%" height="100%">
        <defs>
          {/* Una huella = almohadilla central + 4 deditos, rotada para dar naturalidad. */}
          <pattern
            id="huellitas"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(20)"
          >
            <g fill="currentColor" transform="translate(30 30)">
              <ellipse cx="0" cy="6" rx="9" ry="7" />
              <ellipse cx="-9" cy="-6" rx="3.2" ry="4.5" />
              <ellipse cx="-3" cy="-10" rx="3.2" ry="4.5" />
              <ellipse cx="3" cy="-10" rx="3.2" ry="4.5" />
              <ellipse cx="9" cy="-6" rx="3.2" ry="4.5" />
            </g>
            <g fill="currentColor" transform="translate(90 90)">
              <ellipse cx="0" cy="6" rx="9" ry="7" />
              <ellipse cx="-9" cy="-6" rx="3.2" ry="4.5" />
              <ellipse cx="-3" cy="-10" rx="3.2" ry="4.5" />
              <ellipse cx="3" cy="-10" rx="3.2" ry="4.5" />
              <ellipse cx="9" cy="-6" rx="3.2" ry="4.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#huellitas)" />
      </svg>
    </div>
  )
}
