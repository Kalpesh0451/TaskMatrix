# TaskMatrix submission files

This pack contains:
- `backend/.env.example`: safe placeholder configuration based on the environment variables referenced in the uploaded backend source.
- `backend/package.json` and `frontend/package.json`: copies of the manifests in the uploaded project archive.
- `TaskMatrix.postman_collection.json`: requests built from the Express route declarations in `backend/routes/`.

## Add these files to your project
Copy the `backend/.env.example` into `TaskMatrix/backend/.env.example` (replace the existing sample). Copy `TaskMatrix.postman_collection.json` into the TaskMatrix project root. The two package manifests are included for reference; do not overwrite your project copies unless you intend to.

## Postman setup
1. Import `TaskMatrix.postman_collection.json` into Postman.
2. Set `baseUrl` to `http://localhost:5001`.
3. Set `email` and `password` to a valid test account.
4. Run **Authentication → Login**. If the API response returns a top-level `token` property, the collection saves it automatically. Otherwise copy the token from the response into the collection/environment `token` variable.
5. Replace `userId`, `projectId`, `taskId`, and `notificationId` with real MongoDB document IDs before running requests that need them.
6. Use an Admin or Project Manager token for role-restricted operations.

The collection includes the routes declared in the Express router files. Some payloads are starter examples and may need required fields adjusted to match your application's validation and role permissions. The same project-activities route appears only once.

## Security warning
Never commit `backend/.env`. The uploaded ZIP included a real `.env` file. It was not copied into this pack. Keep it local and confirm it is ignored by Git. If any credential or JWT secret from that file has ever been pushed to a public repository or shared outside a trusted environment, rotate it.
