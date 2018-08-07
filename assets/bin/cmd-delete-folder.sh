#!/bin/sh
# Delets a folder and commits it to the git repo

folder=$1
repo=$2

echo "deleting $folder"
echo "Root is $repo"
cd "$repo"
rm -rf "./$folder"
git add "./$folder"
git commit -m "Folder: $folder deleted"
#git push
