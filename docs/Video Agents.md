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