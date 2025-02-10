// 감정분석 결과를 서버로 전송
// npm install express 후 node server.js 하기
// import express from "express";

// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3001;

// Express 4.16 이상부터 내장된 JSON 파서 사용
app.use(express.json());

// POST 요청으로 JSON 데이터를 받고, ./logs 폴더에 파일로 저장하는 엔드포인트
app.post("/api/save-log", (req, res) => {
  // 클라이언트에서 전달한 JSON 데이터를 payload로 저장
  const payload = req.body;

  // 백엔드에서 현재 시간을 기준으로 파일명을 생성합니다.
  // ISO 문자열에서 콜론(:)은 파일명에 사용할 수 없으므로 하이픈(-)으로 치환합니다.
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const fileName = `log_${timestamp}.json`;

  // ./logs 폴더의 경로 설정
  const logsDir = path.join(__dirname, "logs");

  // ./logs 폴더가 존재하지 않으면 생성합니다.
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // 파일의 전체 경로 생성
  const filePath = path.join(logsDir, fileName);

  // JSON 데이터를 파일로 저장 (읽기 편하게 들여쓰기도 포함)
  fs.writeFile(filePath, JSON.stringify(payload, null, 2), (err) => {
    if (err) {
      console.error("파일 저장 중 에러 발생:", err);
      return res.status(500).json({ error: "파일 저장 실패" });
    }
    console.log("로그 파일 저장 성공:", filePath);
    res.json({ message: "파일 저장 성공", filePath });
  });
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
