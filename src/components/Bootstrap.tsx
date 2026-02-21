"use client";

import { useEffect } from "react";

export function BootstrapData() {
  useEffect(() => {
    fetch("/api/bootstrap", { method: "POST" });
  }, []);

  return null;
}
