FROM bellsoft/liberica-openjdk-debian:17

WORKDIR /app

# ✅ JAR 파일 복사 (Jenkins 빌드 후 생성된 JAR 파일을 사용)
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

# ✅ 실행 명령어 (Spring Boot 애플리케이션 실행)
ENTRYPOINT ["java", "-jar", "app.jar", "--server.address=0.0.0.0"]
