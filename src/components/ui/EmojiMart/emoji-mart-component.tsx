// @ts-nocheck
"use client";

import React, { Component } from "react";

class EmojiErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {

  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export function EmojiMartComponent(props) {
  const shortcodes = props.shortcodes;

  if (!shortcodes || typeof shortcodes !== "string") {
    return null;
  }

  if (!shortcodes.startsWith(":") || !shortcodes.endsWith(":")) {
    return null;
  }

  return (
    <EmojiErrorBoundary>
      <em-emoji {...props} set="apple"></em-emoji>
    </EmojiErrorBoundary>
  );
}
