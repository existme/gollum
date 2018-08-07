#!/bin/sh
# creates the folder if it doesn't exists

folder=$1
repo=$2
echo "Root is $repo"
cd $repo
mkdir -p "./$folder"
git add "./$folder"
git commit -m "Folder: $folder created"
