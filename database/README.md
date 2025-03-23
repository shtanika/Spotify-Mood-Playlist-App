# Database README
## Start databse 
To start the database, build the docker container using the `docker-compose.yml` file. 
Or use the `./start.sh` script, which will start build and up the database. ¨

## Stop database 
`./stop.sh`
> This will remove the volume, remove `--volumes` if you want data to be persistant 

## psql tables 
While the container is running it will be accessable on the host network at the defualt port `5432`, use the `psql` command to connec to it: 
`psql -U admin -d database -h 0.0.0.0`. 
or use 

```bash
./connect.sh
```

### View tables
```
database=# \d
            List of relations
 Schema |      Name       | Type  | Owner 
--------+-----------------+-------+-------
 public | playlist_tracks | table | admin
 public | playlists       | table | admin
 public | prompts         | table | admin
 public | users           | table | admin
(4 rows)
```

### View all content in table
```
database=# select * from users;
 id | spotify_id | email | display_name | profile_image | created_at 
----+------------+-------+--------------+---------------+------------
(0 rows)
```

### Disconnect 
```
\q
```