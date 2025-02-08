"use client";
import Manager from "../todo/manager";

export default function ({ userName }: { userName: string }) {
  return <Manager h={true} userName={userName} />;
}
