import React from "react";

export interface ConfigActionOption {
  name: string;
  icon: React.ReactNode;
  action: () => void;
  enabled?: boolean;
  variant?: "default" | "critical";
  children?: never;
}

export interface ConfigSubmenuOption {
  name: string;
  icon: React.ReactNode;
  enabled?: boolean;
  variant?: "default" | "critical";
  children: ConfigOption[];
  action?: never;
}

export type ConfigOption = ConfigActionOption | ConfigSubmenuOption;
