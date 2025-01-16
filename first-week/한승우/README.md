## 25.01.13

<details>

<summary>표정 감성분석 모델링 학습</summary>

## 1. 표정 감정분석 AI 프로토타입을 위한 데이터 수집
- **FER-2013 데이터셋 선정**  
  - 표정(감정) 인식 모델 학습을 위해 대표적으로 많이 사용되는 공개 데이터셋인 FER-2013을 선택

## 2. 데이터셋 다운로드
- **KaggleHub**를 이용하여 FER-2013 데이터셋 다운 및 로컬 환경에 준비

## 3. 전처리 및 모델 학습
- **이미지 전처리**
  - 모든 이미지를 48x48 사이즈로 스케일링
- **모델 학습**
  - CNN(Convolutional Neural Network)을 활용하여 표정 감정분석 모델 학습
  - 하이퍼파라미터 튜닝 및 학습 단계 진행

## 4. 결과
- **50번 Epoch 학습 후 최종 정확도 68% 달성**
- 학습 과정 및 결과를 시각화 (예: Loss, Accuracy 그래프 등) 완료

---  
*해당 작업들을 토대로 모델 성능을 계속 개선할 수 있도록 추가 실험과 데이터 분석이 필요할 것으로 보임.*

</details>

---

## 25.01.14

<details>

<summary>OpenAI Realtime API Study</summary>

# OpenAI Realtime API 정리

OpenAI Realtime API는 **웹소켓(WebSocket)** 방식으로 동작하며, 텍스트와 오디오 같은 **멀티모달 입력**을 지원하는 저지연(Low-latency) API입니다. 기존의 RESTful 요청-응답 방식보다 **실시간** 처리가 용이해, 다음과 같은 기능을 제공합니다.

---

## 1. 개요
- **WebSocket 연결**을 통해 실시간으로 이벤트(Event)를 주고받음  
- **텍스트 & 오디오** 입출력 모두 지원  
  - 텍스트 입력 시 토큰 단위(`response.text.delta`) 스트리밍  
  - 음성 입력(`input_audio`)과 음성 출력(`response.audio.delta`) 모두 가능  
- **이벤트 기반 구조**  
  - 클라이언트(사용자) → 서버(모델): `conversation.item.create()` 형태로 텍스트/오디오를 전송  
  - 서버(모델) → 클라이언트: 스트리밍 응답(`response.text.delta`, `response.audio.delta`), 완료(`response.done`), 오류(`error`) 등의 이벤트

---

## 2. 기본 흐름

1. **WebSocket 연결하기**  
   ```python
   async with client.beta.realtime.connect(model="gpt-4o-realtime-preview-YYYY-MM-DD") as connection:
       ...
   ```
   - `AsyncOpenAI` 객체를 생성 후 `connection` 컨텍스트를 열면, 해당 모델과 실시간 통신 가능

2. **세션 설정**  
   ```python
   await connection.session.update(session={'modalities': ['text']})
   ```
   - 텍스트만 사용할 수도 있고, 오디오를 함께 사용하려면 `['text','audio']`로 설정  

3. **입력 데이터 전송**  
   ```python
   await connection.conversation.item.create(
       item={
           "type": "message",
           "role": "user",
           "content": [{"type": "input_text", "text": "Hello!"}]
       }
   )
   ```
   - `input_audio`를 사용해 음성 데이터를 전달할 수도 있음 (base64 인코딩 + `mime_type`)

4. **응답 생성 요청**  
   ```python
   await connection.response.create()
   ```
   - 이전에 전달된 입력(메시지)들에 대해 모델이 응답을 생성하도록 요청

5. **이벤트 수신 (스트리밍 응답)**  
   ```python
   async for event in connection:
       if event.type == 'response.text.delta':
           # 텍스트 토큰 단위로 스트리밍
       elif event.type == 'response.audio.delta':
           # 오디오 chunk(base64) 스트리밍
       elif event.type == 'error':
           # 오류 발생
       ...
   ```
   - 텍스트가 조각단위로 도착(`response.text.delta`), 오디오 역시 바이트 chunk 단위로 도착(`response.audio.delta`)  
   - 모든 응답이 끝나면 `response.done` 이벤트 수신

---

## 3. 음성 입출력 (Audio)

1. **세션 모달리티에 `audio` 추가**  
   ```python
   await connection.session.update(session={'modalities': ['text','audio']})
   ```
2. **오디오 입력**  
   ```python
   # "input.wav" 파일을 base64로 인코딩한 뒤 전달
   await connection.conversation.item.create(
       item={
           "type": "message",
           "role": "user",
           "content": [
               {
                   "type": "input_audio",
                   "audio": "<base64 인코딩된 audio>",
                   "mime_type": "audio/wav"
               }
           ],
       }
   )
   ```
3. **오디오 출력**  
   - 모델이 오디오 응답을 생성하면, `response.audio.delta` 이벤트가 여러 번 날아옴  
   - base64를 디코딩하여 연결하면 하나의 오디오 파일이 됨  
   - `response.audio.done` 이벤트 시 오디오 스트리밍이 종료  

---

## 4. 오류 처리
- Realtime API는 오류가 나면 **이벤트**(`event.type == "error"`)로 전달  
- 연결(WebSocket)은 유지되므로, 추가 입력·응답을 계속 주고받을 수 있음  
- 일반 Python 예외가 아니라 이벤트로 발생하므로, 수신 루프에서 직접 처리해야 함  

---

## 5. 정리

1. **WebSocket 기반 실시간**: REST/HTTP보다 빠른 피드백, 텍스트·오디오 멀티모달 입출력 가능  
2. **이벤트 주고받기**: 사용자 → 모델(입력), 모델 → 사용자(스트리밍 응답)  
3. **멀티모달**: `session.modalities`에 `'audio'`, `'text'`를 지정해 음성도 주고받을 수 있음  
4. **오류 처리**: 모델에서 반환하는 오류(`error` 이벤트)를 직접 확인하고 대응  
5. **사용 시 주의**:  
   - `pip install "openai[realtime]"`로 `websockets` 등 필수 의존성 설치  
   - Beta API이므로 인터페이스가 향후 변경될 가능성 있음  

위 과정을 통해 **“실시간”** 으로 텍스트 답변을 받아볼 수 있고, **음성 입출력**을 결합해 음성 챗봇도 구현할 수 있습니다. 자세한 예시 및 고급 기능은 [OpenAI Python 라이브러리 공식 GitHub](https://github.com/openai/openai-python)에서 확인하시기 바랍니다.

</details>

---

## 25.01.15

<details>

<summary>Web-based Realtime API Study</summary>

이 저장소(또는 프로젝트)는 **OpenAI Realtime API(베타)**를 **웹(WebSocket) 환경**에서 사용해 보는 간단한 예시입니다.  
브라우저에서 마이크 녹음을 하고, **SpeechRecognition API**로 실시간 텍스트(STT)를 추출한 뒤 **WebSocket**을 통해 서버로 전송합니다.  
서버는 **OpenAI Realtime API**와 연결하여 텍스트 답변을 스트리밍으로 받아, 다시 웹소켓을 통해 브라우저에 전송해 줍니다.

---

## 1. 주요 흐름

1. **브라우저**  
   - 마이크로부터 음성을 입력받음 (Web Speech API)  
   - 음성을 실시간으로 텍스트(STT) 변환  
   - 최종 텍스트를 **WebSocket**으로 서버에 전송  
2. **서버(Starlette/FastAPI)**  
   - WebSocket endpoint(`ws_endpoint`)에서 브라우저 메시지를 수신  
   - OpenAI의 **Realtime API**(베타)를 사용해 GPT 모델에 질의 (모달리티: 텍스트)  
   - 응답이 토큰 스트리밍으로 도착하면, **이벤트**(`response.text.delta`)를 WebSocket으로 브라우저에 푸시  
3. **브라우저**  
   - 웹소켓 메시지(`onmessage`) 이벤트로 모델 답변을 실시간 표시  

---

## 2. 폴더 구조 예시

```
my_web_project/
  ├─ main.py          # Starlette/FastAPI 서버 (WebSocket + OpenAI Realtime API 연결)
  ├─ requirements.txt # 의존성 목록
  └─ static/
      └─ index.html   # 웹 클라이언트 (마이크 녹음 → STT → 웹소켓 전송)
```

---

## 3. 실행 방법

1. **Reatime API 베타 권한**  
   - OpenAI 계정에 Realtime API 권한이 있어야 합니다.  
   - `pip install "openai[realtime]"`로 웹소켓 의존성 설치  

2. **환경 변수 설정**  
   ```bash
   export OPENAI_API_KEY=sk-xxxxx  # 윈도우는 set OPENAI_API_KEY=...
   ```

3. **설치 & 실행**  
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
   - `main.py`에 정의된 Starlette 앱이 8000번 포트에서 실행

4. **브라우저 열기**  
   - <http://127.0.0.1:8000/> 접속  
   - 마이크 권한 허용 후, “Start Recording” 버튼을 누르고 말하면, **텍스트**를 서버로 전송  
   - 서버는 GPT 모델 응답을 스트리밍으로 전송 → 브라우저 화면에 실시간 표시

---

## 4. 기술 스택

- **Starlette** + **uvicorn**: ASGI 웹 서버 & WebSocket 라우팅  
- **OpenAI Realtime API**: 텍스트 토큰을 스트리밍으로 주고받는 베타 API  
- **WebSocket**: 브라우저 ↔ 서버 간 실시간 양방향 통신  
- **Web Speech API**: 브라우저 상에서 음성 녹음 및 STT 구현 (Chrome 등 일부 브라우저만 지원)  
- (옵션) Whisper API or TTS API를 추가해 음성 입력/출력 기능을 확장할 수도 있음

---

## 5. 확장 아이디어

1. **오디오 응답**  
   - Realtime API에서 오디오 모달리티(`['audio','text']`) 사용해 음성 출력을 생성, 브라우저에서 재생  
2. **LangChain Tools 연동**  
   - GPT가 계산, 검색, DB 접근 등 기능을 스스로 호출 가능  
3. **멀티턴 대화**  
   - 세션 스테이트를 저장해, 이전 대화를 기억하고 추가 질문에 답변  
4. **음성 출력(TTS)**  
   - 브라우저 측 `SpeechSynthesis` API를 사용하여 GPT 텍스트 응답을 음성으로 변환

---

## 6. 참고

- [OpenAI Realtime API docs (beta)](https://platform.openai.com/docs/guides/realtime)  
- [Starlette WebSocket docs](https://www.starlette.io/websockets/)  
- [Web Speech API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)  

본 예제는 **웹 환경**에서 **실시간 음성 → 텍스트 전송 → GPT 스트리밍 응답**을 최소한의 코드로 시연한 것입니다.  
실제 프로젝트에서는 **오디오 응답 처리**, **멀티턴 대화**, **인증/보안**, **UI/UX**를 더 정교하게 구성하면 완성도 높은 음성 AI 웹 앱을 만들 수 있습니다.


</details>

---

## 25.01.16

<details>

<summary>React Voice Agent Setup Guide</summary>

## 목차

1. [Prerequisites (필수 사항)](#prerequisites)
2. [1. 프로젝트 클론하기](#1-프로젝트-클론하기)
3. [2. 가상환경 설정 및 활성화](#2-가상환경-설정-및-활성화)
4. [3. 의존성 설치](#3-의존성-설치)
5. [4. 환경 변수 설정](#4-환경-변수-설정)
6. [5. 서버 실행](#5-서버-실행)
7. [6. 애플리케이션 접근](#6-애플리케이션-접근)

---

## Prerequisites (필수 사항)

- **Python 3.10 이상**
- **Git**
- **Web Browser** (예: Chrome, Firefox)
- **OpenAI API Key**
- **Tavily API Key** (옵션: Tavily 도구를 사용하려면 필요)

---

## 1. 프로젝트 클론하기

먼저 GitHub 리포지토리를 로컬 컴퓨터에 클론(clone)합니다.

```bash
git clone https://github.com/teddylee777/react-voice-agent.git
cd react-voice-agent
```

---

## 2. 가상환경 설정 및 활성화

Python의 가상환경을 사용하면 프로젝트마다 독립된 패키지 관리를 할 수 있습니다.

### Windows

```cmd
python -m venv venv
venv\Scripts\activate
```

가상환경이 활성화되면 프롬프트에 `(venv)`가 표시됩니다.

---

## 3. 의존성 설치

프로젝트의 의존성을 설치하기 위해 필요한 패키지들을 설치합니다. `pyproject.toml`이나 `setup.py` 파일이 없어 `pip install -e .` 명령어가 실패할 수 있습니다. 대신, 수동으로 필요한 패키지를 설치합니다.

```bash
pip install langchain-community>=0.3.1 langgraph>=0.2.32 starlette>=0.39.2 uvicorn[standard]>=0.31.0
```

**추가:** `pip`을 최신 버전으로 업데이트하는 것이 좋습니다.

```bash
python -m pip install --upgrade pip
```

---

## 4. 환경 변수 설정

프로젝트는 `OPENAI_API_KEY`와 `TAVILY_API_KEY`라는 두 개의 환경 변수를 필요로 합니다. 정확한 변수 이름을 사용해야 합니다.

### Windows (CMD)

```cmd
set OPENAI_API_KEY=your_openai_api_key
set TAVILY_API_KEY=your_tavily_api_key
```

### Windows (PowerShell)

```powershell
$env:OPENAI_API_KEY="your_openai_api_key"
$env:TAVILY_API_KEY="your_tavily_api_key"
```

**주의:** 환경 변수를 설정할 때 오타가 없도록 주의하세요. 예를 들어, `TAVILY_API_KEY`가 아니라 `TTAVILY_API_KEY`로 설정하면 인식되지 않습니다.

---

## 5. 서버 실행

환경 변수가 모두 설정되었으면, 서버를 실행합니다.

```bash
cd server
uv run src/server/app.py
```

서버가 성공적으로 실행되면, 터미널에 다음과 유사한 메시지가 표시됩니다:

```
INFO:     Uvicorn running on http://0.0.0.0:3000 (Press CTRL+C to quit)
```

---

## 6. 애플리케이션 접근

`0.0.0.0`는 모든 네트워크 인터페이스에서 요청을 수신하도록 설정하는 특수한 IP 주소입니다. 로컬에서 접근하려면 `localhost` 또는 `127.0.0.1`을 사용해야 합니다.

브라우저에서 다음 주소로 접속하세요:

- [http://localhost:3000/](http://localhost:3000/)
- 또는 [http://127.0.0.1:3000/](http://127.0.0.1:3000/)

---

## 요약

1. **프로젝트 클론 및 가상환경 설정**: GitHub에서 리포지토리를 클론하고 Python 가상환경을 설정 및 활성화.
2. **의존성 설치**: 필요한 패키지를 `pip`을 통해 수동으로 설치.
3. **환경 변수 설정**: `OPENAI_API_KEY`와 정확한 `TAVILY_API_KEY` 설정.
4. **서버 실행 및 접근**: Uvicorn을 통해 서버를 실행하고, `localhost` 또는 `127.0.0.1`을 통해 웹 애플리케이션에 접근.

<img src="한승우 2025-01-16 IMAGE.png" width="800" height="600"/>

</details>

---
