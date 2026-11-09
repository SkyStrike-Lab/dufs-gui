#!/bin/bash

docker run -it --rm --name dufs-test \
    -v "${PWD}/data":/data \
    -v "${PWD}/assets":/gui \
    -p 5010:5000 \
    sigoden/dufs:latest \
    /data -A --assets /gui
