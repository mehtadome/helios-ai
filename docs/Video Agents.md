# Reference Sheet for Video Agents API
## `POST /v3/video-agents`
**Query**
```
const options = {
    method: 'POST',
    headers: {'x-api-key': '<api-key>', 'Content-Type': 'application/json'},
    body: JSON.stringify({
      prompt: '<string>',
      mode: 'generate',
      avatar_id: '<string>',
      voice_id: '<string>',
      style_id: '<string>',
      brand_kit_id: '<string>',
      orientation: 'landscape',
      files: [{type: '<string>', url: '<string>'}],
      callback_url: '<string>',
      callback_id: '<string>',
      incognito_mode: false
    })
  };
  
  fetch('https://api.heygen.com/v3/video-agents', options)
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(err => console.error(err));
```
**200 Response**
```
{
  "data": {
    "session_id": "<string>",
    "status": "generating",
    "created_at": 123,
    "video_id": "v_abc123def456"
  }
}
```

## `POST /v3/video-agents/{session_id}`
**Query**
```
const options = {
  method: 'POST',
  headers: {'x-api-key': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    message: '<string>',
    avatar_id: '<string>',
    voice_id: '<string>',
    brand_kit_id: '<string>',
    files: [{type: '<string>', url: '<string>'}]
  })
};

fetch('https://api.heygen.com/v3/video-agents/{session_id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```
**200 Response**
```
{
  "data": {
    "session_id": "<string>",
    "run_id": "<string>",
    "title": "<string>"
  }
}
```

## `GET /v3/video-agents/{session_id}
**Query**
```
const options = {method: 'GET', headers: {'x-api-key': '<api-key>'}};

fetch('https://api.heygen.com/v3/video-agents/{session_id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```
**Response**
```
{
  "data": {
    "session_id": "<string>",
    "status": "thinking",
    "created_at": 123,
    "progress": 0,
    "title": "<string>",
    "video_id": "<string>",
    "messages": [
      {
        "role": "<string>",
        "content": "<string>",
        "type": "text",
        "created_at": 123,
        "resource_ids": [
          "<string>"
        ]
      }
    ]
  }
}
```

## `GET /v3/video-agents/{session_id}/videos
**Query**
```
const options = {method: 'GET', headers: {'x-api-key': '<api-key>'}};

fetch('https://api.heygen.com/v3/video-agents/{session_id}/videos', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```
**Response**
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


## Template
**Query**
```
```
**Response**
```
```