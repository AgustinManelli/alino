"use client";

import React, {
  Component,
  useEffect,
  type ReactNode,
  type ErrorInfo,
} from "react";
import { loadEmojiMartData } from "./initEmojiMart";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "em-emoji": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        shortcodes?: string;
        size?: number | string;
        set?: string;
        id?: string;
        native?: string;
        fallback?: string;
        skin?: number | string;
        spritesheet?: boolean | string;
      };
    }
  }
}

interface EmojiErrorBoundaryProps {
  children?: ReactNode;
}

interface EmojiErrorBoundaryState {
  hasError: boolean;
}

class EmojiErrorBoundary extends Component<
  EmojiErrorBoundaryProps,
  EmojiErrorBoundaryState
> {
  state: EmojiErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): EmojiErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo?: ErrorInfo) {

  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export interface EmojiMartComponentProps
  extends React.HTMLAttributes<HTMLElement> {
  shortcodes?: string;
  size?: number | string;
  set?: string;
  id?: string;
  native?: string;
  fallback?: string;
  skin?: number | string;
}

export function EmojiMartComponent(props: EmojiMartComponentProps) {
  useEffect(() => {
    loadEmojiMartData();
  }, []);

  const shortcodes = props.shortcodes;

  if (!shortcodes || typeof shortcodes !== "string") {
    return null;
  }

  if (!shortcodes.startsWith(":") || !shortcodes.endsWith(":")) {
    return null;
  }

  return (
    <EmojiErrorBoundary>
      <em-emoji {...props} set="native"></em-emoji>
    </EmojiErrorBoundary>
  );
}
