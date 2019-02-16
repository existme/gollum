#!/bin/zsh

echo "docker/script.sh running..."
pwd
#top
#npm rebuild node-sass
#./build.sh

export PLANTUML_SRV=$plantuml
export GOLLUM_AUTH=$useldap
export GLDAP_TITLE="Gollum Authentication USE YOUR WINDOWS CREDENTIALS e.g. aduser"
export GLDAP_HOST="$ldaphost"
export GLDAP_PORT=$ldapport
export GLDAP_BASE="$ldapbase"
export GLDAP_UID="$ldapuid"
export GLDAP_FILTER="$ldapfilter"
export GLDAP_BIND_DN="$binddn"
export GLDAP_PASSWORD=$ldappass
export G_PROXY=$http_proxy
export http_proxy=$http_proxy
export https_proxy=$https_proxy
export GOLLUM_AUTOPUSH=$autopush
User=$user

gemroot="${$(gem which gollum)/\/lib\/gollum.rb/}"
gollum /repo --config ${gemroot}/wiki-config.rb --port 80  --adapter rugged
