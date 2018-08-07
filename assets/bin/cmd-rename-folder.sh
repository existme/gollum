#!/bin/sh
# Renames a folder from $1 to $2 and commits it to the git repo

from=$1
to=$2
repo=$3

echo "rename from $from to $to"

echo "Root is $repo"
mv "$repo/$from" "$repo/$to"
#cd root
#assets/bin/move_link.pl $1 $2

git add "./$to"
git add "./$from"
git commit -m "Folder renamed from $from to $to"
#git push
#/home/existme/bin/beep