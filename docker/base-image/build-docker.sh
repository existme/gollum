#!/usr/bin/zsh

docker build -t existme/gollum-base:0.1 .
#docker run gollum
docker run existme/gollum-base:0.1