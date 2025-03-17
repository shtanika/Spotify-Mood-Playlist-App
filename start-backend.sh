#!/bin/bash

if ! docker network inspect shared_network >/dev/null 2>&1; then
    echo "Creating shared_network..."
    docker network create shared_network
fi

cd database
./stop.sh
./start.sh
cd ../backend
./stop.sh
./start.sh
cd ..
