"use client";

import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const socket = io(URL, {
  autoConnect: false,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  timeout: 20000,
});
