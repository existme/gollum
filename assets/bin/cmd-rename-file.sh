#!/bin/sh
# Renames a folder from $1 to $2 and commits it to the git repo
from=$1
to=$2
repo=$3
cd $repo

DIR=$(dirname ".$to")

mkdir -p -v $DIR
ls -la $cwd/$DIR

echo "Created folder $DIR"
echo "rename file from .$from to .$to"
echo "Root is $repo"

mv ".$from" ".$to"
ls -la ".$from"
ls -la ".$to"
#assets/bin/move_link.pl $1 $2

git add ".$to"
git add ".$from"
git commit -m "File renamed from .$from to .$to"
#git push
