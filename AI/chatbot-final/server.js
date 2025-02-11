// server.js
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);


import textToSpeech from '@google-cloud/text-to-speech';
import speech from '@google-cloud/speech';
import { OpenAI } from 'openai'; // 최신 방식

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Google TTS 클라이언트 초기화
const ttsClient = new textToSpeech.TextToSpeechClient();

// Google Speech-to-Text 클라이언트 초기화
const sttClient = new speech.SpeechClient();

// OpenAI API 초기화 (최신 방식)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// TTS 엔드포인트
app.post('/api/tts', async (req, res) => {
  const { text, languageCode } = req.body;
  try {
    const request = {
      input: { text },
      voice: {
        languageCode: languageCode || 'ko-KR',
        ssmlGender: 'FEMALE',
        name: 'ko-KR-Neural2-A'
      },
      audioConfig: { audioEncoding: 'MP3' },
    };
    const [response] = await ttsClient.synthesizeSpeech(request);
    const audioBase64 = response.audioContent.toString('base64');
    res.json({ audioContent: audioBase64 });
  } catch (error) {
    console.error("TTS 에러:", error);
    res.status(500).json({ error: error.toString() });
  }
});

// STT 엔드포인트
app.post('/api/stt', async (req, res) => {
  const { audioContent } = req.body;
  try {
    const audioBuffer = Buffer.from(audioContent, 'base64');
    const request = {
      audio: { content: audioBuffer.toString('base64') },
      config: {
        encoding: 'MP3',
        sampleRateHertz: 16000,
        languageCode: 'ko-KR',
      },
    };
    const [response] = await sttClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    res.json({ transcription });
  } catch (error) {
    console.error("STT 에러:", error);
    res.status(500).json({ error: error.toString() });
  }
});

// GPT-4 감정 분석 엔드포인트
app.post('/api/gpt4', async (req, res) => {
  const { sentence } = req.body;
  try {
    const prompt = `다음 문장에 대해 다섯 가지 감정(happy, sad, angry, fear, surprised)이 각각 몇 퍼센트인지 분석해줘.
문장: "${sentence}"
출력은 JSON 형식으로 해줘. 예시: {"happy": 92, "sad": 0, "angry": 0, "fear": 0, "surprised": 8}`;
    const messages = [
      { role: "system", content: "당신은 감정 분석 전문가입니다." },
      { role: "user", content: prompt }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages,
      temperature: 0,
    });
    const reply = completion.choices[0].message.content;
    let emotionData;
    try {
      emotionData = JSON.parse(reply);
    } catch (jsonError) {
      const jsonStart = reply.indexOf('{');
      const jsonEnd = reply.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = reply.substring(jsonStart, jsonEnd + 1);
        emotionData = JSON.parse(jsonString);
      } else {
        throw new Error("JSON 파싱 실패");
      }
    }
    res.json({ emotion: emotionData });
  } catch (error) {
    console.error("GPT-4 에러:", error);
    res.status(500).json({ error: error.toString() });
  }
});

// 대화 로그 저장 엔드포인트
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
