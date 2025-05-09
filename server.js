import fs from "fs";
import http from "http";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

//  DEVICE_ID → 최신 JPEG 버퍼 보관
const latest = new Map();

wss.on("connection", (ws, req) => {
  const id = req.url.split("/").pop();
  console.log(`WS connect: ${id}`);
  ws.on("message", data => latest.set(id, data));
  ws.on("close", () => {
    console.log(`WS close: ${id}`);
    latest.delete(id);
  });
});

// 브라우저 MJPEG 스트림  e.g.  /stream/abcdef
app.get("/stream/:id", (req, res) => {
  const { id } = req.params;
  res.writeHead(200, {
    "Content-Type": "multipart/x-mixed-replace; boundary=frame"
  });
  const timer = setInterval(() => {
    const buf = latest.get(id);
    if (buf) {
      res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${buf.length}\r\n\r\n`);
      res.write(buf);
      res.write("\r\n");
    }
  }, 30); // ~33fps 최대
  req.on("close", () => clearInterval(timer));
});

// Render 헬스체크
app.get("/", (req,res)=>res.send("VIGILANT WS BACKEND OK"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on :${PORT}`));
