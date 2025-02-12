// server.js
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 대화 로그 저장 엔드포인트만 남김
app.post('/api/log', async (req, res) => {
  const logData = req.body;
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const logFileName = path.join(logsDir, `${timestamp}.json`);
    fs.writeFileSync(logFileName, JSON.stringify(logData, null, 2));
    res.json({ message: '로그 저장 성공' });
  } catch (error) {
    console.error("로그 저장 에러:", error);
    res.status(500).json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
