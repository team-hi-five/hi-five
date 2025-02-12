

# 종합 감정분석 솔루션

이 프로젝트는 OpenAI GPT API를 활용하여 아이의 감정 학습 진행도를 분석하고, 부족한 감정 영역에 대해 추천 메시지를 제공하는 React 기반 웹 애플리케이션입니다.

## 기능

- **JSON 데이터 로드**: `public/test.json` 파일에 저장된 감정 학습 진행 데이터를 불러옵니다.
- **감정 분석**: 불러온 데이터를 기반으로 GPT API를 호출하여 감정 분석 결과 및 학습 추천 메시지를 생성합니다.
- **간단한 UI**: 사용자는 버튼 클릭 한 번으로 JSON 파일을 불러오고, 분석 결과를 확인할 수 있습니다.

## 프로젝트 구조


exam-assessment/
├─ public/
│  ├─ index.html
│  └─ test.json
├─ src/
│  ├─ EmotionAnalyzer.jsx
│  ├─ App.js
│  └─ index.js
├─ .env
├─ package.json
└─ README.md


## 설치 및 실행

1. **프로젝트 클론 및 디렉토리 이동**

   git clone <repository-url>
   cd exam-assessment

2. **의존성 설치**

   npm install

3. **환경 변수 설정**

   프로젝트 루트(`exam-assessment/`)에 `.env` 파일을 생성하고 아래 내용을 추가하세요.  
   (Create React App에서는 환경 변수 이름이 반드시 `REACT_APP_`로 시작해야 합니다.)

   REACT_APP_OPENAI_API_KEY=sk-...

4. **개발 서버 실행**

   npm start

   브라우저에서 [http://localhost:3000](http://localhost:3000) 주소로 접속하면 애플리케이션을 확인할 수 있습니다.

## 사용 방법

1. **JSON 불러오기** 버튼을 클릭하여 `test.json` 파일에 저장된 감정 데이터를 불러옵니다.
2. **분석하기** 버튼을 클릭하면, GPT API를 통해 감정 분석 결과와 추천 메시지가 화면에 표시됩니다.

## 참고 사항

- **API 키 보안**: 현재 API 키는 클라이언트 측에서 사용되고 있으므로 보안에 주의하시기 바랍니다. 실제 운영 환경에서는 백엔드 프록시 서버를 통해 API 요청을 처리하는 것을 권장합니다.
- **API 사용 비용**: OpenAI API 사용 시 발생하는 비용에 유의하세요.

## License

MIT License

---
