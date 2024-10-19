## response format

```json
{
  "name": "bounty matching",
  "schema": {
    "type": "object",
    "properties": {
      "matched_request": {
        "type": "boolean",
        "description": "Whether the provided tweet matched the bounty's request or not; bias towards yes"
      },
      "authors": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "abstract": {
        "type": "string"
      },
      "keywords": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    "required": [
      "title",
      "authors",
      "abstract",
      "keywords"
    ],
    "additionalProperties": false
  },
  "strict": true
}
```
