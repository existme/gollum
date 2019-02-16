FROM starefossen/ruby-node:alpine

COPY gollum-base.gemspec /gollum-base.gemspec

RUN apk update && \
    apk add --update \
        make cmake g++ \
        icu-dev \
        zsh sudo \
    && rm -rf /var/cache/apk/*

RUN gem build gollum-base.gemspec
RUN sudo gem install gollum-base-0.0.1.gem --no-document --without development test
RUN npm rebuild node-sass