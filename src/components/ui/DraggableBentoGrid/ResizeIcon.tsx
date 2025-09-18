"use client";

export const ResizeIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 24 24"
      style={style}
    >
      {/* <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.7,6.5C16.7,12.3,12,17,6.2,17"
      /> */}
      <path d="m4,18.52c-2.21,0-4-1.79-4-4s1.79-4,4-4c3.6,0,6.52-2.93,6.52-6.52,0-2.21,1.79-4,4-4s4,1.79,4,4c0,8.01-6.51,14.52-14.52,14.52Z" />
    </svg>
  );
};
