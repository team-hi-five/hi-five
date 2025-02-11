
# Multi-Modal Chatbot & Speech Recognition Game

이 프로젝트는 Google Cloud의 Text-to-Speech (TTS) 및 Speech-to-Text (STT) API와 OpenAI의 GPT-4 API를 활용하여,  
**텍스트**와 **음성**을 모두 지원하는 챗봇 인터페이스와 음성 인식 기반 게임을 구현합니다.

챗봇은 고정된 질문을 TTS를 통해 음성으로 재생하고, 사용자는 텍스트 또는 음성으로 응답할 수 있습니다.  
또한, 사용자의 두 응답을 결합하여 GPT-4 API를 통해 감정 분석을 수행하고, 그 결과에 따라 최종 메시지를 제공합니다.

## 프로젝트 구조

.
├── .env                     # 환경변수 파일 (API 키, 자격증명 경로 등)
├── google-credentials.json  # Google Cloud 서비스 계정 키 파일
├── index.js                 # 음성 인식 게임 실행 스크립트 (녹음한 음성을 .wav 파일로 저장)
├── logs                     # 대화 로그가 저장되는 폴더 (실행 시 자동 생성)
├── server.js                # Express 백엔드 서버 (TTS, STT, GPT-4, 로그 저장)
└── client
    ├── package.json         # React 클라이언트 설정 (proxy: "http://localhost:5000")
    └── src
        └── App.js           # 챗봇 UI 구현 (TTS 재생, 음성 녹음, GPT-4 연동)


## 설치 및 설정

1. **레포지토리 클론 및 루트 의존성 설치**

   git clone <repository-url>
   cd <repository-folder>
   npm install

2. **.env 파일 생성 및 설정**  
   프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 추가합니다:
   
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
   PORT=5000

3. **React 클라이언트 의존성 설치**  
   `client` 폴더로 이동하여 의존성을 설치합니다:

   cd client
   npm install

## 실행 방법

### 1. 백엔드 서버 실행

백엔드 서버는 Express를 사용하여 TTS, STT, GPT-4, 로그 저장 API를 제공합니다.

# 프로젝트 루트에서 실행

npm start

서버가 `http://localhost:5000`에서 실행되며, 콘솔에 다음과 같은 메시지가 출력됩니다:

서버가 포트 5000에서 실행 중입니다.

### 2. React 클라이언트 실행

웹 인터페이스(챗봇 UI)를 테스트하려면 별도의 터미널에서 React 클라이언트를 실행합니다.

cd client
npm start

브라우저가 자동으로 [http://localhost:3000](http://localhost:3000)을 열고, 프록시 설정을 통해 API 요청이 백엔드로 전달됩니다.

### 3. 음성 인식 게임 실행 및 WAV 파일 저장

음성 인식 게임 스크립트인 `index.js`를 실행하면, 터미널에서 챕터와 스테이지를 입력한 후  
마이크로 녹음된 음성이 `result` 폴더 내의 `.wav` 파일로 저장됩니다.

node index.js

## API Endpoints

- **POST /api/tts**  
  - **설명:** 입력된 텍스트를 음성(MP3, base64)으로 합성  
  - **파라미터:**  
    - `text`: 합성할 텍스트  
    - `languageCode` (옵션): 언어 코드 (기본값: `ko-KR`)  
  - **목소리 변경:** `server.js`의 `voice` 옵션에서 `ssmlGender`와 `name` 값을 수정하여 변경할 수 있습니다.

- **POST /api/stt**  
  - **설명:** base64 인코딩된 음성 데이터를 텍스트로 변환

- **POST /api/gpt4**  
  - **설명:** 두 응답을 결합하여 감정 분석을 수행하고, 감정별 비율을 JSON으로 반환

- **POST /api/log**  
  - **설명:** 대화 로그를 JSON 파일로 저장 (logs 폴더)

## License

[필요한 경우 라이선스 정보를 명시하세요.]

## Acknowledgements

- [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech)
- [Google Cloud Speech-to-Text API](https://cloud.google.com/speech-to-text)
- [OpenAI GPT-4 API](https://openai.com/api/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)

---