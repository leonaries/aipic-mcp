# AI Picture MCP Server - Usage Examples

## Setup

1. Build the server:
```bash
npm install
npm run build
```

2. Configure in Claude Desktop by adding to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "aipic": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/aipic-mcp"
    }
  }
}
```

## Example Conversations

### Generate a Hero Image

**User:** Generate a hero image for my tech startup website with the prompt "Modern office with diverse team collaborating around a large monitor showing data visualizations" using width 1920 and height 1080

**Server Response:** The server will:
1. Accept your ModelScope API key
2. Call the FLUX model with the English prompt
3. Resize the image to 1920x1080
4. Save as a high-quality JPEG
5. Return both the file path and base64 encoded image

### Generate Product Images

**User:** Create a product image with prompt "Professional wireless headphones on a clean white background with soft lighting" using dimensions 800x600

### Generate Background Images

**User:** Generate an abstract background with prompt "Gradient mesh in blue and purple colors with geometric patterns" for size 1200x800

## API Integration Notes

- **Model**: Uses MusePublic/489_ckpt_FLUX_1 from ModelScope
- **Format**: Returns optimized JPEG images
- **Security**: API keys are provided by the client, never stored
- **Performance**: 60-second timeout for generation, 30-second for download
- **Error Handling**: Comprehensive error messages for debugging

## Common Use Cases

1. **Hero Images**: Large banner images for websites
2. **Product Mockups**: Clean product photography
3. **Background Graphics**: Abstract patterns and textures  
4. **Placeholder Content**: Temporary images during development
5. **Marketing Materials**: Social media and promotional graphics

## Tips for Better Prompts

- Be specific about style (modern, professional, minimalist)
- Include lighting details (soft, dramatic, natural)
- Specify background (white, transparent, gradient)
- Mention colors and mood
- Include composition notes (centered, rule of thirds)