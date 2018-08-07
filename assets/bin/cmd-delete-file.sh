#!/bin/sh
# Delets a file and commits it to the git repo

file=$1
repo=$2
echo "deleting file [$file]"

echo "Root is $repo"

cd "$repo"
/bin/rm -rf "./$file"
git add "./$file"
git commit -m "File: $file deleted"
#git push