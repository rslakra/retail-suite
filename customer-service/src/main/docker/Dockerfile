FROM java:21
VOLUME /tmp
ADD retail-suite-customer-service-0.0.1-SNAPSHOT.jar /app.jar
RUN bash -c 'touch /app.jar'
ENV RABBITMQ_PORT ${RABBIT_PORT_5672_TCP_PORT}
ENV RABBITMQ_HOST ${RABBIT_PORT_5672_TCP_ADDR}
EXPOSE 9000
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
