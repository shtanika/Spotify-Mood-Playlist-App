# Deployment Information

## Amazon RDS 
Connecting to RDS
```bash
psql -h database-1.curysomaqw3y.us-east-1.rds.amazonaws.com -U postgres -d postgres -p 5432
```

## Logging into ECR to push images
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

## Updating ECR image
```bash
docker build . -t backend-api
docker tag backend-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend-api:latest
```