#FROM alpine
FROM existme/gollum-base:0.1

COPY . /gollum
WORKDIR /gollum

RUN cd /gollum; \
    gem build gollum.gemspec; \
    gem install gollum-4.1.4.gem --no-document --without development test

ENTRYPOINT ["docker/script.sh"]
#CMD ["/bin/zsh","-c","docker/script.sh > server.log 2>&1"]
