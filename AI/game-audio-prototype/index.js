// index.js

require('dotenv').config();  // dotenv 모듈을 사용하여 .env 파일의 내용을 로드

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mic = require('mic');
const speech = require('@google-cloud/speech');
const stringSimilarity = require('string-similarity');
const wav = require('wav');

// ─── 1. 사용자 입력(챕터와 스테이지 선택) ───────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, ans => resolve(ans.trim())));
}

async function main() {
  // 챕터와 스테이지 입력 받기
  const chapterInput = await askQuestion("챕터를 선택하세요: ");
  const stageInput = await askQuestion("스테이지를 선택하세요: ");

  // JSON 파일 경로 구성 (예: data/1-1.json)
  const jsonFilePath = path.join(__dirname, 'game_data', `${chapterInput}-${stageInput}.json`);

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`파일이 존재하지 않습니다: ${jsonFilePath}`);
    process.exit(1);
  }

  // JSON 파일 로드
  const stageData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

  // 옵션 목록을 배열로 변환 (키 오름차순 정렬)
  const optionKeys = Object.keys(stageData.options).sort((a, b) => Number(a) - Number(b));
  const options = optionKeys.map(key => stageData.options[key]);
  const correctAnswer = stageData.answer; // 정답 번호 (예: 1)

  console.log(`\n[${chapterInput}-${stageInput} 스테이지]`);
  console.log("선택지:");
  optionKeys.forEach(key => {
    console.log(`${key}. "${stageData.options[key]}"`);
  });

  console.log("\n한국어 음성을 말해주세요...");

  // ─── 2. 음성 인식 및 옵션 비교 ───────────────────────────────
  let finalResultReceived = false;

  // Google Cloud Speech 클라이언트 생성
  const client = new speech.SpeechClient();

  // 음성 인식 설정
  // **주의:** 사용 환경(이어폰 마이크 등)에 맞게 sampleRateHertz 값을 조정하세요.
  // 예시에서는 인식율이 좋았던 8000Hz로 설정합니다.
  const request = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'ko-KR',
      // speechContexts: 옵션 문구에 가중치를 줌
      speechContexts: [{
        phrases: options,
        boost: 90.0
      }]
    },
    interimResults: true
  };

  let lastInterimTranscript = '';

  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', (error) => {
      console.error('Speech API Error:', error);
    })
    .on('data', (data) => {
      if (data.results[0] && data.results[0].alternatives[0]) {
        const result = data.results[0];
        const alternative = result.alternatives[0];
        const transcript = alternative.transcript;
        if (result.isFinal) {
          console.log(`\n최종 인식된 음성: ${transcript}`);
          finalResultReceived = true;
          // 정답 처리 로직...
          process.exit();
        } else {
          lastInterimTranscript = transcript;
          console.log(`중간 인식 결과: ${transcript}`);
        }
      } else {
        console.log('음성을 인식하지 못했습니다.');
      }
    });

  // ─── 3. 마이크 설정 및 WAV 저장 (옵션) ───────────────────────────────
  // 마이크의 sample rate를 8000Hz로 설정 (실제 테스트에서 좋은 결과가 있었다면 해당 값 사용)
  const micInstance = mic({
    rate: '8000',
    channels: '1',
    bitwidth: '16',
    encoding: 'signed-integer',
    fileType: 'raw',
    debug: true,
    exitOnSilence: 0
  });

  const micInputStream = micInstance.getAudioStream();

  // ./result 폴더가 없으면 생성
  const resultDir = path.join(__dirname, 'result');
  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
  }

  // 현재 날짜-시간 문자열 생성 (예: 2023-05-30T14-23-45.123Z)
  const now = new Date();
  const formattedDate = now.toISOString().replace(/:/g, '-'); // 콜론(:)을 대시(-)로 치환
  const fileName = `${formattedDate}.wav`;
  const filePath = path.join(resultDir, fileName);

  // WAV 파일로 저장 (테스트용)
  const wavFileWriter = new wav.FileWriter(filePath, {
    channels: 1,
    sampleRate: 16000,
    bitDepth: 16
  });

  // 스트림을 두 군데로 파이프: Google Speech와 WAV 파일 저장
  micInputStream.pipe(recognizeStream);
  micInputStream.pipe(wavFileWriter);

  micInputStream.on('data', (data) => {
    console.log(`Received Input Stream: ${data.length} bytes`);
  });

  micInputStream.on('error', (err) => {
    console.error('Error in Input Stream: ' + err);
  });

  micInputStream.on('startComplete', () => {
    console.log("마이크 녹음 시작됨 (startComplete)");
  });

  // micInputStream 'stopComplete' 이벤트에서:
  micInputStream.on('stopComplete', () => {
    console.log("마이크 녹음 종료됨 (stopComplete)");
    if (!finalResultReceived && lastInterimTranscript) {
      console.log(`최종 인식된 음성(강제): ${lastInterimTranscript}`);
      // 보정 및 정답 비교 로직을 여기서 한 번 더 호출할 수 있습니다.
      const bestMatch = stringSimilarity.findBestMatch(lastInterimTranscript, options);
      const bestOptionIndex = bestMatch.bestMatchIndex;
      if ((bestOptionIndex + 1) === correctAnswer) {
        console.log("\n정답입니다!");
      } else {
        console.log("\n오답입니다!");
      }
      console.log(`정답은 "${options[correctAnswer - 1]}" 입니다.`);
    } else if (!finalResultReceived) {
      console.log("최종적으로 인식된 음성이 없습니다.");
    }
    process.exit();
  });


  micInputStream.on('pauseComplete', () => {
    console.log("마이크 녹음 일시정지됨 (pauseComplete)");
  });

  micInstance.start();

  // 일정 시간(예: 15초) 후 녹음을 종료
  setTimeout(() => {
    console.log("시간 종료: 마이크 녹음을 종료합니다.");
    micInstance.stop();
  }, 10000);

  rl.close();
}

main();
