# Use the official PostgreSQL image from the Docker Hub
FROM postgres:latest

# Set environment variables for PostgreSQL
# Use .env file to set environment variables
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DB=${POSTGRES_DB}

# Copy initialization scripts to the container
COPY ./init-scripts /docker-entrypoint-initdb.d/

# Set correct permissions
RUN chmod -R 644 /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432

# Use the default entrypoint from the official image
CMD ["postgres"]