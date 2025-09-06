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
            version: '1.0.3',
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
                    description: 'Generate AI images for web design using FLUX model via DashScope API. Perfect for creating placeholder images, hero images, product images, and other web assets.',
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
                                description: 'DashScope API key for authentication (can also be set via DASHSCOPE_API_KEY environment variable)',
                            },
                        },
                        required: ['prompt'],
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
            // Get API key from parameter or environment variables (prefer DASHSCOPE_API_KEY, fallback to MODELSCOPE_API_KEY for compatibility)
            const effectiveApiKey = apiKey || process.env.DASHSCOPE_API_KEY || process.env.MODELSCOPE_API_KEY;
            if (!effectiveApiKey || effectiveApiKey.trim().length === 0) {
                throw new Error('API key is required. Please provide it as a parameter or set DASHSCOPE_API_KEY environment variable.');
            }
            // Generate image using DashScope API
            const imageUrl = await this.generateImageWithDashScope(prompt, effectiveApiKey, width, height);
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
            // Save image with a more reliable path strategy
            let finalPath;
            if (outputPath) {
                finalPath = outputPath;
            }
            else {
                // Try to save to user's Desktop, fallback to temp directory
                const filename = `web_image_${uuidv4().slice(0, 8)}.jpg`;
                const possiblePaths = [
                    `/Users/${process.env.USER || 'user'}/Desktop/${filename}`,
                    `/tmp/${filename}`,
                    join(process.cwd(), filename)
                ];
                finalPath = possiblePaths[0]; // Default to Desktop
                // Check if we can write to Desktop, otherwise use temp
                try {
                    const dir = dirname(finalPath);
                    if (!existsSync(dir)) {
                        finalPath = possiblePaths[1]; // Use /tmp
                    }
                }
                catch {
                    finalPath = possiblePaths[1]; // Use /tmp
                }
            }
            // Ensure directory exists
            const dir = dirname(finalPath);
            if (!existsSync(dir)) {
                await mkdir(dir, { recursive: true });
            }
            await writeFile(finalPath, processedImage);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully generated web design image!\n\nPrompt: ${prompt}\nDimensions: ${width}x${height}px\nSaved to: ${finalPath}\n\nThe image has been optimized for web use and saved as a high-quality JPEG.`
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
    async generateImageWithDashScope(prompt, apiKey, width, height) {
        const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
        // Format size as required by DashScope API
        const size = `${width}*${height}`;
        const payload = {
            model: 'flux-schnell', // Using the faster FLUX model
            input: {
                prompt: prompt
            },
            parameters: {
                size: size,
                seed: Math.floor(Math.random() * 1000000),
                steps: 4 // FLUX schnell typically uses 4 steps
            }
        };
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable' // Enable async mode for image generation
        };
        try {
            console.error('Generating image with DashScope API...');
            // Submit the task
            const response = await axios.post(url, payload, {
                headers,
                timeout: 10000 // 10 seconds timeout for task submission
            });
            if (!response.data?.output?.task_id) {
                throw new Error('Failed to submit image generation task - no task ID received');
            }
            const taskId = response.data.output.task_id;
            console.error(`Image generation task submitted: ${taskId}`);
            // Poll for task completion
            const imageUrl = await this.pollTaskCompletion(taskId, apiKey);
            return imageUrl;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Invalid API key. Please check your DashScope API key format and permissions.');
                }
                else if (error.response?.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout. Please try again.');
                }
                else {
                    const errorData = error.response?.data;
                    if (errorData?.code && errorData?.message) {
                        throw new Error(`DashScope API error: ${errorData.message} (Code: ${errorData.code})`);
                    }
                    throw new Error(`DashScope API error: ${error.response?.statusText || error.message}`);
                }
            }
            throw error;
        }
    }
    async pollTaskCompletion(taskId, apiKey) {
        const maxAttempts = 30; // Max 5 minutes (10 seconds * 30)
        const pollInterval = 10000; // 10 seconds
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await axios.get(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    timeout: 10000
                });
                const { task_status, results, message } = response.data.output;
                if (task_status === 'SUCCEEDED' && results && results.length > 0) {
                    console.error(`Image generation completed successfully`);
                    return results[0].url;
                }
                else if (task_status === 'FAILED') {
                    throw new Error(`Image generation failed: ${message || 'Unknown error'}`);
                }
                else if (task_status === 'PENDING' || task_status === 'RUNNING') {
                    console.error(`Task ${taskId} is ${task_status.toLowerCase()}, waiting...`);
                    await new Promise(resolve => setTimeout(resolve, pollInterval));
                    continue;
                }
                else {
                    throw new Error(`Unknown task status: ${task_status}`);
                }
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    throw new Error(`Failed to check task status: ${error.message}`);
                }
                throw error;
            }
        }
        throw new Error('Image generation timeout. The task took too long to complete.');
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
        console.error('AI Picture MCP Server v1.0.3 running on stdio (DashScope API)');
    }
}
const server = new AIPicMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map