"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface loader_interface {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useLoaderStore = create<loader_interface>()((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
