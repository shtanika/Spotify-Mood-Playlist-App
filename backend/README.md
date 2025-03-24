# Creating a new user 
```bash
curl -X POST http://127.0.0.1:5000/create_user \
-H "Content-Type: application/json" \
-d '{
  "spotify_id": "example_spotify_id",
  "email": "user@example.com",
  "display_name": "Example User",
  "profile_image": "https://example.com/profile.jpg"
}'
```