# **Audio File API Project**

## Overview

I developed a backend service (`Node.js`) handling two different kinds of requests:
```
[POST] -> http://localhost:{PORT}/audio/users/{user_id}/phrase/{phrase_id}
```
`POST` request which handles uploading a file to server filesystem for a given user + inserts a row into a `phrases` table [`Postgresql`] which associates a phrase to a given user
```
[GET] -> http://localhost:{PORT}/audio/users/{user_id}/phrase/{phrase_id}/{output_file_type (e.g. mp3, m4a, wav...etc.)}
```
`GET` request which handles retrieving an audio file for a given user, then logs a `last_downloaded` datetime in the `phrases` table
*NOTE:* This can be used by evaluators of the assignment to determine that the correct phrase was pulled for the correct user

----------

## Assumptions

In building this backend API, some key assumptions were made:
- ✅ No compression involved in the storing of files i.e. files are simply read as `bytes` and saved in `.wav` format when uploaded, then again read as `bytes` and output as `.mp3` when downloaded
- ✅ Audio files are only downloadable in `mp3` format (per assignment to choose two for conversion purposes, I chose `.mp3` for download and `.wav` for storage)
- ✅ Assignment `CURL` example did not specify any form data in the `POST` request other than the input file, so assumed that the `{user_id}`, `{phrase_id}` were to be parsed from the url, e.g.: `http://localhost:3000/audio/user/1/phrase/1` becomes 👇 after regex function is applied
```javascript
['user', 1, 'phrase', 1]
```
- ✅ Database should be pre-seeded with users in order to perform a check on whether that users exists --> then to upload or download audio fill
- ✅ Acceptable for this assignment to have the database connection config in the main app src (normally I would use a `env` variables but may not be convenient here)
  
----------

## Tests
Per the assignment guidelines, full testing suites were not necessary - as such I made sure to include at least function testing using `JEST` to ensure that key functions return as expected. (if needed, the test suite can be run using `yarn test` in the project directory)

----------

## Examples of API Response Handling
Below are some examples of how certain requests are handled, based on input *assuming a pre-seeded database of **4 users***

Request:
```curl
curl --request POST --form "file=@testfile.mp3;type=audio/mpeg" http://localhost:3000/audio/user/4/phrase/1
```
Response:
```json
{"success":true,"message":"file uploaded."}
```
Request:
```curl
curl --request POST --form "file=@testfile.mp3;type=audio/mpeg" http://localhost:3000/audio/user/5/phrase/1
```
Response:
```json
{"success":false,"message":"User does not exist."}
```
Request:
```curl
curl http://localhost:3000/audio/user/5/phrase/2
```
Response:
```json
{"success":false,"message":"URL must end with a file extension i.e. mp3"}
```
Request:
```curl
curl --request POST --form "file=@testfile.mp3;type=audio/mpeg" http://localhost:3000/audio/user/5/phrase
```
Response:
```json
{"success":false,"message":"Either user id or phrase id not provided."}
```
----------

## Setup

<img src="https://www.docker.com/sites/default/files/d8/2019-07/Moby-logo.png" width=30> The project has been dockerized and can be run with the following command 👇
```bash
docker-compose up --build --force-recreate
```
*NOTE*: `--force-recreate` argument is included so that container filesystem and database table data does not persist after containers are stopped (in case it requires re-running; if not, please ignore)