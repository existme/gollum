#!/usr/bin/zsh

REPO=
PORT=1234
while [ $# -gt 0 ]; do    # Until you run out of parameters . . .
    case "$1" in
        "-p")
            shift
            PORT="$1"
        ;;
        "-r")
            shift
            REPO="$1"
        ;;
        "-h")
            echo "Will run gollum docker instance for a repo on a specific port"
            echo "Usage: ./docker-build -r <repo name> [-p <port>]"
            echo "       The default port is 1234"
        ;;
    esac
    shift
done

[[ -z $REPO ]] && echo "REPO is required: -p ~/git/notes" && return

echo "Running gollum for '$REPO' on port $PORT ..."
docker run --mount type=bind,source="$REPO",target=/repo \
            -p 127.0.0.1:${PORT}:80 -it existme/gollum:0.1
