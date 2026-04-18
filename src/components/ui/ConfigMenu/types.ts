import React from "react";

export interface ConfigActionOption {
  name: string;
  icon: React.ReactNode;
  action: () => void;
  enabled?: boolean;
  children?: never;
}

export interface ConfigSubmenuOption {
  name: string;
  icon: React.ReactNode;
  enabled?: boolean;
  children: ConfigOption[];
  action?: never;
}

export type ConfigOption = ConfigActionOption | ConfigSubmenuOption;
