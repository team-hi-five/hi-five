FROM bellsoft/liberica-openjdk-debian:17

WORKDIR /app

ARG JAR_FILE=build/libs/*SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

ENTRYPOINT ["java", "-jar", "app.jar", "--server.address=0.0.0.0"]
