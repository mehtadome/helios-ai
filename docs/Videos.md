# Reference Sheet for Video API
## `GET /v3/videos`
**Query**
```
const options = {method: 'GET', headers: {'x-api-key': '<api-key>'}};

fetch('https://api.heygen.com/v3/videos?limit=10', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```
**200 Response**
```
{
  "data": [
    {
      "id": "<string>",
      "status": "pending",
      "title": "My Generated Video",
      "created_at": 1711929600,
      "completed_at": 1711930200,
      "video_url": "https://files.heygen.ai/video/abc123.mp4",
      "thumbnail_url": "https://files.heygen.ai/thumb/abc123.jpg",
      "gif_url": "https://files.heygen.ai/gif/abc123.gif",
      "captioned_video_url": "https://files.heygen.ai/video/abc123_captioned.mp4",
      "subtitle_url": "https://files.heygen.ai/srt/abc123.srt",
      "duration": 30.5,
      "folder_id": "folder_abc123",
      "output_language": "en-US",
      "failure_code": "rendering_failed",
      "failure_message": "Avatar rendering timed out",
      "video_page_url": "https://app.heygen.com/video/abc123"
    }
  ],
  "has_more": true,
  "next_token": "<string>"
}
```

## `GET /v3/videos/{video_id}
**Query**
```
const options = {method: 'GET', headers: {'x-api-key': '<api-key>'}};

fetch('https://api.heygen.com/v3/videos/{video_id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```
**200 Response**
```
{
  "data": {
    "id": "<string>",
    "status": "pending",
    "title": "My Generated Video",
    "created_at": 1711929600,
    "completed_at": 1711930200,
    "video_url": "https://files.heygen.ai/video/abc123.mp4",
    "thumbnail_url": "https://files.heygen.ai/thumb/abc123.jpg",
    "gif_url": "https://files.heygen.ai/gif/abc123.gif",
    "captioned_video_url": "https://files.heygen.ai/video/abc123_captioned.mp4",
    "subtitle_url": "https://files.heygen.ai/srt/abc123.srt",
    "duration": 30.5,
    "folder_id": "folder_abc123",
    "output_language": "en-US",
    "failure_code": "rendering_failed",
    "failure_message": "Avatar rendering timed out",
    "video_page_url": "https://app.heygen.com/video/abc123"
  }
}
```

## `DELETE /v3/videos/{video_id}`
**Query**
```
const options = {method: 'DELETE', headers: {'x-api-key': '<api-key>'}};

fetch('https://api.heygen.com/v3/videos/{video_id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```
**200 Response**
```
{
  "data": {
    "id": "<string>",
    "deleted": true
  }
}
```