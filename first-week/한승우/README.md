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
