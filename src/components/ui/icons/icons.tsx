import styles from "./icons.module.css";

export const AlinoLogo = ({
  style,
  decoFill,
}: {
  style: React.CSSProperties;
  decoFill?: string;
}) => {
  return (
    <svg
      style={{ fill: style.fill ? style.fill : "#1c1c1c", ...style }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 723.83 308.33"
      className={styles.alinoLogoIcon}
    >
      <g>
        <path
          className={styles.alinoLogoIconDeco}
          style={{ fill: `${decoFill}` }}
          d="M195.99,307.74l19.22-19.22c.78-.78,2.05-.78,2.83,0l19.22,19.22c1.26,1.26,3.41.37,3.41-1.41v-38.26c0-2.76-2.24-5-5-5h-38.09c-2.76,0-5,2.24-5,5v38.26c0,1.78,2.15,2.67,3.41,1.41Z"
        />
        <g>
          <path d="M57.57,247.66c-11.06,0-20.92-1.94-29.57-5.81-8.65-3.88-15.48-9.63-20.49-17.27-5.01-7.64-7.51-17.18-7.51-28.62,0-9.63,1.77-17.72,5.31-24.27,3.54-6.55,8.35-11.81,14.45-15.8,6.1-3.99,13.04-7,20.83-9.03,7.79-2.03,15.97-3.46,24.55-4.29,10.08-1.05,18.21-2.05,24.38-2.99,6.17-.94,10.65-2.35,13.43-4.23,2.78-1.88,4.18-4.67,4.18-8.35v-.68c0-7.15-2.24-12.68-6.72-16.59-4.48-3.91-10.82-5.87-19.02-5.87-8.66,0-15.54,1.9-20.66,5.7-4.08,3.03-7.07,6.68-8.95,10.93-.87,1.97-2.86,3.21-5.01,3.04l-34.74-2.82c-3.18-.26-5.33-3.39-4.39-6.44,2.5-8.06,6.42-15.2,11.77-21.42,6.62-7.71,15.18-13.66,25.68-17.84,10.5-4.18,22.67-6.26,36.52-6.26,9.63,0,18.87,1.13,27.71,3.39,8.84,2.26,16.71,5.76,23.59,10.5s12.32,10.82,16.31,18.23c3.99,7.41,5.98,16.27,5.98,26.58v111.95c0,2.76-2.24,5-5,5h-35.6c-2.76,0-5-2.24-5-5v-19.04h-1.35c-2.79,5.42-6.51,10.18-11.18,14.28-4.67,4.1-10.27,7.3-16.82,9.59-6.55,2.29-14.11,3.44-22.69,3.44ZM71.34,214.48c7.07,0,13.32-1.41,18.74-4.23,5.42-2.82,9.67-6.64,12.76-11.46,3.08-4.82,4.63-10.27,4.63-16.37v-11.19c0-3.2-3.09-5.49-6.15-4.55h0c-2.6.79-5.51,1.51-8.75,2.14-3.24.64-6.47,1.21-9.71,1.69-3.24.49-6.17.92-8.8,1.3-5.64.83-10.57,2.15-14.79,3.95-4.22,1.81-7.49,4.23-9.82,7.28-2.33,3.05-3.5,6.83-3.5,11.34,0,6.55,2.39,11.53,7.17,14.96,4.78,3.43,10.85,5.14,18.23,5.14Z" />
          <path d="M240.66,18.21v221.18c0,2.76-2.24,5-5,5h-38.09c-2.76,0-5-2.24-5-5V18.21c0-2.76,2.24-5,5-5h38.09c2.76,0,5,2.24,5,5Z" />
          <path d="M303.19,48.65c-7.15,0-13.26-2.39-18.34-7.17-5.08-4.78-7.62-10.52-7.62-17.21s2.54-12.32,7.62-17.1c5.08-4.78,11.19-7.17,18.34-7.17s13.26,2.39,18.34,7.17c5.08,4.78,7.62,10.48,7.62,17.1s-2.54,12.44-7.62,17.21c-5.08,4.78-11.19,7.17-18.34,7.17ZM279.04,239.39V76c0-2.76,2.24-5,5-5h38.09c2.76,0,5,2.24,5,5v163.39c0,2.76-2.24,5-5,5h-38.09c-2.76,0-5-2.24-5-5Z" />
          <path d="M413.59,144.15v95.24c0,2.76-2.24,5-5,5h-38.09c-2.76,0-5-2.24-5-5V76c0-2.76,2.24-5,5-5h35.83c2.76,0,5,2.24,5,5v25.59h2.03c3.84-10.08,10.27-18.08,19.3-23.99,9.03-5.91,19.98-8.86,32.85-8.86,12.04,0,22.54,2.63,31.49,7.9,8.96,5.27,15.92,12.78,20.88,22.52,4.97,9.75,7.45,21.35,7.45,34.82v105.4c0,2.76-2.24,5-5,5h-38.09c-2.76,0-5-2.24-5-5v-96.82c.07-10.61-2.63-18.91-8.13-24.89-5.49-5.98-13.06-8.97-22.69-8.97-6.47,0-12.17,1.39-17.1,4.18-4.93,2.79-8.77,6.83-11.51,12.13s-4.16,11.68-4.23,19.13Z" />
          <path d="M638.49,247.78c-17.54,0-32.68-3.74-45.44-11.23-12.76-7.49-22.6-17.95-29.52-31.38-6.93-13.43-10.38-29.03-10.38-46.79s3.46-33.58,10.38-47.01c6.92-13.43,16.76-23.89,29.52-31.38,12.76-7.49,27.9-11.23,45.44-11.23s32.68,3.74,45.44,11.23c12.75,7.49,22.59,17.95,29.52,31.38,6.92,13.43,10.38,29.11,10.38,47.01s-3.46,33.36-10.38,46.79c-6.92,13.43-16.76,23.89-29.52,31.38-12.76,7.49-27.9,11.23-45.44,11.23ZM638.72,210.52c7.97,0,14.63-2.28,19.98-6.83,5.34-4.55,9.39-10.78,12.13-18.68,2.75-7.9,4.12-16.89,4.12-26.98s-1.38-19.08-4.12-26.98c-2.75-7.9-6.79-14.15-12.13-18.74-5.34-4.59-12-6.89-19.98-6.89s-14.81,2.3-20.26,6.89c-5.46,4.59-9.56,10.84-12.3,18.74-2.75,7.9-4.12,16.9-4.12,26.98s1.37,19.08,4.12,26.98c2.75,7.9,6.85,14.13,12.3,18.68,5.46,4.55,12.21,6.83,20.26,6.83Z" />
        </g>
      </g>
    </svg>
  );
};

export const ArrowLeft = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path d="M4 12L20 12" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M8.99996 17C8.99996 17 4.00001 13.3176 4 12C3.99999 10.6824 9 7 9 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const UserIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" />
    </svg>
  );
};

export const HomeIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path d="M8.99944 22L8.74881 18.4911C8.61406 16.6046 10.1082 15 11.9994 15C13.8907 15 15.3848 16.6046 15.2501 18.4911L14.9994 22" />
      <path
        d="M2.35151 13.2135C1.99849 10.9162 1.82198 9.76763 2.25629 8.74938C2.69059 7.73112 3.65415 7.03443 5.58126 5.64106L7.02111 4.6C9.41841 2.86667 10.6171 2 12.0001 2C13.3832 2 14.5818 2.86667 16.9791 4.6L18.419 5.64106C20.3461 7.03443 21.3097 7.73112 21.744 8.74938C22.1783 9.76763 22.0018 10.9162 21.6487 13.2135L21.3477 15.1724C20.8473 18.4289 20.597 20.0572 19.4291 21.0286C18.2612 22 16.5538 22 13.1389 22H10.8613C7.44646 22 5.73903 22 4.57112 21.0286C3.40321 20.0572 3.15299 18.4289 2.65255 15.1724L2.35151 13.2135Z"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const HomeIcon2 = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      style={style}
    >
      <path d="M14.48,8.81l-.2,1.32c-.34,2.19-.5,3.28-1.29,3.94-.79.65-1.93.65-4.22.65h-1.53c-2.29,0-3.44,0-4.22-.65-.79-.65-.95-1.75-1.29-3.94l-.2-1.32c-.24-1.54-.36-2.31-.06-3,.29-.69.93-1.16,2.23-2.09l.97-.7c1.61-1.16,2.42-1.75,3.34-1.75s1.73.58,3.34,1.75l.97.7c1.3.93,1.94,1.4,2.23,2.09.3.69.17,1.46-.06,3Z" />
    </svg>
  );
};

export const LoadingIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M12 3V6"
        strokeLinecap="round"
        className={`${styles.path1} ${styles.path}`}
      />
      <path
        d="M18.3635 5.63672L16.2422 7.75804"
        strokeLinecap="round"
        className={`${styles.path2} ${styles.path}`}
      />
      <path
        d="M21 12L18 12"
        strokeLinecap="round"
        className={`${styles.path3} ${styles.path}`}
      />
      <path
        d="M18.3635 18.3635L16.2422 16.2422"
        strokeLinecap="round"
        className={`${styles.path4} ${styles.path}`}
      />
      <path
        d="M12 18V21"
        strokeLinecap="round"
        className={`${styles.path5} ${styles.path}`}
      />
      <path
        d="M7.75706 16.2422L5.63574 18.3635"
        strokeLinecap="round"
        className={`${styles.path6} ${styles.path}`}
      />
      <path
        d="M6 12L3 12"
        strokeLinecap="round"
        className={`${styles.path7} ${styles.path}`}
      />
      <path
        d="M7.75706 7.75804L5.63574 5.63672"
        strokeLinecap="round"
        className={`${styles.path8} ${styles.path}`}
      />
    </svg>
  );
};

export const GithubIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 20 20"
      style={style}
    >
      <path d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" />
    </svg>
  );
};

export const GoogleIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      style={style}
    >
      <g>
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        ></path>
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        ></path>
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        ></path>
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        ></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
      </g>
    </svg>
  );
};

export const AppleIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 48 48"
      style={style}
    >
      <g>
        <path d="M42,16.5c-.3.2-5.1,2.9-5.1,9s6.2,9.5,6.4,9.6c0,.2-1,3.4-3.3,6.7-2,2.9-4.1,5.8-7.4,5.8s-4-1.9-7.8-1.9-4.9,1.9-7.9,1.9-5-2.7-7.4-6c-2.7-3.9-4.9-9.9-4.9-15.7,0-9.2,6-14.1,11.9-14.1s5.7,2.1,7.7,2.1,4.8-2.2,8.4-2.2,6.2.1,9.4,4.7h0ZM31,7.9c1.5-1.7,2.5-4.2,2.5-6.6s0-.7,0-1c-2.4,0-5.2,1.6-7,3.6-1.3,1.5-2.6,4-2.6,6.4s0,.7,0,.9c.2,0,.4,0,.6,0,2.2,0,4.9-1.4,6.4-3.4h0Z" />
      </g>
    </svg>
  );
};

export const DeleteIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      className={styles.deleteIcon}
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
    >
      <g transform="translate(12,3.75)" className={styles.deleteIconLid}>
        <g transform="rotate(0)" className={styles.deleteIconLidChild}>
          <path
            d="M3,5.5h18m-4.9,0l-.7-1.4c-.5-.9-.7-1.4-1.1-1.7-.1-.1-.2-.1-.3-.2-.4-.2-.9-.2-2-.2s-1.6,0-2,.2c-.1.1-.2.1-.3.2-.4.3-.6.8-1,1.8L8.1,5.5"
            transform="translate(-12,-3.75)"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </g>
      <g transform="translate(14.5,13.75)" className={styles.deleteIconCan}>
        <g transform="rotate(0)" className={styles.deleteIconCanChild}>
          <g transform="translate(-14.5,-13.5)">
            <path d="M14.5,16.5v-6" fill="none" strokeLinecap="round" />
            <path
              d="M18.8,5.5c.4,0,.7.3.7.7l-.6,9.3c-.2,2.6-.2,3.8-.9,4.8-.3.5-.7.8-1.2,1.1-1,.6-2.2.6-4.8.6s-3.9,0-4.8-.6c-.5-.3-.9-.7-1.2-1.1-.6-.9-.7-2.2-.9-4.8L4.5,6.2c0-.4.3-.7.7-.7h13.6Z"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M9.5,16.5v-6" fill="none" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  );
};

export const PlusBoxIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M12 8V16M16 12L8 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" />
    </svg>
  );
};

export const CopyToClipboardIcon = ({
  style,
}: {
  style?: React.CSSProperties;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M9 15C9 12.1716 9 10.7574 9.87868 9.87868C10.7574 9 12.1716 9 15 9L16 9C18.8284 9 20.2426 9 21.1213 9.87868C22 10.7574 22 12.1716 22 15V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15C12.1716 22 10.7574 22 9.87868 21.1213C9 20.2426 9 18.8284 9 16L9 15Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.9999 9C16.9975 6.04291 16.9528 4.51121 16.092 3.46243C15.9258 3.25989 15.7401 3.07418 15.5376 2.90796C14.4312 2 12.7875 2 9.5 2C6.21252 2 4.56878 2 3.46243 2.90796C3.25989 3.07417 3.07418 3.25989 2.90796 3.46243C2 4.56878 2 6.21252 2 9.5C2 12.7875 2 14.4312 2.90796 15.5376C3.07417 15.7401 3.25989 15.9258 3.46243 16.092C4.51121 16.9528 6.04291 16.9975 9 16.9999"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const PaintBoard = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={style}
      fill="none"
    >
      <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C12.8417 22 14 22.1163 14 21C14 20.391 13.6832 19.9212 13.3686 19.4544C12.9082 18.7715 12.4523 18.0953 13 17C13.6667 15.6667 14.7778 15.6667 16.4815 15.6667C17.3334 15.6667 18.3334 15.6667 19.5 15.5C21.601 15.1999 22 13.9084 22 12Z" />
      <path
        d="M7 15.0024L7.00868 15.0001"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="8.5" r="1.5" />
      <circle cx="16.5" cy="9.5" r="1.5" />
    </svg>
  );
};

export const SquircleIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={style}>
      <path d="M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z" />
    </svg>
  );
};

export const SquircleIconSquish = ({
  style,
}: {
  style?: React.CSSProperties;
}) => {
  return (
    <svg
      id="Capa_1"
      data-name="Capa 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path d="M12,5.13c-4.5,0-6.47-1.85-7.6-.73-1.13,1.13.73,3.1.73,7.6,0,4.5-1.85,6.47-.72,7.6,1.13,1.13,3.1-.72,7.6-.72s6.47,1.85,7.6.72c1.13-1.13-.72-3.1-.73-7.6,0-4.5,1.85-6.47.73-7.6s-3.1.73-7.6.73Z" />
    </svg>
  );
};

export const SendIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" />
      <path d="M11.5 12.5L15 9" />
    </svg>
  );
};

export const FaceIcon1 = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 15C8.91212 16.2144 10.3643 17 12 17C13.6357 17 15.0879 16.2144 16 15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00897 9L8 9M16 9L15.991 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const FaceIcon2 = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M9.5 21.685C10.299 21.8906 11.1368 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 12.3375 2.01672 12.6711 2.04938 13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.02108 14L2.8602 16.0826C1.69974 17.2204 1.71976 19.0523 2.88023 20.1707C4.06071 21.2892 5.96146 21.2699 7.12193 20.1515C8.30241 19.0137 8.2824 17.1818 7.12193 16.0633L5.02108 14Z"
        strokeLinejoin="round"
      />
      <path
        d="M8.00897 8.44238H8M16 8.44238H15.991"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 16C14.1644 15.3721 13.1256 15 12 15C11.0893 15 10.2354 15.2436 9.5 15.6692"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const FaceIcon3 = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M7 9.01067C7 9.01067 8.40944 8.88341 9.19588 9.50798M9.19588 9.50798L8.93275 10.3427C8.82896 10.6719 9.10031 11 9.4764 11C9.87165 11 10.1327 10.6434 9.92918 10.3348C9.74877 10.0612 9.50309 9.75196 9.19588 9.50798ZM17 9.01067C17 9.01067 15.5906 8.88341 14.8041 9.50798M14.8041 9.50798L15.0672 10.3427C15.171 10.6719 14.8997 11 14.5236 11C14.1283 11 13.8673 10.6434 14.0708 10.3348C14.2512 10.0612 14.4969 9.75196 14.8041 9.50798Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3.93552L2 2L3.68554 7.22508C3.80276 7.58847 3.86138 7.77016 3.85636 7.94233C3.85135 8.1145 3.76983 8.32454 3.60679 8.74461C3.21495 9.75417 3 10.852 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 10.852 20.7851 9.75417 20.3932 8.74461C20.2302 8.32454 20.1486 8.1145 20.1436 7.94233C20.1386 7.77016 20.1972 7.58847 20.3145 7.22508L22 2L16 3.93552M8 3.93552C7.40756 4.22994 6.85215 4.58772 6.34267 5M8 3.93552C9.20496 3.33671 10.5632 3 12 3C13.4368 3 14.795 3.33671 16 3.93552M16 3.93552C16.5924 4.22994 17.1478 4.58772 17.6573 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 16C9.83563 16.6278 10.8744 16.9998 12 16.9998C13.1256 16.9998 14.1644 16.6278 15 16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ConfigIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={style}
      fill="none"
    >
      <path d="M15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12Z" />
      <path
        d="M21.011 14.0965C21.5329 13.9558 21.7939 13.8854 21.8969 13.7508C22 13.6163 22 13.3998 22 12.9669V11.0332C22 10.6003 22 10.3838 21.8969 10.2493C21.7938 10.1147 21.5329 10.0443 21.011 9.90358C19.0606 9.37759 17.8399 7.33851 18.3433 5.40087C18.4817 4.86799 18.5509 4.60156 18.4848 4.44529C18.4187 4.28902 18.2291 4.18134 17.8497 3.96596L16.125 2.98673C15.7528 2.77539 15.5667 2.66972 15.3997 2.69222C15.2326 2.71472 15.0442 2.90273 14.6672 3.27873C13.208 4.73448 10.7936 4.73442 9.33434 3.27864C8.95743 2.90263 8.76898 2.71463 8.60193 2.69212C8.43489 2.66962 8.24877 2.77529 7.87653 2.98663L6.15184 3.96587C5.77253 4.18123 5.58287 4.28891 5.51678 4.44515C5.45068 4.6014 5.51987 4.86787 5.65825 5.4008C6.16137 7.3385 4.93972 9.37763 2.98902 9.9036C2.46712 10.0443 2.20617 10.1147 2.10308 10.2492C2 10.3838 2 10.6003 2 11.0332V12.9669C2 13.3998 2 13.6163 2.10308 13.7508C2.20615 13.8854 2.46711 13.9558 2.98902 14.0965C4.9394 14.6225 6.16008 16.6616 5.65672 18.5992C5.51829 19.1321 5.44907 19.3985 5.51516 19.5548C5.58126 19.7111 5.77092 19.8188 6.15025 20.0341L7.87495 21.0134C8.24721 21.2247 8.43334 21.3304 8.6004 21.3079C8.76746 21.2854 8.95588 21.0973 9.33271 20.7213C10.7927 19.2644 13.2088 19.2643 14.6689 20.7212C15.0457 21.0973 15.2341 21.2853 15.4012 21.3078C15.5682 21.3303 15.7544 21.2246 16.1266 21.0133L17.8513 20.034C18.2307 19.8187 18.4204 19.711 18.4864 19.5547C18.5525 19.3984 18.4833 19.132 18.3448 18.5991C17.8412 16.6616 19.0609 14.6226 21.011 14.0965Z"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const MenuIcon = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path d="M4 5L20 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12L20 12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19L20 19" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const ArrowThin = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const MoreVertical = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M11.992 12H12.001"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9842 18H11.9932"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9998 6H12.0088"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Edit = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z"
        strokeLinejoin="round"
      />
      <path d="M13 4L20 11" strokeLinejoin="round" />
      <path d="M14 22L22 22" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const Check = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" />
      <path
        d="M8 12.5L10.5 15L16 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Crown = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path d="M3.51819 10.3058C3.13013 9.23176 2.9361 8.69476 3.01884 8.35065C3.10933 7.97427 3.377 7.68084 3.71913 7.58296C4.03193 7.49346 4.51853 7.70973 5.49173 8.14227C6.35253 8.52486 6.78293 8.71615 7.18732 8.70551C7.63257 8.69379 8.06088 8.51524 8.4016 8.19931C8.71105 7.91237 8.91861 7.45513 9.33373 6.54064L10.2486 4.52525C11.0128 2.84175 11.3949 2 12 2C12.6051 2 12.9872 2.84175 13.7514 4.52525L14.6663 6.54064C15.0814 7.45513 15.289 7.91237 15.5984 8.19931C15.9391 8.51524 16.3674 8.69379 16.8127 8.70551C17.2171 8.71615 17.6475 8.52486 18.5083 8.14227C19.4815 7.70973 19.9681 7.49346 20.2809 7.58296C20.623 7.68084 20.8907 7.97427 20.9812 8.35065C21.0639 8.69476 20.8699 9.23176 20.4818 10.3057L18.8138 14.9222C18.1002 16.897 17.7435 17.8844 16.9968 18.4422C16.2502 19 15.2854 19 13.3558 19H10.6442C8.71459 19 7.74977 19 7.00315 18.4422C6.25654 17.8844 5.89977 16.897 5.18622 14.9222L3.51819 10.3058Z" />
      <path d="M12 14H12.009" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 22H17" strokeLinecap="round" />
    </svg>
  );
};

export const Alert = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M2.52992 14.7696C2.31727 16.1636 3.268 17.1312 4.43205 17.6134C8.89481 19.4622 15.1052 19.4622 19.5679 17.6134C20.732 17.1312 21.6827 16.1636 21.4701 14.7696C21.3394 13.9129 20.6932 13.1995 20.2144 12.5029C19.5873 11.5793 19.525 10.5718 19.5249 9.5C19.5249 5.35786 16.1559 2 12 2C7.84413 2 4.47513 5.35786 4.47513 9.5C4.47503 10.5718 4.41272 11.5793 3.78561 12.5029C3.30684 13.1995 2.66061 13.9129 2.52992 14.7696Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 19C8.45849 20.7252 10.0755 22 12 22C13.9245 22 15.5415 20.7252 16 19"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Pin = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path d="M3 21L8 16" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M13.2585 18.8714C9.51516 18.0215 5.97844 14.4848 5.12853 10.7415C4.99399 10.1489 4.92672 9.85266 5.12161 9.37197C5.3165 8.89129 5.55457 8.74255 6.03071 8.44509C7.10705 7.77265 8.27254 7.55888 9.48209 7.66586C11.1793 7.81598 12.0279 7.89104 12.4512 7.67048C12.8746 7.44991 13.1622 6.93417 13.7376 5.90269L14.4664 4.59604C14.9465 3.73528 15.1866 3.3049 15.7513 3.10202C16.316 2.89913 16.6558 3.02199 17.3355 3.26771C18.9249 3.84236 20.1576 5.07505 20.7323 6.66449C20.978 7.34417 21.1009 7.68401 20.898 8.2487C20.6951 8.8134 20.2647 9.05346 19.4039 9.53358L18.0672 10.2792C17.0376 10.8534 16.5229 11.1406 16.3024 11.568C16.0819 11.9955 16.162 12.8256 16.3221 14.4859C16.4399 15.7068 16.2369 16.88 15.5555 17.9697C15.2577 18.4458 15.1088 18.6839 14.6283 18.8786C14.1477 19.0733 13.8513 19.006 13.2585 18.8714Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Unpin = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M7.5 8C6.95863 8.1281 6.49932 8.14239 5.99268 8.45891C5.07234 9.03388 4.85108 9.71674 5.08821 10.7612C5.94028 14.5139 9.48599 18.0596 13.2388 18.9117C14.2834 19.1489 14.9661 18.928 15.5416 18.0077C15.8411 17.5288 15.8716 17.0081 16 16.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 7.79915C12.1776 7.77794 12.3182 7.74034 12.4295 7.68235C13.3997 7.17686 13.9291 5.53361 14.4498 4.60009C14.9311 3.73715 15.1718 3.30567 15.7379 3.10227C16.3041 2.89888 16.6448 3.02205 17.3262 3.26839C18.9197 3.8445 20.1555 5.08032 20.7316 6.6738C20.9779 7.35521 21.1011 7.69591 20.8977 8.26204C20.6943 8.82817 20.2628 9.06884 19.3999 9.55018C18.4608 10.074 16.7954 10.6108 16.2905 11.5898C16.2345 11.6983 16.1978 11.8327 16.1769 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 21L8 16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3L21 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const VerticalDrag = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M8 6H8.00635M8 12H8.00635M8 18H8.00635M15.9937 6H16M15.9937 12H16M15.9937 18H16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Cross = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M19.0005 4.99988L5.00049 18.9999M5.00049 4.99988L19.0005 18.9999"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Config = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M21.3175 7.14139L20.8239 6.28479C20.4506 5.63696 20.264 5.31305 19.9464 5.18388C19.6288 5.05472 19.2696 5.15664 18.5513 5.36048L17.3311 5.70418C16.8725 5.80994 16.3913 5.74994 15.9726 5.53479L15.6357 5.34042C15.2766 5.11043 15.0004 4.77133 14.8475 4.37274L14.5136 3.37536C14.294 2.71534 14.1842 2.38533 13.9228 2.19657C13.6615 2.00781 13.3143 2.00781 12.6199 2.00781H11.5051C10.8108 2.00781 10.4636 2.00781 10.2022 2.19657C9.94085 2.38533 9.83106 2.71534 9.61149 3.37536L9.27753 4.37274C9.12465 4.77133 8.84845 5.11043 8.48937 5.34042L8.15249 5.53479C7.73374 5.74994 7.25259 5.80994 6.79398 5.70418L5.57375 5.36048C4.85541 5.15664 4.49625 5.05472 4.17867 5.18388C3.86109 5.31305 3.67445 5.63696 3.30115 6.28479L2.80757 7.14139C2.45766 7.74864 2.2827 8.05227 2.31666 8.37549C2.35061 8.69871 2.58483 8.95918 3.05326 9.48012L4.0843 10.6328C4.3363 10.9518 4.51521 11.5078 4.51521 12.0077C4.51521 12.5078 4.33636 13.0636 4.08433 13.3827L3.05326 14.5354C2.58483 15.0564 2.35062 15.3168 2.31666 15.6401C2.2827 15.9633 2.45766 16.2669 2.80757 16.8741L3.30114 17.7307C3.67443 18.3785 3.86109 18.7025 4.17867 18.8316C4.49625 18.9608 4.85542 18.8589 5.57377 18.655L6.79394 18.3113C7.25263 18.2055 7.73387 18.2656 8.15267 18.4808L8.4895 18.6752C8.84851 18.9052 9.12464 19.2442 9.2775 19.6428L9.61149 20.6403C9.83106 21.3003 9.94085 21.6303 10.2022 21.8191C10.4636 22.0078 10.8108 22.0078 11.5051 22.0078H12.6199C13.3143 22.0078 13.6615 22.0078 13.9228 21.8191C14.1842 21.6303 14.294 21.3003 14.5136 20.6403L14.8476 19.6428C15.0004 19.2442 15.2765 18.9052 15.6356 18.6752L15.9724 18.4808C16.3912 18.2656 16.8724 18.2055 17.3311 18.3113L18.5513 18.655C19.2696 18.8589 19.6288 18.9608 19.9464 18.8316C20.264 18.7025 20.4506 18.3785 20.8239 17.7307L21.3175 16.8741C21.6674 16.2669 21.8423 15.9633 21.8084 15.6401C21.7744 15.3168 21.5402 15.0564 21.0718 14.5354L20.0407 13.3827C19.7887 13.0636 19.6098 12.5078 19.6098 12.0077C19.6098 11.5078 19.7888 10.9518 20.0407 10.6328L21.0718 9.48012C21.5402 8.95918 21.7744 8.69871 21.8084 8.37549C21.8423 8.05227 21.6674 7.74864 21.3175 7.14139Z"
        strokeLinecap="round"
      />
      <path d="M15.5195 12C15.5195 13.933 13.9525 15.5 12.0195 15.5C10.0865 15.5 8.51953 13.933 8.51953 12C8.51953 10.067 10.0865 8.5 12.0195 8.5C13.9525 8.5 15.5195 10.067 15.5195 12Z" />
    </svg>
  );
};

export const LogOut = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M15 17.625C14.9264 19.4769 13.3831 21.0494 11.3156 20.9988C10.8346 20.987 10.2401 20.8194 9.05112 20.484C6.18961 19.6768 3.70555 18.3203 3.10956 15.2815C3 14.723 3 14.0944 3 12.8373L3 11.1627C3 9.90561 3 9.27705 3.10956 8.71846C3.70555 5.67965 6.18961 4.32316 9.05112 3.51603C10.2401 3.18064 10.8346 3.01295 11.3156 3.00119C13.3831 2.95061 14.9264 4.52307 15 6.37501"
        strokeLinecap="round"
      />
      <path
        d="M21 12H10M21 12C21 11.2998 19.0057 9.99153 18.5 9.5M21 12C21 12.7002 19.0057 14.0085 18.5 14.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Share = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M18 7C18.7745 7.16058 19.3588 7.42859 19.8284 7.87589C21 8.99181 21 10.7879 21 14.38C21 17.9721 21 19.7681 19.8284 20.8841C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8841C3 19.7681 3 17.9721 3 14.38C3 10.7879 3 8.99181 4.17157 7.87589C4.64118 7.42859 5.2255 7.16058 6 7"
        strokeLinecap="round"
      />
      <path
        d="M12.0253 2.00052L12 14M12.0253 2.00052C11.8627 1.99379 11.6991 2.05191 11.5533 2.17492C10.6469 2.94006 9 4.92886 9 4.92886M12.0253 2.00052C12.1711 2.00657 12.3162 2.06476 12.4468 2.17508C13.3531 2.94037 15 4.92886 15 4.92886"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Cloud = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={style}>
      <path d="M22,14.5c0,2.5-2,4.5-4.5,4.5H7c-2.8,0-5-2.2-5-5s2-4.7,4.5-5c.1,0,.3,0,.5,0s.8,0,1.5.2c1,.3,1.5.8,1.5.8,0,0-.5-.8-1.4-1.2-.7-.4-1.4-.4-2-.4.5-2.5,2.7-4.4,5.4-4.4s5.5,2.5,5.5,5.5,0,.3,0,.5c0,.4-.1,1-.4,1.6-.3.6-.6,1.1-.8,1.4.3-.2,1-.7,1.4-1.5.3-.5.4-1,.5-1.4,2.2.3,3.8,2.2,3.8,4.5Z" />
    </svg>
  );
};

export const Calendar = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path d="M18 2V4M6 2V4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.5 8H20.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 8H21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const NoList = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M16 2V4M11 2V4M6 2V4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 12.5V10C19.5 6.70017 19.5 5.05025 18.4749 4.02513C17.4497 3 15.7998 3 12.5 3H9.5C6.20017 3 4.55025 3 3.52513 4.02513C2.5 5.05025 2.5 6.70017 2.5 10V15C2.5 18.2998 2.5 19.9497 3.52513 20.9749C4.55025 22 6.20017 22 9.5 22H11.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.5 15L18 18.5M18 18.5L14.5 22M18 18.5L21.5 22M18 18.5L14.5 15"
        strokeLinecap="round"
      />
      <path d="M7 15H11M7 10H15" strokeLinecap="round" />
    </svg>
  );
};

export const Filter = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M13.2426 17.5C13.1955 17.8033 13.1531 18.0485 13.1164 18.2442C12.8876 19.4657 11.1555 20.2006 10.2283 20.8563C9.67638 21.2466 9.00662 20.782 8.9351 20.1778C8.79875 19.0261 8.54193 16.6864 8.26159 13.2614C8.23641 12.9539 8.08718 12.6761 7.85978 12.5061C5.37133 10.6456 3.59796 8.59917 2.62966 7.44869C2.32992 7.09255 2.2317 6.83192 2.17265 6.37282C1.97043 4.80082 1.86933 4.01482 2.33027 3.50742C2.79122 3.00002 3.60636 3.00002 5.23665 3.00002H16.768C18.3983 3.00002 19.2134 3.00002 19.6743 3.50742C19.8979 3.75348 19.9892 4.06506 20.001 4.50002"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.8628 7.4392L21.5571 8.13157C22.1445 8.71735 22.1445 9.6671 21.5571 10.2529L17.9196 13.9486C17.6335 14.2339 17.2675 14.4263 16.8697 14.5003L14.6153 14.9884C14.2593 15.0655 13.9424 14.7503 14.0186 14.3951L14.4985 12.1598C14.5728 11.7631 14.7657 11.3981 15.0518 11.1128L18.7356 7.4392C19.323 6.85342 20.2754 6.85342 20.8628 7.4392Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Clock = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8V12L14 14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
