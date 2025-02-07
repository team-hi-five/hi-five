# ✅ 가벼운 JDK 17 기반 이미지 사용
FROM bellsoft/liberica-openjdk-debian:17

# ✅ 작업 디렉토리를 /app으로 설정
WORKDIR /app

# ✅ JAR 파일을 올바르게 복사 (빌드된 JAR 파일을 /app/app.jar로 복사)
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

# ✅ ENTRYPOINT에서 JAR 파일 실행 (경로 수정)
ENTRYPOINT ["java", "-jar", "app.jar", "--server.address=0.0.0.0"]
