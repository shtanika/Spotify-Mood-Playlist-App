# Summary of Backend Deployment 
Generated with ChatGPT for better formatted / worded documentation of the complicated process of deploying backend in order to look back on it later.

1. Pushed Docker image to Amazon ECR

    - Created a private ECR repository.

    - Logged Docker in with aws ecr get-login-password.

    - Built, tagged, and pushed the image <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend-api:latest.

2. Prepared the Beanstalk deployment bundle

    - Wrote Dockerrun.aws.json (version 1) pointing at the ECR image and container port 5000.

    - Zipped that single file into app.zip.

    - Uploaded the zip to an S3 bucket (beanstalk-bucket-<my-username>).

3. Created the Beanstalk application and application version

    - aws elasticbeanstalk create-application --application-name backend-api.

    - aws elasticbeanstalk create-application-version --version-label v1 … referencing the S3 zip.

4. Built the required IAM instance profile

    - Created role elasticbeanstalk-ec2-role.

    - Attached AWSElasticBeanstalkWebTier, AWSElasticBeanstalkMulticontainerDocker, and AmazonEC2ContainerRegistryReadOnly policies.

    - Added the role to an instance profile of the same name.

5. Set runtime environment variables (values from backend.env)
    - Ran following command for backend.env variables
    ```bash
    ENV_OPTIONS=$(awk -F= '{printf "Namespace=aws:elasticbeanstalk:application:environment,OptionName=%s,Value=%s ", $1, $2}' .env)
    ```

    - Used aws elasticbeanstalk create-environment --option-settings with namespace aws:elasticbeanstalk:application:environment to inject DB_HOST, DB_USER, DB_PASSWORD, SECRET_KEY, etc.

    ```bash
    aws elasticbeanstalk create-environment \
    --application-name backend-api \
    --environment-name backend-api-env \
    --version-label v-1746994903 \
    --option-settings \
        Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value=elasticbeanstalk-ec2-role \
        --option-settings $ENV_OPTIONS \
    ```

6. Created the Beanstalk environment

    - aws elasticbeanstalk create-environment --environment-name backend-api-env …

    - Docker platform “64bit Amazon Linux 2023 v4.5.1 running Docker”.

    - IAM instance profile set to elasticbeanstalk-ec2-role.

    - Version label v-1746994903.

7. Fixed the “instance profile” error

    - Occurred because the role/instance profile didn’t yet exist.

    - Resolved by creating the role and specifying it in environment creation.

8. Opened network access between the Beanstalk EC2 and the RDS instance

    - Located the Beanstalk instance’s security group.

    - Added an inbound PostgreSQL (TCP 5432) rule in the RDS security group allowing that EC2 security group.

9. Verified application health

    - API URL: http://backend-api-env.eba-pbpgkmcx.us-east-1.elasticbeanstalk.com/

    - Confirmed FastAPI listens on 0.0.0.0:5000, so Beanstalk’s reverse proxy maps external port 80 → internal 5000.

    - Used log tailing (request-environment-info/retrieve-environment-info) and EB console logs to debug.

    - Noted initial 499 errors (client aborted) traced to database connectivity; resolved after SG update.

10. PostgreSQL connection string pattern

    - postgresql://<user>:<password>@<host>:5432/<dbname>
    e.g.
    postgresql://admin:yourpass@mydb.abcd1234.us-east-1.rds.amazonaws.com:5432/mydatabase

    - Set as an environment variable (DATABASE_URL) in Beanstalk if code expects it.

11. Current status

    - The API container launches via Beanstalk, served on external port 80.

    - RDS credentials and host are injected as env vars.

    - Security groups now permit the EC2 instances to reach the RDS on port 5432.

    - Endpoints are reachable; Swagger UI generates correct curls; logs show successful POSTs.

    - That’s the full sequence—starting from container build all the way to a running, database-connected Elastic Beanstalk deployment.