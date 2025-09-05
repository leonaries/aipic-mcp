# AI Picture MCP Server

[![NPM Version](https://img.shields.io/npm/v/aipic-mcp)](https://www.npmjs.com/package/aipic-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/leonaries/aipic-mcp)](https://github.com/leonaries/aipic-mcp/stargazers)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A Model Context Protocol (MCP) server that provides AI-powered image generation capabilities specifically designed for web design workflows. This server integrates with ModelScope's FLUX model to generate high-quality images based on English prompts, perfect for creating placeholder images, hero images, product mockups, and other web assets.

## 🚀 Quick Start

```bash
npx aipic-mcp
```

## ✨ Features

- **AI Image Generation**: Generate images using ModelScope's FLUX model with natural language prompts
- **Web-Optimized Output**: Automatically optimizes images for web use with proper compression and sizing  
- **Flexible Sizing**: Support for custom width and height specifications
- **Base64 Encoding**: Returns images in base64 format for direct use in web applications
- **Error Handling**: Comprehensive error handling for API issues, network problems, and invalid inputs
- **Security**: API keys are passed by the client, not hardcoded in the server

## 📦 Installation & Usage

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

If you want to contribute to the project or customize it:

1. Clone this repository:
```bash
git clone https://github.com/leonaries/aipic-mcp.git
cd aipic-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Test locally:
```bash
npm run dev
```

**Claude Desktop Configuration for Local Development:**
```json
{
  "mcpServers": {
    "aipic": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/Users/your-username/path/to/aipic-mcp"
    }
  }
}
```

> **Note**: Replace `/Users/your-username/path/to/aipic-mcp` with the actual path where you cloned the repository.

## ⚙️ Configuration

### Claude Desktop Setup

Add the server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Choose one of the configuration options above based on your installation method.

### ModelScope API Key

You'll need a ModelScope API key to use this server. Get one from [ModelScope](https://www.modelscope.cn/).

## 🎯 Usage

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

## 🔧 API Integration Details

This server uses the ModelScope Inference API with the following configuration:
- **Model**: `MusePublic/489_ckpt_FLUX_1` (FLUX.1 model)
- **Endpoint**: `https://api-inference.modelscope.cn/v1/images/generations`
- **Authentication**: Bearer token (your API key)
- **Timeout**: 60 seconds for generation, 30 seconds for download

## 🛡️ Error Handling

The server handles various error conditions:
- Invalid or missing API keys
- Rate limiting from ModelScope API
- Network timeouts and connectivity issues  
- Invalid image URLs or download failures
- File system errors when saving images

## 🔨 Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Testing

```bash
npm test
```

### Publishing to NPM

The project is already published to NPM. For maintainers:

```bash
npm run build
npm publish
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔒 Security Considerations

- API keys are passed as parameters by the client, never hardcoded
- Images are saved to the local filesystem under the current working directory
- Network requests have appropriate timeouts to prevent hanging
- Input validation prevents empty prompts and missing required parameters

## 📚 Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `axios`: HTTP client for API requests
- `sharp`: Image processing and optimization
- `uuid`: Unique ID generation for filenames

## 🐛 Troubleshooting

### Common Issues

1. **"Command not found" error**
   - Make sure you have Node.js 18+ installed
   - Try running `npx aipic-mcp` instead of global installation

2. **API key errors**
   - Verify your ModelScope API key is valid
   - Check that you have sufficient quota on your ModelScope account

3. **Image generation timeout**
   - ModelScope API can be slow during peak hours
   - Try again with a simpler prompt
   - Check your internet connection

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **NPM Package**: https://www.npmjs.com/package/aipic-mcp
- **GitHub Repository**: https://github.com/leonaries/aipic-mcp
- **ModelScope**: https://www.modelscope.cn/
- **Model Context Protocol**: https://modelcontextprotocol.io/

---

**🌟 Star this repository if you find it useful!**
