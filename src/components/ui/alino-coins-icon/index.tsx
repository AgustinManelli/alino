"use client";

import React, { useId } from "react";
import { motion } from "motion/react";

export type AlinoCoinVariant =
  | "auto"
  | "single"
  | "stack1"
  | "stack2"
  | "stack3"
  | "stack"
  | "bag"
  | "chest";

interface AlinoCoinIconProps {
  amount?: number;
  variant?: AlinoCoinVariant;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
}

interface CoinTier {
  key: string;
  aliases: readonly string[];
  minAmount: number;
  maxAmount: number;
  viewBox: string;
  aspectRatio: number;
  render: (id: string) => React.ReactNode;
}

const COIN_TIERS: readonly CoinTier[] = [
  {
    key: "single",
    aliases: ["single", "coin"],
    minAmount: 0,
    maxAmount: 50,
    viewBox: "0 0 109 108",
    aspectRatio: 108 / 109,
    render: (id: string) => (
      <>
        <defs>
          <linearGradient
            id={`${id}-s-l1`}
            x1="0"
            y1="0"
            x2="1"
            y2="0.002"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(96.3678,-76.5025,76.5025,96.3678,210.2558,154.2359)"
          >
            <stop offset="0" stopColor="rgb(209,63,5)" />
            <stop offset="0.29" stopColor="rgb(246,114,5)" />
            <stop offset="0.37" stopColor="rgb(246,119,5)" />
            <stop offset="0.45" stopColor="rgb(246,133,5)" />
            <stop offset="0.54" stopColor="rgb(246,156,5)" />
            <stop offset="0.56" stopColor="rgb(246,162,5)" />
            <stop offset="0.6" stopColor="rgb(246,144,5)" />
            <stop offset="0.64" stopColor="rgb(246,127,5)" />
            <stop offset="0.69" stopColor="rgb(246,117,5)" />
            <stop offset="0.76" stopColor="rgb(246,114,5)" />
            <stop offset="1" stopColor="rgb(209,63,5)" />
          </linearGradient>
          <linearGradient
            id={`${id}-s-l2`}
            x1="0"
            y1="0"
            x2="1"
            y2="-0.002"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(-78.6155,-39.3076,39.3076,-78.6155,272.4082,110.622)"
          >
            <stop offset="0" stopColor="rgb(255,175,2)" />
            <stop offset="1" stopColor="rgb(245,109,5)" />
          </linearGradient>
          <linearGradient
            id={`${id}-s-l3`}
            x1="0"
            y1="0"
            x2="1"
            y2="0.002"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(62.8714,-64.2449,64.2449,62.8714,228.3098,139.0443)"
          >
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.48" stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id={`${id}-s-l4`}
            x1="0"
            y1="0"
            x2="1"
            y2="0.002"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(28.6011,-61.8502,61.8502,28.6011,230.2496,128.5889)"
          >
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.48" stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id={`${id}-s-l5`}
            x1="0"
            y1="0"
            x2="1"
            y2="0.001"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(-63.5411,19.1607,-19.1607,-63.5411,281.3506,86.3347)"
          >
            <stop offset="0" stopColor="rgb(207,69,5)" />
            <stop offset="1" stopColor="rgb(228,89,5)" />
          </linearGradient>
        </defs>
        <g transform="matrix(1,0,0,1,-31.33151,-30.901082)">
          <g transform="matrix(1.181543,0,0,1.184357,-209.75373,-36.179609)">
            <g>
              <path
                d="M279.26,66.185C282.275,69.478 285.291,72.771 288.307,76.064C295.522,83.944 298.065,95.934 294.046,109.07C287.211,131.417 263.974,148.621 242.143,147.497C233.145,147.034 225.791,143.529 220.733,138.004L211.687,128.124C216.746,133.649 224.1,137.154 233.097,137.618C254.928,138.742 278.165,121.537 285.001,99.191C289.019,86.054 286.475,74.064 279.26,66.185Z"
                fill={`url(#${id}-s-l1)`}
                fillRule="nonzero"
              />
              <path
                d="M288.307,76.064C285.291,72.771 282.275,69.478 279.26,66.185C279.559,66.511 279.838,66.855 280.12,67.196C282.59,69.894 285.06,72.592 287.531,75.29C294.744,83.17 297.288,95.159 293.271,108.296C286.437,130.643 263.198,147.847 241.369,146.723C233.09,146.296 226.211,143.292 221.223,138.514C226.261,143.741 233.428,147.05 242.143,147.498C263.974,148.622 287.211,131.418 294.046,109.071C298.064,95.934 295.521,83.944 288.307,76.064Z"
                fill="rgb(230,136,5)"
                fillRule="nonzero"
              />
              <path
                d="M257.849,56.691C279.681,57.816 291.835,76.842 285.001,99.19C278.165,121.537 254.928,138.741 233.097,137.617C211.267,136.492 199.111,117.465 205.946,95.118C212.78,72.771 236.02,55.567 257.849,56.691Z"
                fill={`url(#${id}-s-l2)`}
                fillRule="nonzero"
              />
              <path
                d="M285.477,99.718C289.544,86.417 286.884,74.295 279.461,66.422C286.516,74.303 288.981,86.181 285.001,99.191C278.165,121.538 254.928,138.742 233.097,137.618C224.24,137.161 216.983,133.754 211.933,128.379C212.036,128.496 212.138,128.616 212.243,128.732L212.449,128.957C217.497,134.305 224.744,137.691 233.573,138.146C255.403,139.27 278.641,122.066 285.477,99.718Z"
                fill={`url(#${id}-s-l3)`}
                fillRule="nonzero"
              />
              <path
                d="M253.679,68.083C269.36,68.891 278.098,82.557 273.185,98.617C268.275,114.67 251.577,127.033 235.896,126.225C220.206,125.417 211.476,111.745 216.387,95.692C221.301,79.632 237.988,67.276 253.679,68.083Z"
                fill={`url(#${id}-s-l4)`}
                fillRule="nonzero"
              />
              <path
                d="M254.364,68.083C270.047,68.891 278.784,82.557 273.873,98.617C268.962,114.67 252.263,127.033 236.582,126.225C220.893,125.417 212.163,111.745 217.073,95.692C221.987,79.632 238.676,67.276 254.364,68.083Z"
                fill={`url(#${id}-s-l5)`}
                fillRule="nonzero"
              />
              <path
                d="M220.454,97.344C225.368,81.284 242.056,68.928 257.747,69.736C260.508,69.879 263.047,70.427 265.342,71.309C262.266,69.447 258.569,68.3 254.364,68.083C238.676,67.276 221.987,79.632 217.073,95.692C213.029,108.92 218.247,120.523 228.985,124.652C220.582,119.566 216.86,109.097 220.454,97.344Z"
                fill="rgb(207,69,5)"
                fillRule="nonzero"
              />
            </g>
          </g>
        </g>
      </>
    ),
  },
  {
    key: "stack1",
    aliases: ["stack1", "stack"],
    minAmount: 51,
    maxAmount: 199,
    viewBox: "0 0 163 86",
    aspectRatio: 86 / 163,
    render: (id: string) => {
      const edge = `${id}-st1-edge`;
      const face = `${id}-st1-face`;
      const shine = `${id}-st1-shine`;
      const in1 = `${id}-st1-in1`;
      const in2 = `${id}-st1-in2`;
      const upEdge = `${id}-st1-up-edge`;
      const upFace = `${id}-st1-up-face`;
      const upShine = `${id}-st1-up-shine`;
      const upIn1 = `${id}-st1-up-in1`;
      const upIn2 = `${id}-st1-up-in2`;
      const isoBase = `${id}-st1-iso-base`;
      const isoTop = `${id}-st1-iso-top`;

      return (
        <>
          <defs>
            <linearGradient
              id={edge}
              x1="0"
              y1="0"
              x2="1"
              y2="0.594"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(96.3678,-76.5025,76.5025,96.3678,210.2558,154.2359)"
            >
              <stop offset="0" stopColor="rgb(209,63,5)" />
              <stop offset="0.29" stopColor="rgb(246,114,5)" />
              <stop offset="0.37" stopColor="rgb(246,119,5)" />
              <stop offset="0.45" stopColor="rgb(246,133,5)" />
              <stop offset="0.54" stopColor="rgb(246,156,5)" />
              <stop offset="0.56" stopColor="rgb(246,162,5)" />
              <stop offset="0.6" stopColor="rgb(246,144,5)" />
              <stop offset="0.64" stopColor="rgb(246,127,5)" />
              <stop offset="0.69" stopColor="rgb(246,117,5)" />
              <stop offset="0.76" stopColor="rgb(246,114,5)" />
              <stop offset="1" stopColor="rgb(209,63,5)" />
            </linearGradient>
            <linearGradient
              id={face}
              x1="0"
              y1="0"
              x2="1"
              y2="0.315"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(-78.6155,-39.3076,39.3076,-78.6155,272.4082,110.622)"
            >
              <stop offset="0" stopColor="rgb(255,175,2)" />
              <stop offset="1" stopColor="rgb(245,109,5)" />
            </linearGradient>
            <linearGradient
              id={shine}
              x1="0"
              y1="0"
              x2="1"
              y2="-0.274"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(62.8714,-64.2449,64.2449,62.8714,228.3098,139.0443)"
            >
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="0.48" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id={in1}
              x1="0"
              y1="0"
              x2="1"
              y2="-1.25"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(28.6011,-61.8502,61.8502,28.6011,230.2496,128.5889)"
            >
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="0.48" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id={in2}
              x1="0"
              y1="0"
              x2="1"
              y2="1.182"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(-63.5411,19.1607,-19.1607,-63.5411,281.3506,86.3347)"
            >
              <stop offset="0" stopColor="rgb(207,69,5)" />
              <stop offset="1" stopColor="rgb(228,89,5)" />
            </linearGradient>
            <linearGradient
              id={upEdge}
              x1="0"
              y1="0"
              x2="1"
              y2="0.002"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(96.3678,-76.5025,76.5025,96.3678,210.2558,154.2359)"
            >
              <stop offset="0" stopColor="rgb(209,63,5)" />
              <stop offset="0.29" stopColor="rgb(246,114,5)" />
              <stop offset="0.37" stopColor="rgb(246,119,5)" />
              <stop offset="0.45" stopColor="rgb(246,133,5)" />
              <stop offset="0.54" stopColor="rgb(246,156,5)" />
              <stop offset="0.56" stopColor="rgb(246,162,5)" />
              <stop offset="0.6" stopColor="rgb(246,144,5)" />
              <stop offset="0.64" stopColor="rgb(246,127,5)" />
              <stop offset="0.69" stopColor="rgb(246,117,5)" />
              <stop offset="0.76" stopColor="rgb(246,114,5)" />
              <stop offset="1" stopColor="rgb(209,63,5)" />
            </linearGradient>
            <linearGradient
              id={upFace}
              x1="0"
              y1="0"
              x2="1"
              y2="-0.002"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(-78.6155,-39.3076,39.3076,-78.6155,272.4082,110.622)"
            >
              <stop offset="0" stopColor="rgb(255,175,2)" />
              <stop offset="1" stopColor="rgb(245,109,5)" />
            </linearGradient>
            <linearGradient
              id={upShine}
              x1="0"
              y1="0"
              x2="1"
              y2="0.002"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(62.8714,-64.2449,64.2449,62.8714,228.3098,139.0443)"
            >
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="0.48" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id={upIn1}
              x1="0"
              y1="0"
              x2="1"
              y2="0.002"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(28.6011,-61.8502,61.8502,28.6011,230.2496,128.5889)"
            >
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="0.48" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id={upIn2}
              x1="0"
              y1="0"
              x2="1"
              y2="0.001"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(-63.5411,19.1607,-19.1607,-63.5411,281.3506,86.3347)"
            >
              <stop offset="0" stopColor="rgb(207,69,5)" />
              <stop offset="1" stopColor="rgb(228,89,5)" />
            </linearGradient>

            <g id={isoBase}>
              <g transform="matrix(1,0,0,1,16.628574,17.578273)">
                <path
                  d="M262.631,48.607C265.646,51.9 290.48,78.257 293.496,81.55C300.711,89.43 303.254,101.42 299.235,114.556C292.4,136.903 269.163,154.107 247.332,152.983C238.334,152.52 230.98,149.015 225.922,143.49L195.058,110.546C200.117,116.071 207.471,119.576 216.468,120.04C238.299,121.164 261.536,103.959 268.372,81.613C272.39,68.476 269.846,56.486 262.631,48.607Z"
                  fill={`url(#${edge})`}
                  fillRule="nonzero"
                />
              </g>
              <g transform="matrix(1,0,-0,1,22.394494,23.673498)">
                <path
                  d="M288.307,76.064C285.291,72.771 285.06,72.592 287.531,75.29C294.744,83.17 296.435,94.258 292.418,107.395C285.584,129.742 263.198,147.847 241.369,146.723C233.09,146.296 226.211,143.292 221.223,138.514C226.261,143.741 233.428,147.05 242.143,147.498C263.974,148.622 287.211,131.418 294.046,109.071C298.064,95.934 295.521,83.944 288.307,76.064Z"
                  fill="rgb(230,136,5)"
                  fillRule="nonzero"
                />
              </g>
              <path
                d="M257.849,56.691C279.681,57.816 291.835,76.842 285.001,99.19C278.165,121.537 254.928,138.741 233.097,137.617C211.267,136.492 199.111,117.465 205.946,95.118C212.78,72.771 236.02,55.567 257.849,56.691Z"
                fill={`url(#${face})`}
                fillRule="nonzero"
              />
              <path
                d="M286.33,100.619C290.397,87.318 286.884,74.295 279.461,66.422C286.516,74.303 288.981,86.181 285.001,99.191C278.165,121.538 254.928,138.742 233.097,137.618C224.24,137.161 216.983,133.754 211.933,128.379C212.036,128.496 212.138,128.616 212.243,128.732L212.449,128.957C217.497,134.305 225.597,138.592 234.426,139.047C256.256,140.171 279.494,122.967 286.33,100.619Z"
                fill={`url(#${shine})`}
                fillRule="nonzero"
              />
            </g>

            <g id={isoTop}>
              <path
                d="M253.679,68.083C269.36,68.891 278.098,82.557 273.185,98.617C268.275,114.67 251.577,127.033 235.896,126.225C220.206,125.417 211.476,111.745 216.387,95.692C221.301,79.632 237.988,67.276 253.679,68.083Z"
                fill={`url(#${in1})`}
                fillRule="nonzero"
              />
              <path
                d="M254.364,68.083C270.047,68.891 278.784,82.557 273.873,98.617C268.962,114.67 252.263,127.033 236.582,126.225C220.893,125.417 212.163,111.745 217.073,95.692C221.987,79.632 238.676,67.276 254.364,68.083Z"
                fill={`url(#${in2})`}
                fillRule="nonzero"
              />
              <path
                d="M231.828,85.784C237.266,80.552 251.82,67.363 267.362,72.816C260.449,66.897 241.638,64.146 226.406,80.088C214.052,93.019 212.257,111.676 222.026,120.126C214.485,104.002 226.774,90.645 231.828,85.784Z"
                fill="rgb(207,69,5)"
                fillRule="nonzero"
              />
            </g>
          </defs>

          <g transform="matrix(1,0,0,1,-169.297278,-50.901082)">
            <g transform="matrix(0.736656,0,0,0.736656,89.519409,-52.157928)">
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,100.986988,96.329813)">
                <use href={`#${isoBase}`} />
              </g>
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,111.986988,71.329813)">
                <use href={`#${isoBase}`} />
              </g>
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,98.986988,47.329813)">
                <use href={`#${isoBase}`} />
                <use href={`#${isoTop}`} />
              </g>
              <g transform="matrix(1.269331,0,0,1.272355,-150.700649,67.836281)">
                <g>
                  <path
                    d="M279.26,66.185C282.275,69.478 285.291,72.771 288.307,76.064C295.522,83.944 298.065,95.934 294.046,109.07C287.211,131.417 263.974,148.621 242.143,147.497C233.145,147.034 225.791,143.529 220.733,138.004L211.687,128.124C216.746,133.649 224.1,137.154 233.097,137.618C254.928,138.742 278.165,121.537 285.001,99.191C289.019,86.054 286.475,74.064 279.26,66.185Z"
                    fill={`url(#${upEdge})`}
                    fillRule="nonzero"
                  />
                  <path
                    d="M288.307,76.064C285.291,72.771 282.275,69.478 279.26,66.185C279.559,66.511 279.838,66.855 280.12,67.196C282.59,69.894 285.06,72.592 287.531,75.29C294.744,83.17 297.288,95.159 293.271,108.296C286.437,130.643 263.198,147.847 241.369,146.723C233.09,146.296 226.211,143.292 221.223,138.514C226.261,143.741 233.428,147.05 242.143,147.498C263.974,148.622 287.211,131.418 294.046,109.071C298.064,95.934 295.521,83.944 288.307,76.064Z"
                    fill="rgb(230,136,5)"
                    fillRule="nonzero"
                  />
                  <path
                    d="M257.849,56.691C279.681,57.816 291.835,76.842 285.001,99.19C278.165,121.537 254.928,138.741 233.097,137.617C211.267,136.492 199.111,117.465 205.946,95.118C212.78,72.771 236.02,55.567 257.849,56.691Z"
                    fill={`url(#${upFace})`}
                    fillRule="nonzero"
                  />
                  <path
                    d="M285.477,99.718C289.544,86.417 286.884,74.295 279.461,66.422C286.516,74.303 288.981,86.181 285.001,99.191C278.165,121.538 254.928,138.742 233.097,137.618C224.24,137.161 216.983,133.754 211.933,128.379C212.036,128.496 212.138,128.616 212.243,128.732L212.449,128.957C217.497,134.305 224.744,137.691 233.573,138.146C255.403,139.27 278.641,122.066 285.477,99.718Z"
                    fill={`url(#${upShine})`}
                    fillRule="nonzero"
                  />
                  <path
                    d="M253.679,68.083C269.36,68.891 278.098,82.557 273.185,98.617C268.275,114.67 251.577,127.033 235.896,126.225C220.206,125.417 211.476,111.745 216.387,95.692C221.301,79.632 237.988,67.276 253.679,68.083Z"
                    fill={`url(#${upIn1})`}
                    fillRule="nonzero"
                  />
                  <path
                    d="M254.364,68.083C270.047,68.891 278.784,82.557 273.873,98.617C268.962,114.67 252.263,127.033 236.582,126.225C220.893,125.417 212.163,111.745 217.073,95.692C221.987,79.632 238.676,67.276 254.364,68.083Z"
                    fill={`url(#${upIn2})`}
                    fillRule="nonzero"
                  />
                  <path
                    d="M220.454,97.344C225.368,81.284 242.056,68.928 257.747,69.736C260.508,69.879 263.047,70.427 265.342,71.309C262.266,69.447 258.569,68.3 254.364,68.083C238.676,67.276 221.987,79.632 217.073,95.692C213.029,108.92 218.247,120.523 228.985,124.652C220.582,119.566 216.86,109.097 220.454,97.344Z"
                    fill="rgb(207,69,5)"
                    fillRule="nonzero"
                  />
                </g>
              </g>
            </g>
          </g>
        </>
      );
    },
  },
  {
    key: "stack2",
    aliases: ["stack2", "stack3", "bag", "chest"],
    minAmount: 200,
    maxAmount: Infinity,
    viewBox: "0 0 143 96",
    aspectRatio: 96 / 143,
    render: (id: string) => {
      const edge = `${id}-st2-edge`;
      const face = `${id}-st2-face`;
      const shine = `${id}-st2-shine`;
      const in1 = `${id}-st2-in1`;
      const in2 = `${id}-st2-in2`;
      const isoBase = `${id}-st2-iso-base`;
      const isoTop = `${id}-st2-iso-top`;

      return (
        <>
          <defs>
            <linearGradient
              id={edge}
              x1="0"
              y1="0"
              x2="1"
              y2="0.594"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(96.3678,-76.5025,76.5025,96.3678,210.2558,154.2359)"
            >
              <stop offset="0" stopColor="rgb(209,63,5)" />
              <stop offset="0.29" stopColor="rgb(246,114,5)" />
              <stop offset="0.37" stopColor="rgb(246,119,5)" />
              <stop offset="0.45" stopColor="rgb(246,133,5)" />
              <stop offset="0.54" stopColor="rgb(246,156,5)" />
              <stop offset="0.56" stopColor="rgb(246,162,5)" />
              <stop offset="0.6" stopColor="rgb(246,144,5)" />
              <stop offset="0.64" stopColor="rgb(246,127,5)" />
              <stop offset="0.69" stopColor="rgb(246,117,5)" />
              <stop offset="0.76" stopColor="rgb(246,114,5)" />
              <stop offset="1" stopColor="rgb(209,63,5)" />
            </linearGradient>
            <linearGradient
              id={face}
              x1="0"
              y1="0"
              x2="1"
              y2="0.315"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(-78.6155,-39.3076,39.3076,-78.6155,272.4082,110.622)"
            >
              <stop offset="0" stopColor="rgb(255,175,2)" />
              <stop offset="1" stopColor="rgb(245,109,5)" />
            </linearGradient>
            <linearGradient
              id={shine}
              x1="0"
              y1="0"
              x2="1"
              y2="-0.274"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(62.8714,-64.2449,64.2449,62.8714,228.3098,139.0443)"
            >
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="0.48" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id={in1}
              x1="0"
              y1="0"
              x2="1"
              y2="-1.25"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(28.6011,-61.8502,61.8502,28.6011,230.2496,128.5889)"
            >
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="0.48" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id={in2}
              x1="0"
              y1="0"
              x2="1"
              y2="1.182"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(-63.5411,19.1607,-19.1607,-63.5411,281.3506,86.3347)"
            >
              <stop offset="0" stopColor="rgb(207,69,5)" />
              <stop offset="1" stopColor="rgb(228,89,5)" />
            </linearGradient>

            <g id={isoBase}>
              <g transform="matrix(1,0,0,1,16.628574,17.578273)">
                <path
                  d="M262.631,48.607C265.646,51.9 290.48,78.257 293.496,81.55C300.711,89.43 303.254,101.42 299.235,114.556C292.4,136.903 269.163,154.107 247.332,152.983C238.334,152.52 230.98,149.015 225.922,143.49L195.058,110.546C200.117,116.071 207.471,119.576 216.468,120.04C238.299,121.164 261.536,103.959 268.372,81.613C272.39,68.476 269.846,56.486 262.631,48.607Z"
                  fill={`url(#${edge})`}
                  fillRule="nonzero"
                />
              </g>
              <g transform="matrix(1,0,-0,1,22.394494,23.673498)">
                <path
                  d="M288.307,76.064C285.291,72.771 285.06,72.592 287.531,75.29C294.744,83.17 296.435,94.258 292.418,107.395C285.584,129.742 263.198,147.847 241.369,146.723C233.09,146.296 226.211,143.292 221.223,138.514C226.261,143.741 233.428,147.05 242.143,147.498C263.974,148.622 287.211,131.418 294.046,109.071C298.064,95.934 295.521,83.944 288.307,76.064Z"
                  fill="rgb(230,136,5)"
                  fillRule="nonzero"
                />
              </g>
              <path
                d="M257.849,56.691C279.681,57.816 291.835,76.842 285.001,99.19C278.165,121.537 254.928,138.741 233.097,137.617C211.267,136.492 199.111,117.465 205.946,95.118C212.78,72.771 236.02,55.567 257.849,56.691Z"
                fill={`url(#${face})`}
                fillRule="nonzero"
              />
              <path
                d="M286.33,100.619C290.397,87.318 286.884,74.295 279.461,66.422C286.516,74.303 288.981,86.181 285.001,99.191C278.165,121.538 254.928,138.742 233.097,137.618C224.24,137.161 216.983,133.754 211.933,128.379C212.036,128.496 212.138,128.616 212.243,128.732L212.449,128.957C217.497,134.305 225.597,138.592 234.426,139.047C256.256,140.171 279.494,122.967 286.33,100.619Z"
                fill={`url(#${shine})`}
                fillRule="nonzero"
              />
            </g>

            <g id={isoTop}>
              <path
                d="M253.679,68.083C269.36,68.891 278.098,82.557 273.185,98.617C268.275,114.67 251.577,127.033 235.896,126.225C220.206,125.417 211.476,111.745 216.387,95.692C221.301,79.632 237.988,67.276 253.679,68.083Z"
                fill={`url(#${in1})`}
                fillRule="nonzero"
              />
              <path
                d="M254.364,68.083C270.047,68.891 278.784,82.557 273.873,98.617C268.962,114.67 252.263,127.033 236.582,126.225C220.893,125.417 212.163,111.745 217.073,95.692C221.987,79.632 238.676,67.276 254.364,68.083Z"
                fill={`url(#${in2})`}
                fillRule="nonzero"
              />
              <path
                d="M231.828,85.784C237.266,80.552 251.82,67.363 267.362,72.816C260.449,66.897 241.638,64.146 226.406,80.088C214.052,93.019 212.257,111.676 222.026,120.126C214.485,104.002 226.774,90.645 231.828,85.784Z"
                fill="rgb(207,69,5)"
                fillRule="nonzero"
              />
            </g>
          </defs>

          <g transform="matrix(1,0,0,1,-352.124529,-45.873055)">
            <g transform="matrix(0.558853,0,0,0.558853,298.963907,-64.032323)">
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,103.986988,147.119192)">
                <use href={`#${isoBase}`} />
              </g>
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,95.986988,123.119192)">
                <use href={`#${isoBase}`} />
              </g>
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,106.986988,99.119192)">
                <use href={`#${isoBase}`} />
                <use href={`#${isoTop}`} />
              </g>
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,6.986988,197.329813)">
                <use href={`#${isoBase}`} />
              </g>
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,17.986988,172.329813)">
                <use href={`#${isoBase}`} />
              </g>
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,4.986988,148.329813)">
                <use href={`#${isoBase}`} />
              </g>
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,15.986988,123.329813)">
                <use href={`#${isoBase}`} />
                <use href={`#${isoTop}`} />
              </g>
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,127.986988,213.329813)">
                <use href={`#${isoBase}`} />
              </g>
              <g transform="matrix(0.999531,0.328488,-0.945529,0.348904,133.408229,187.908572)">
                <use href={`#${isoBase}`} />
                <use href={`#${isoTop}`} />
              </g>
            </g>
          </g>
        </>
      );
    },
  },
];

export const AlinoCoinIcon: React.FC<AlinoCoinIconProps> = ({
  amount = 1,
  variant = "auto",
  size = 18,
  className,
  style,
  animated = false,
}) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const activeTier =
    variant !== "auto"
      ? COIN_TIERS.find(
          (tier) =>
            tier.key === variant ||
            tier.aliases.includes(variant)
        ) ?? COIN_TIERS[0]
      : COIN_TIERS.find(
          (tier) => amount >= tier.minAmount && amount <= tier.maxAmount
        ) ?? COIN_TIERS[COIN_TIERS.length - 1];

  const svgElement = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={activeTier.viewBox}
      width={size}
      height={size * activeTier.aspectRatio}
      className={!animated ? className : undefined}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        fillRule: "evenodd",
        clipRule: "evenodd",
        strokeLinejoin: "round",
        strokeMiterlimit: 2,
        ...(!animated ? style : {}),
      }}
    >
      {activeTier.render(id)}
    </svg>
  );

  if (animated) {
    return (
      <motion.span
        className={className}
        style={{
          display: "inline-flex",
          verticalAlign: "middle",
          flexShrink: 0,
          ...style,
        }}
        whileHover={{ scale: 1.08, rotate: 4 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {svgElement}
      </motion.span>
    );
  }

  return svgElement;
};