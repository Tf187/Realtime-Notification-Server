import express from "express";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";
import { notificationSchema, type Notification } from "./notification.js";

const port = Number(process.env.PORT ?? 8080);
const apiKey = process.env.API_KEY ?? "change-me";

const app = express();
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const clients = new Map<string, Set<WebSocket>>();

function subscribe(target: string, socket: WebSocket) {
  const sockets = clients.get(target) ?? new Set<WebSocket>();
  sockets.add(socket);
  clients.set(target, sockets);

  socket.once("close", () => {
    sockets.delete(socket);
    if (sockets.size === 0) clients.delete(target);
  });
}

function publish(notification: Notification) {
  const sockets = clients.get(notification.target);
  if (!sockets) return 0;

  const payload = JSON.stringify({ event: "notification", notification });
  let delivered = 0;

  for (const socket of sockets) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
      delivered++;
    }
  }

  return delivered;
}

wss.on("connection", (socket, request) => {
  const url = new URL(request.url ?? "/ws", "http://localhost");
  const target = url.searchParams.get("target");

  if (!target) {
    socket.close(1008, "Missing target");
    return;
  }

  subscribe(target, socket);
  socket.send(JSON.stringify({ event: "connected", target }));
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    connections: [...clients.values()].reduce((sum, set) => sum + set.size, 0)
  });
});

app.post("/notifications", (req, res) => {
  if (req.header("x-api-key") !== apiKey) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const parsed = notificationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_notification", details: parsed.error.flatten() });
    return;
  }

  const notification: Notification = {
    ...parsed.data,
    id: randomUUID(),
    createdAt: new Date().toISOString()
  };

  const delivered = publish(notification);
  res.status(202).json({ notification, delivered });
});

server.listen(port, () => {
  console.log(`notification server listening on :${port}`);
});
