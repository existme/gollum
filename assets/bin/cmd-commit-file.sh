#!/bin/sh
# Commits a file under the name of the author

file=$1
author=$2
repo=$3

echo "commiting file $file author $author"
echo "Root is $repo"
cd $repo

git add "./$file"
git commit -F- <<EOF
File uploaded: $file

Author: <$author>
EOF
#git push