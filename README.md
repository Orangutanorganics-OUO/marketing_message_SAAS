# WhatsApp Marketing SaaS

A modern React web application for sending bulk WhatsApp marketing messages using the Meta WhatsApp Business API. Upload media, manage recipients, and send personalized template messages at scale.

## Features

- **Media Management** - Upload images and videos to WhatsApp Business API and retrieve Media IDs
- **Bulk Messaging** - Send template messages to multiple recipients with batch processing
- **CSV Editor** - Built-in editor for managing recipient data
- **Template Support** - Flexible message templates with optional name personalization
- **Real-time Tracking** - Monitor message delivery progress with detailed logs
- **Smart Batching** - Automatic rate limiting with concurrent processing (5 messages per batch)

## Tech Stack

- React 18
- React Router
- Vite
- WhatsApp Business API

## Prerequisites

Before using this application, you need:

- **WhatsApp Business API Access** - Get your access token and Phone Number ID from Meta Business Manager
- **Approved Message Templates** - Create and get approval for templates in Meta Business Manager

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/marketing_message_SAAS.git
cd marketing_message_SAAS
```

Install dependencies:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Building for Production

Create a production build:

```bash
npm run build
```

The build files will be in the `dist` directory.

Preview the production build:

```bash
npm run preview
```

## Usage

### Step 1: Upload Media

1. Navigate to the "Media Upload" page
2. Enter your Access Token and Phone Number ID
3. Upload an image or video file
4. Click "Get Media ID" and copy the ID

### Step 2: Send Messages

1. Navigate to the "Send Messages" page
2. Configure your settings:
   - Access Token
   - Phone Number ID
   - Template Name (must match your approved template)
   - Language Code (e.g., "en", "es", "hi")
   - Media ID (from Step 1)
3. Choose message options:
   - Media Type: Image or Video
   - Include name personalization: Yes or No
4. Paste your recipient data in CSV format
5. Click "Send Messages"

### CSV Format

```csv
Name,MobileNumber
John,919876543210
Jane,918765432109
```

**Important:**
- First line must be exactly `Name,MobileNumber`
- Include country code without `+` prefix (e.g., 91 for India)
- The app automatically adds the `+` prefix

## Message Templates

Your WhatsApp template must be approved by Meta:

**With Name Personalization:**
- Header: Image or Video
- Body: Include `{{1}}` variable for name

**Without Name Personalization:**
- Header: Image or Video
- Body: Static text only

## Deployment

### Netlify

The project includes a `netlify.toml` configuration file for easy deployment:

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Netlify will auto-detect settings and deploy

Or drag and drop the `dist` folder directly to Netlify after running `npm run build`.

## API Rate Limits

The application implements smart batching:
- Sends 5 messages concurrently
- 1-second delay between batches
- Respects WhatsApp Business API rate limits
- Suitable for sending 200+ messages efficiently

## Security

- Never commit your Access Token to version control
- Use environment variables for sensitive data in production
- Regularly rotate your access tokens
- Monitor API usage in Meta Business Manager

## Troubleshooting

**Media Upload Issues:**
- Ensure file size is within limits (16MB for images/videos)
- Use supported formats: PNG, JPEG for images; MP4 for videos
- Verify credentials are correct

**Message Sending Issues:**
- Template name is case-sensitive and must match exactly
- Ensure template is approved in Meta Business Manager
- Verify mobile numbers include country code
- Check that Media ID hasn't expired

## License

MIT License

## Disclaimer

This tool is for legitimate marketing purposes only. Ensure you:
- Have recipient consent
- Comply with local regulations and WhatsApp Business Policy
- Respect opt-out requests
