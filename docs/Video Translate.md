# Reference Sheet for Video Agents API
## `GET /v3/video-translations`
**Query**
```
const options = {method: 'GET', headers: {'x-api-key': '<api-key>'}};

fetch('https://api.heygen.com/v3/video-translations?limit=10', options)
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
      "title": "<string>",
      "output_language": "<string>",
      "input_language": "<string>",
      "duration": 123,
      "translate_audio_only": true,
      "video_url": "<string>",
      "audio_url": "<string>",
      "srt_caption_url": "<string>",
      "vtt_caption_url": "<string>",
      "callback_id": "<string>",
      "created_at": 123,
      "failure_message": "<string>"
    }
  ],
  "has_more": true,
  "next_token": "<string>"
}
```

## `POST /v3/video-translations`
**Query**
```
const options = {
  method: 'POST',
  headers: {'x-api-key': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    video: {type: '<string>', url: '<string>'},
    output_languages: ['<string>'],
    title: '<string>',
    audio: {type: '<string>', url: '<string>'},
    input_language: '<string>',
    translate_audio_only: false,
    speaker_num: 123,
    mode: 'speed',
    callback_url: '<string>',
    callback_id: '<string>',
    enable_caption: false,
    keep_the_same_format: true,
    enable_dynamic_duration: true,
    disable_music_track: false,
    enable_speech_enhancement: false,
    enable_watermark: false,
    start_time: 123,
    end_time: 123,
    brand_voice_id: '<string>',
    stock_voice_config: {use_stock_voice: false, preferred_stock_voice_ids: ['<string>']},
    srt: {type: '<string>', url: '<string>'},
    srt_role: 'input',
    fps_mode: '<string>',
    folder_id: '<string>'
  })
};

fetch('https://api.heygen.com/v3/video-translations', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```
**200 Response**
```
{
  "data": {
    "video_translation_ids": [
      "<string>"
    ]
  }
}
```

## `GET /v3/video-translations/{video_translation_id}
**Query**
```
const options = {method: 'GET', headers: {'x-api-key': '<api-key>'}};

fetch('https://api.heygen.com/v3/video-translations/{video_translation_id}', options)
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
    "title": "<string>",
    "output_language": "<string>",
    "input_language": "<string>",
    "duration": 123,
    "translate_audio_only": true,
    "video_url": "<string>",
    "audio_url": "<string>",
    "srt_caption_url": "<string>",
    "vtt_caption_url": "<string>",
    "callback_id": "<string>",
    "created_at": 123,
    "failure_message": "<string>"
  }
}
```

## `DELETE /v3/video-translations/{video_translation_id}
**Query**
```
const options = {method: 'DELETE', headers: {'x-api-key': '<api-key>'}};

fetch('https://api.heygen.com/v3/video-translations/{video_translation_id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```
**Response**
```
{
  "data": {
    "id": "<string>"
  }
}
```