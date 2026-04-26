"use client";

import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export const socket = io(URL, {
  path: "/api/socket_io",
  autoConnect: false,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  timeout: 20000,
});

export const initSocket = async () => {
  try {
    await fetch('/api/socket');
  } catch (e) {
    console.warn("Socket API initialization skipped");
  }
  socket.connect();
};
