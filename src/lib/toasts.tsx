"use client";

import { toast } from "sonner";
import { NormalToaster } from "@/components/ui/toaster/normal-toaster";
import {
  AlertCircleIcon,
  Check,
  InformationCircleIcon,
  LoadingIcon,
  WarningCircleIcon,
} from "@/components/ui/icons/icons";

export const customToast = {
  success: (title: string, text?: string) =>
    toast.custom(() => (
      <NormalToaster
        title={title}
        text={text}
        icon={
          <Check
            style={{ width: 24, height: 24, strokeWidth: 2, stroke: "#22c55e" }}
          />
        }
      />
    )),

  error: (title: string, text?: string) =>
    toast.custom(() => (
      <NormalToaster
        title={title}
        text={text}
        icon={
          <AlertCircleIcon
            style={{
              width: 24,
              height: 24,
              strokeWidth: 2,
              stroke: "#ff2600ff",
            }}
          />
        }
      />
    )),

  warning: (title: string, text?: string) =>
    toast.custom(() => (
      <NormalToaster
        title={title}
        text={text}
        icon={
          <WarningCircleIcon
            style={{
              width: 24,
              height: 24,
              strokeWidth: 2,
              stroke: "#ff9900ff",
            }}
          />
        }
      />
    )),

  info: (title: string, text?: string) =>
    toast.custom(() => (
      <NormalToaster
        title={title}
        text={text}
        icon={
          <InformationCircleIcon
            style={{
              width: 24,
              height: 24,
              strokeWidth: 2,
              stroke: "#0077ff",
            }}
          />
        }
      />
    )),

  loading: (title: string, text?: string) =>
    toast.custom(() => (
      <NormalToaster
        title={title}
        text={text}
        icon={
          <LoadingIcon
            style={{
              width: 24,
              height: 24,
              strokeWidth: 2,
              stroke: "var(--text-not-available)",
            }}
          />
        }
      />
    )),

  action: (
    title: string,
    text?: string,
    action?: { label: string; onClick: () => void },
  ) =>
    toast.custom(() => (
      <NormalToaster title={title} text={text} action={action} />
    )),
};
