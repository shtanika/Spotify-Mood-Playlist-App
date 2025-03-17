if ! docker network inspect shared_network >/dev/null 2>&1; then
    docker network create shared_network
fi

docker compose -f docker-compose.yml up --build -d