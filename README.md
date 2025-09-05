# AI Picture MCP Server

A Model Context Protocol (MCP) server that provides AI-powered image generation capabilities specifically designed for web design workflows. This server integrates with ModelScope's FLUX model to generate high-quality images based on English prompts, perfect for creating placeholder images, hero images, product mockups, and other web assets.

## Features

- **AI Image Generation**: Generate images using ModelScope's FLUX model with natural language prompts
- **Web-Optimized Output**: Automatically optimizes images for web use with proper compression and sizing  
- **Flexible Sizing**: Support for custom width and height specifications
- **Base64 Encoding**: Returns images in base64 format for direct use in web applications
- **Error Handling**: Comprehensive error handling for API issues, network problems, and invalid inputs
- **Security**: API keys are passed by the client, not hardcoded in the server

## Installation & Usage

### Option 1: NPX (Recommended)

Use directly with NPX without installation:

```bash
npx aipic-mcp
```

**Claude Desktop Configuration:**
```json
{
  "mcpServers": {
    "aipic": {
      "command": "npx",
      "args": ["aipic-mcp"]
    }
  }
}
```

### Option 2: Global Installation

```bash
npm install -g aipic-mcp
```

**Claude Desktop Configuration:**
```json
{
  "mcpServers": {
    "aipic": {
      "command": "aipic-mcp"
    }
  }
}
```

### Option 3: Local Development

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

**Claude Desktop Configuration:**
```json
{
  "mcpServers": {
    "aipic": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/your/aipic-mcp"
    }
  }
}
```

## Configuration

### Claude Desktop Setup

Add the server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Choose one of the configuration options above based on your installation method.

### ModelScope API Key

You'll need a ModelScope API key to use this server. Get one from [ModelScope](https://www.modelscope.cn/).

## Usage

The server provides one main tool:

### `generate_web_image`

Generates an AI image optimized for web design use.

**Parameters:**
- `prompt` (required): English description of the image to generate
- `apiKey` (required): Your ModelScope API key
- `width` (optional): Image width in pixels (default: 1024)
- `height` (optional): Image height in pixels (default: 1024)  
- `outputPath` (optional): Path where to save the image file

**Example prompts:**
- "A modern minimalist office workspace with laptop and coffee cup"
- "Abstract geometric background in blue and purple gradients"
- "Professional team meeting in a bright conference room"
- "E-commerce product photo of wireless headphones on white background"
- "Hero image of a mountain landscape at sunrise"

**Example usage in Claude:**
```
Generate a hero image for my website with the prompt "A sleek modern smartphone floating above a city skyline at dusk" using my ModelScope API key "your-api-key-here"
```

## API Integration Details

This server uses the ModelScope Inference API with the following configuration:
- **Model**: `MusePublic/489_ckpt_FLUX_1` (FLUX.1 model)
- **Endpoint**: `https://api-inference.modelscope.cn/v1/images/generations`
- **Authentication**: Bearer token (your API key)
- **Timeout**: 60 seconds for generation, 30 seconds for download

## Error Handling

The server handles various error conditions:
- Invalid or missing API keys
- Rate limiting from ModelScope API
- Network timeouts and connectivity issues  
- Invalid image URLs or download failures
- File system errors when saving images

## Development

Run in development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Security Considerations

- API keys are passed as parameters by the client, never hardcoded
- Images are saved to the local filesystem under the current working directory
- Network requests have appropriate timeouts to prevent hanging
- Input validation prevents empty prompts and missing required parameters

## Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `axios`: HTTP client for API requests
- `sharp`: Image processing and optimization
- `uuid`: Unique ID generation for filenames

## License

MIT License - see LICENSE file for details.