# AI Picture MCP Server

[![NPM Version](https://img.shields.io/npm/v/aipic-mcp)](https://www.npmjs.com/package/aipic-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/leonaries/aipic-mcp)](https://github.com/leonaries/aipic-mcp/stargazers)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A Model Context Protocol (MCP) server that provides AI-powered image generation capabilities specifically designed for web design workflows. This server integrates with **Alibaba Cloud DashScope's FLUX model** to generate high-quality images based on English prompts, perfect for creating placeholder images, hero images, product mockups, and other web assets.

## 🚀 Quick Start

```bash
npx -y aipic-mcp
```

## ✨ Features

- **AI Image Generation**: Generate images using Alibaba Cloud DashScope's FLUX model with natural language prompts
- **Web-Optimized Output**: Automatically optimizes images for web use with proper compression and sizing  
- **Flexible Sizing**: Support for custom width and height specifications
- **Base64 Encoding**: Returns images in base64 format for direct use in web applications
- **Async Processing**: Uses DashScope's async API for reliable image generation
- **Error Handling**: Comprehensive error handling for API issues, network problems, and invalid inputs
- **Security**: API keys can be configured via environment variables

## 📦 Installation & Usage

### Option 1: NPX (Recommended)

Use directly with NPX without installation:

```bash
npx -y aipic-mcp
```

**Claude Desktop Configuration:**
```json
{
  "mcpServers": {
    "aipic": {
      "command": "npx",
      "args": ["-y", "aipic-mcp"]
    }
  }
}
```

### Option 2: NPX with API Key Environment Variable (Recommended)

For convenience, you can configure your DashScope API key as an environment variable:

```json
{
  "mcpServers": {
    "aipic": {
      "command": "npx",
      "args": ["-y", "aipic-mcp"],
      "env": {
        "MODELSCOPE_API_KEY": "your-dashscope-api-key-here"
      }
    }
  }
}
```

**With full PATH (if using NVM or custom Node installation):**
```json
{
  "mcpServers": {
    "aipic": {
      "command": "/Users/your-username/.nvm/versions/node/v20.19.4/bin/npx",
      "args": ["-y", "aipic-mcp"],
      "env": {
        "MODELSCOPE_API_KEY": "your-dashscope-api-key-here",
        "PATH": "/Users/your-username/.nvm/versions/node/v20.19.4/bin:/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

### Option 3: Global Installation

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

**With API Key Environment Variable:**
```json
{
  "mcpServers": {
    "aipic": {
      "command": "aipic-mcp",
      "env": {
        "MODELSCOPE_API_KEY": "your-dashscope-api-key-here"
      }
    }
  }
}
```

### Option 4: Local Development

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
      "cwd": "/Users/your-username/path/to/aipic-mcp",
      "env": {
        "MODELSCOPE_API_KEY": "your-dashscope-api-key-here"
      }
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

### DashScope API Key

You'll need a **DashScope API key** from Alibaba Cloud to use this server. Get one from [Alibaba Cloud DashScope](https://dashscope.aliyun.com/).

**How to get your API key:**
1. Visit [Alibaba Cloud DashScope](https://dashscope.aliyun.com/)
2. Sign up/login to your account
3. Go to API Keys section
4. Create a new API key with image generation permissions
5. Copy the API key (format: `ms-xxxxxxxxxx`)

**Two ways to provide your API key:**

1. **Environment Variable (Recommended)**: Configure in Claude Desktop config as shown above
2. **Runtime Parameter**: Pass the API key when calling the tool (less convenient but more flexible)

## 🎯 Usage

The server provides one main tool:

### `generate_web_image`

Generates an AI image optimized for web design use.

**Parameters:**
- `prompt` (required): English description of the image to generate
- `apiKey` (optional): Your DashScope API key (if not set via environment variable)
- `width` (optional): Image width in pixels (default: 1024)
- `height` (optional): Image height in pixels (default: 1024)  
- `outputPath` (optional): Path where to save the image file

**Example prompts:**
- "A modern minimalist office workspace with laptop and coffee cup"
- "Abstract geometric background in blue and purple gradients"
- "Professional team meeting in a bright conference room"
- "E-commerce product photo of wireless headphones on white background"
- "Hero image of a mountain landscape at sunrise"

**Example usage in Claude (with environment variable configured):**
```
Generate a hero image for my website with the prompt "A sleek modern smartphone floating above a city skyline at dusk"
```

**Example usage in Claude (with manual API key):**
```
Generate a hero image for my website with the prompt "A sleek modern smartphone floating above a city skyline at dusk" using my DashScope API key "ms-your-api-key-here"
```

## 🔧 API Integration Details

This server uses the Alibaba Cloud DashScope API with the following configuration:
- **Model**: `flux-schnell` (FLUX.1 schnell model for fast generation)
- **Endpoint**: `https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis`
- **Authentication**: Bearer token (your DashScope API key)
- **Mode**: Async processing with task polling
- **Timeout**: 5 minutes for generation, 30 seconds for download

## 🛡️ Error Handling

The server handles various error conditions:
- Invalid or missing API keys
- Rate limiting from DashScope API
- Network timeouts and connectivity issues  
- Task generation failures
- Image download failures
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
npm version patch  # or minor/major
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

- API keys can be configured via environment variables for better security
- Images are saved to the local filesystem under the current working directory
- Network requests have appropriate timeouts to prevent hanging
- Input validation prevents empty prompts and missing required parameters
- Environment variables are more secure than hardcoded keys

## 📚 Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `axios`: HTTP client for API requests
- `sharp`: Image processing and optimization
- `uuid`: Unique ID generation for filenames

## 🐛 Troubleshooting

### Common Issues

1. **"Command not found" error**
   - Make sure you have Node.js 18+ installed
   - Try running `npx -y aipic-mcp` instead of global installation
   - If using NVM, specify the full path to npx in your configuration

2. **API key errors**
   - Verify your DashScope API key is valid (should start with `ms-`)
   - Check that you have sufficient quota on your Alibaba Cloud account
   - Ensure the API key is correctly configured in environment variables or passed as parameter
   - Make sure your API key has image generation permissions

3. **Image generation timeout**
   - DashScope API can take up to 2-3 minutes for complex prompts
   - Try again with a simpler prompt
   - Check your internet connection

4. **Environment variable not working**
   - Restart Claude Desktop after updating the configuration
   - Verify the JSON syntax in your configuration file
   - Check that the API key doesn't have extra spaces or quotes

5. **NPX installation issues**
   - Use the `-y` flag to automatically confirm installations
   - If using NVM, make sure your PATH is correctly set in the configuration

6. **Task generation failures**
   - The server uses async processing, so it may take a few moments
   - Check the console logs for detailed error messages
   - Ensure your prompt is in English for best results

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **NPM Package**: https://www.npmjs.com/package/aipic-mcp
- **GitHub Repository**: https://github.com/leonaries/aipic-mcp
- **Alibaba Cloud DashScope**: https://dashscope.aliyun.com/
- **Model Context Protocol**: https://modelcontextprotocol.io/

## 📝 Changelog

### v1.0.1
- 🔧 **BREAKING CHANGE**: Updated to use Alibaba Cloud DashScope API instead of ModelScope API
- ✨ Added async task processing for more reliable image generation
- 🐛 Fixed API authentication issues
- 📚 Updated documentation to reflect DashScope integration

### v1.0.0
- 🎉 Initial release with ModelScope integration

---

**🌟 Star this repository if you find it useful!**