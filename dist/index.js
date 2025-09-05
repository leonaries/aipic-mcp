#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
class AIPicMCPServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'aipic-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'generate_web_image',
                    description: 'Generate AI images for web design using ModelScope FLUX model. Perfect for creating placeholder images, hero images, product images, and other web assets.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            prompt: {
                                type: 'string',
                                description: 'English prompt describing the image to generate (e.g., "A modern office workspace with laptop and coffee")',
                            },
                            width: {
                                type: 'number',
                                description: 'Image width in pixels (default: 1024)',
                                default: 1024,
                            },
                            height: {
                                type: 'number',
                                description: 'Image height in pixels (default: 1024)',
                                default: 1024,
                            },
                            outputPath: {
                                type: 'string',
                                description: 'Optional path where to save the image (default: generated filename)',
                            },
                            apiKey: {
                                type: 'string',
                                description: 'ModelScope API key for authentication',
                            },
                        },
                        required: ['prompt', 'apiKey'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            if (name === 'generate_web_image') {
                return await this.handleGenerateImage(args);
            }
            throw new Error(`Unknown tool: ${name}`);
        });
    }
    async handleGenerateImage(args) {
        try {
            const { prompt, width = 1024, height = 1024, outputPath, apiKey } = args;
            if (!prompt || prompt.trim().length === 0) {
                throw new Error('Prompt is required and cannot be empty');
            }
            if (!apiKey || apiKey.trim().length === 0) {
                throw new Error('API key is required');
            }
            // Generate image using ModelScope API
            const imageUrl = await this.generateImageWithModelScope(prompt, apiKey);
            // Download and process the image
            const imageBuffer = await this.downloadImage(imageUrl);
            // Resize image if needed
            let processedImage = imageBuffer;
            if (width !== 1024 || height !== 1024) {
                processedImage = await sharp(imageBuffer)
                    .resize(width, height, { fit: 'cover' })
                    .jpeg({ quality: 90 })
                    .toBuffer();
            }
            // Save image
            const filename = outputPath || `web_image_${uuidv4().slice(0, 8)}.jpg`;
            const fullPath = join(process.cwd(), filename);
            // Ensure directory exists
            const dir = dirname(fullPath);
            if (!existsSync(dir)) {
                await mkdir(dir, { recursive: true });
            }
            await writeFile(fullPath, processedImage);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully generated web design image!\n\nPrompt: ${prompt}\nDimensions: ${width}x${height}px\nSaved to: ${fullPath}\n\nThe image has been optimized for web use and saved as a high-quality JPEG.`
                    },
                    {
                        type: 'image',
                        data: processedImage.toString('base64'),
                        mimeType: 'image/jpeg'
                    }
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error generating image: ${errorMessage}`
                    }
                ],
                isError: true,
            };
        }
    }
    async generateImageWithModelScope(prompt, apiKey) {
        const url = 'https://api-inference.modelscope.cn/v1/images/generations';
        const payload = {
            model: 'MusePublic/489_ckpt_FLUX_1',
            prompt: prompt
        };
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };
        try {
            const response = await axios.post(url, payload, {
                headers,
                timeout: 60000 // 60 seconds timeout
            });
            if (!response.data?.images?.[0]?.url) {
                throw new Error('Invalid response from ModelScope API - no image URL found');
            }
            return response.data.images[0].url;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Invalid API key. Please check your ModelScope API key.');
                }
                else if (error.response?.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout. The image generation took too long.');
                }
                else {
                    throw new Error(`ModelScope API error: ${error.response?.data?.message || error.message}`);
                }
            }
            throw error;
        }
    }
    async downloadImage(imageUrl) {
        try {
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to download image: ${error.message}`);
            }
            throw error;
        }
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('AI Picture MCP Server running on stdio');
    }
}
const server = new AIPicMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map