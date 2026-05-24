# WhatsApp Broadcast Campaign Engine Architecture

This document specifies the technical design, queuing strategy, webhook processing, and Meta WhatsApp Cloud API integration specification for the enterprise-grade Campaign Engine.

---

## 1. Dispatch Pipeline (SaaS Scale)

To send campaigns to thousands of contacts without triggering Meta anti-spam throttling, triggering connection issues, or exceeding rate limits, GuestCompass uses a **multi-stage queued delivery pipeline**:

```
[Campaign Published]
         ↓
[Audience Resolver] (Applies Segment rules -> generates DB Campaign Recipients in 'queued' state)
         ↓
[Redis / RabbitMQ Queue] (Pushes recipient job list)
         ↓
[Worker Nodes] (Pulls jobs -> processes rate throttling -> signs & encrypts payloads)
         ↓
[Meta WhatsApp Cloud API]
         ↓
[Webhooks Gateway] (Listens for delivery receipts: sent, delivered, read, failed)
         ↓
[DB Analytics Sync] (Updates counts in real time via atomic DB increments)
```

---

## 2. Meta WhatsApp Cloud API Payload Schema

Every template broadcast message payload dispatched to Meta's endpoints adheres to the following strict JSON schema:

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+15552345678",
  "type": "template",
  "template": {
    "name": "summer_sale_broadcast",
    "language": {
      "code": "en_US"
    },
    "components": [
      {
        "type": "header",
        "parameters": [
          {
            "type": "image",
            "image": {
              "link": "https://example.com/assets/campaign-banner.jpg"
            }
          }
        ]
      },
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Sarah"
          },
          {
            "type": "text",
            "text": "GUEST50"
          }
        ]
      },
      {
        "type": "button",
        "sub_type": "url",
        "index": "0",
        "parameters": [
          {
            "type": "text",
            "text": "promo/GUEST50"
          }
        ]
      }
    ]
  }
}
```

---

## 3. Webhooks & Event Receipt Processing

GuestCompass implements a fast, highly-available webhooks gateway to capture delivery events:

### Event Hook Payload Example

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15555555555",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "statuses": [
              {
                "id": "wamid.HBgLMTU1NTU1NTU1NTUSFQY0IEFERTY1NzczQzRDN0NBMzI0RDk3OTBGOTI0OEYA",
                "status": "delivered",
                "timestamp": "1483228800",
                "recipient_id": "15552345678"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Event Handlers & Analytics Sync

Upon receiving a status payload, the webhook gateway processes the receipt asynchronously:

1. **Verification Check**: Verifies signature header `X-Hub-Signature-256` using the application webhook secret.
2. **Logs Record**: Updates state inside `campaign_recipients`.
3. **Atomic Increments**: Runs PostgreSQL atomic increments to maintain exact, synchronized campaign analytics:
   ```sql
   UPDATE campaigns 
   SET delivered_count = delivered_count + 1 
   WHERE id = (SELECT campaign_id FROM campaign_recipients WHERE whatsapp_message_id = 'wamid...');
   ```

---

## 4. Throttling and Meta Compliance Rate Limits

WhatsApp Business API accounts have tiered sending limits:

- **Tier 1**: 1,000 unique recipients per 24 hours.
- **Tier 2**: 10,000 unique recipients per 24 hours.
- **Tier 3**: 100,000 unique recipients per 24 hours.
- **Tier 4**: Unlimited unique recipients per 24 hours.

### Queue Throttling Strategy

GuestCompass implements dynamic **token-bucket rate limiting** inside redis workers to distribute message dispatches evenly across sending windows, avoiding peak load spikes and conforming automatically to current tier constraints.
