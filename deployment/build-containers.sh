cd .. 
cd backend
docker build . -t backend-api
cd ..
cd frontend
docker build . -t frontend
cd ..

docker images