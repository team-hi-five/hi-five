FROM bellsoft/liberica-openjdk-debian:17
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} /app/
ENTRYPOINT ["java", "-jar", "/app.jar", "--server.address=0.0.0.0"]
