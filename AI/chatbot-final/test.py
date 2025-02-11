from google.cloud import texttospeech

def list_voices(language_code=None):
    # 올바른 방식: 환경 변수에서 인증 정보를 가져와 클라이언트 생성
    client = texttospeech.TextToSpeechClient()
    response = client.list_voices(language_code=language_code)

    voices = sorted(response.voices, key=lambda voice: voice.name)
    print(f" Voices: {len(voices)} ".center(60, "-"))

    for voice in voices:
        languages = ", ".join(voice.language_codes)
        name = voice.name
        gender = texttospeech.SsmlVoiceGender(voice.ssml_gender).name
        rate = voice.natural_sample_rate_hertz
        print(f"{languages:<8} | {name:<24} | {gender:<8} | {rate:,} Hz")

list_voices("ko")
