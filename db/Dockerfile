FROM postgres:12

ENV POSTGRES_USER docker
ENV POSTGRES_PASSWORD docker
ENV POSTGRES_DB docker

EXPOSE 5432

ADD ./createTable.sql /docker-entrypoint-initdb.d/