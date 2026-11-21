import React from "react";

/**
 * Pixel-perfect implementation matching Figma:
 * - Circle 1 (Big Outer Arc): cx = 60.1661, cy = 222.36, r = 220.826
 * - Circle 2 (Big Inner Intersecting Arc): cx = -23.32, cy = 364.84, r = 220.826
 * - Both big circle lines are 100% visible with a vivid 3px stroke and rich gradient (never fades to invisible).
 * - Small dots (10px, white with #0F71BA border) are attached directly to each circle so they orbit precisely along the line!
 * - Smooth continuous CSS rotation animation.
 * - Symmetrical mirroring on the right side.
 */
export default function RotatingBackgroundCircles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      
      {/* ── LEFT CLUSTER (Anchored to Left Border x=0) ────────── */}
      <div 
        className="absolute left-0 top-[30px] sm:top-[50px] lg:top-[70px] w-[310px] sm:w-[350px] lg:w-[400px] h-[600px] overflow-visible"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 310 600"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Circle 1 Gradient: Always clearly visible (min opacity 0.35) */}
            <linearGradient id="visible_grad_c1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F71BA" stopOpacity="1" />
              <stop offset="50%" stopColor="#2587D3" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0F71BA" stopOpacity="0.35" />
            </linearGradient>

            {/* Circle 2 Gradient: Always clearly visible */}
            <linearGradient id="visible_grad_c2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0F71BA" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#3897E2" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0F71BA" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* ── BIG CIRCLE 1 (Outer Arc reaching x=281) with its Orbiting Dots ── */}
          <g
            className="animate-spin-circle-1"
            style={{
              transformOrigin: "60.1661px 222.36px",
            }}
          >
            {/* The Main Visible Big Circle Line */}
            <circle
              cx="60.1661"
              cy="222.36"
              r="220.826"
              stroke="url(#visible_grad_c1)"
              strokeWidth="3"
            />

            {/* Dot 1 on Big Circle 1 (at Apex x=281px, y=222px) */}
            <circle
              cx="280.99"
              cy="222.36"
              r="4.5"
              fill="#FFFFFF"
              stroke="#0F71BA"
              strokeWidth="1.6"
              className="drop-shadow-sm"
            />

            {/* Dot 2 on Big Circle 1 (at top-right arc x=216px, y=66px) */}
            <circle
              cx="216.31"
              cy="66.21"
              r="4.5"
              fill="#FFFFFF"
              stroke="#0F71BA"
              strokeWidth="1.6"
              className="drop-shadow-sm"
            />
          </g>

          {/* ── BIG CIRCLE 2 (Intersecting Arc) with its Orbiting Dots ── */}
          <g
            className="animate-spin-circle-2"
            style={{
              transformOrigin: "-23.32px 364.84px",
            }}
          >
            {/* The Main Visible Big Circle Line */}
            <circle
              cx="-23.32"
              cy="364.84"
              r="220.826"
              stroke="url(#visible_grad_c2)"
              strokeWidth="3"
            />

            {/* Dot 3 on Big Circle 2 (at top intersection x=137.57px, y=213.59px) */}
            <circle
              cx="137.57"
              cy="213.59"
              r="4.5"
              fill="#FFFFFF"
              stroke="#0F71BA"
              strokeWidth="1.6"
              className="drop-shadow-sm"
            />

            {/* Dot 4 on Big Circle 2 (at bottom x=126.36px, y=527.20px) */}
            <circle
              cx="126.36"
              cy="527.20"
              r="4.5"
              fill="#FFFFFF"
              stroke="#0F71BA"
              strokeWidth="1.6"
              className="drop-shadow-sm"
            />
          </g>
        </svg>
      </div>

      {/* ── RIGHT CLUSTER (Mirrored Symmetrical Setup) ─────────── */}
      <div 
        className="absolute right-0 top-[30px] sm:top-[50px] lg:top-[70px] w-[310px] sm:w-[350px] lg:w-[400px] h-[600px] overflow-visible"
        style={{ transform: "scaleX(-1)" }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 310 600"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="visible_grad_c1_right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F71BA" stopOpacity="1" />
              <stop offset="50%" stopColor="#2587D3" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0F71BA" stopOpacity="0.35" />
            </linearGradient>

            <linearGradient id="visible_grad_c2_right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0F71BA" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#3897E2" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0F71BA" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Mirrored Big Circle 1 */}
          <g
            className="animate-spin-circle-1"
            style={{
              transformOrigin: "60.1661px 222.36px",
            }}
          >
            <circle
              cx="60.1661"
              cy="222.36"
              r="220.826"
              stroke="url(#visible_grad_c1_right)"
              strokeWidth="3"
            />
            <circle
              cx="280.99"
              cy="222.36"
              r="4.5"
              fill="#FFFFFF"
              stroke="#0F71BA"
              strokeWidth="1.6"
              className="drop-shadow-sm"
            />
            <circle
              cx="216.31"
              cy="66.21"
              r="4.5"
              fill="#FFFFFF"
              stroke="#0F71BA"
              strokeWidth="1.6"
              className="drop-shadow-sm"
            />
          </g>

          {/* Mirrored Big Circle 2 */}
          <g
            className="animate-spin-circle-2"
            style={{
              transformOrigin: "-23.32px 364.84px",
            }}
          >
            <circle
              cx="-23.32"
              cy="364.84"
              r="220.826"
              stroke="url(#visible_grad_c2_right)"
              strokeWidth="3"
            />
            <circle
              cx="137.57"
              cy="213.59"
              r="4.5"
              fill="#FFFFFF"
              stroke="#0F71BA"
              strokeWidth="1.6"
              className="drop-shadow-sm"
            />
            <circle
              cx="126.36"
              cy="527.20"
              r="4.5"
              fill="#FFFFFF"
              stroke="#0F71BA"
              strokeWidth="1.6"
              className="drop-shadow-sm"
            />
          </g>
        </svg>
      </div>

    </div>
  );
}
