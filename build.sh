#!/bin/sh
#export PLANTUML_SRV="http://sample.se.axis.com/plantuml/png/"

npm run build:dev # for dev environment, for production: npm run build:prod
gem build gollum.gemspec
sudo gem install gollum-4.1.4.gem --no-document --without development 
