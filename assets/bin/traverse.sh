#!/bin/sh

assets/bin/traverse.py
git add folder.json
git commit -m "updated folder.json"
git pull
git push

