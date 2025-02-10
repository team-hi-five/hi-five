
# 음성 인식 기반 챕터/스테이지 게임

이 프로젝트는 Google Cloud Speech-to-Text API와 마이크 입력을 이용해  
사용자가 선택한 챕터/스테이지에 따른 선택지(옵션) 중에서 음성 인식을 통해 정답 여부를 판별하는 게임입니다.

## 기능

- **챕터/스테이지 선택:**  
  콘솔 입력을 통해 챕터와 스테이지를 선택합니다.
- **옵션 불러오기:**  
  선택된 챕터/스테이지에 맞는 JSON 파일(`./game_data/챕터-스테이지.json`)에서 선택지와 정답을 불러옵니다.
- **음성 인식:**  
  마이크로 한국어 음성을 받아 Google Speech API를 통해 인식하고,  
  인식 결과를 사전 정의된 옵션들과 비교하여 정답 여부를 판별합니다.
- **녹음 파일 저장:**  
  녹음 결과는 `./result` 폴더에 현재 날짜-시간을 파일 이름으로 하는 WAV 파일로 저장됩니다.

## 설치 방법

1. **Clone the repository:**

   git clone <repository-url>
   cd <repository-directory>
   

2. **환경변수 설정 (.env 파일):**

   프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 추가합니다.

   GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-service-account.json
   

   **주의:**  
   실제 서비스 계정 JSON 파일은 `./credentials` 폴더에 저장하고, Git에는 포함되지 않도록 `.gitignore`에 추가합니다.

3. **npm 의존성 설치:**

   npm install
   
4. **SoX 설치:**  
   업샘플링에 사용하므로 시스템에 SoX가 설치되어 있어야 하며, PATH에 등록되어 있어야 합니다.

## 실행 방법

터미널에서 아래 명령어로 프로젝트를 실행합니다.

npm start


실행 후 콘솔에 챕터와 스테이지를 선택하라는 메시지가 나타나며,  
선택 후 한국어 음성을 말하면 음성 인식 결과에 따라 정답 여부가 출력됩니다.

## 파일 구조


project-root/
├── credentials/
│   └── google-service-account.json   // (Git에 포함하지 마세요)
├── game_data/
│   ├── 1-1.json
│   ├── 1-2.json
│   └── ... (기타 JSON 파일)
├── result/                             // 녹음된 WAV 파일이 저장됨
├── index.js
├── .env
├── .gitignore
└── package.json


## 주의 사항

- **민감 정보 관리:**  
  서비스 계정 JSON과 .env 파일은 Git에 포함되지 않도록 반드시 `.gitignore`에 추가하세요.
- **환경 설정:**  
  마이크 입력 샘플 레이트와 Google Speech API 설정(예, 16000Hz vs 8000Hz 등)은 사용 환경에 맞게 조정해야 합니다.
- **SoX:**  
  업샘플링을 위해 시스템에 SoX가 설치되어 있어야 합니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.


---
