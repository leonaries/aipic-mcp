#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  TextContent,
  ImageContent
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

interface GenerateImageArgs {
  prompt: string;
  width?: number;
  height?: number;
  outputPath?: string;
  apiKey?: string;
}

interface DashScopeResponse {
  output: {
    task_id: string;
    task_status: string;
    results?: Array<{
      url: string;
    }>;
  };
  usage?: any;
  request_id: string;
}

interface DashScopeTaskResponse {
  output: {
    task_id: string;
    task_status: string;
    results?: Array<{
      url: string;
    }>;
    message?: string;
  };
  usage?: any;
  request_id: string;
}

class AIPicMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'aipic-mcp-server',
        version: '1.0.1',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_web_image',
          description: 'Generate AI images for web design using Alibaba Cloud DashScope FLUX model. Perfect for creating placeholder images, hero images, product images, and other web assets.',
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
                description: 'Alibaba Cloud DashScope API key for authentication (can also be set via MODELSCOPE_API_KEY environment variable)',
              },
            },
            required: ['prompt'],
          },
        } as Tool,
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'generate_web_image') {
        return await this.handleGenerateImage(args as unknown as GenerateImageArgs);
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  private async handleGenerateImage(args: GenerateImageArgs) {
    try {
      const {
        prompt,
        width = 1024,
        height = 1024,
        outputPath,
        apiKey
      } = args;

      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt is required and cannot be empty');
      }

      // Get API key from parameter or environment variable
      const effectiveApiKey = apiKey || process.env.MODELSCOPE_API_KEY;
      
      if (!effectiveApiKey || effectiveApiKey.trim().length === 0) {
        throw new Error('API key is required. Please provide it as a parameter or set MODELSCOPE_API_KEY environment variable.');
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
          } as TextContent,
          {
            type: 'image',
            data: processedImage.toString('base64'),
            mimeType: 'image/jpeg'
          } as ImageContent
        ],
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        content: [
          {
            type: 'text',
            text: `Error generating image: ${errorMessage}`
          } as TextContent
        ],
        isError: true,
      };
    }
  }

  private async generateImageWithDashScope(prompt: string, apiKey: string, width: number, height: number): Promise<string> {
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
      // Submit the task
      const response = await axios.post<DashScopeResponse>(
        url, 
        payload, 
        { 
          headers,
          timeout: 10000 // 10 seconds timeout for task submission
        }
      );

      if (!response.data?.output?.task_id) {
        throw new Error('Failed to submit image generation task - no task ID received');
      }

      const taskId = response.data.output.task_id;
      console.error(`Image generation task submitted: ${taskId}`);

      // Poll for task completion
      const imageUrl = await this.pollTaskCompletion(taskId, apiKey);
      return imageUrl;
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your DashScope API key.');
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please try again.');
        } else {
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

  private async pollTaskCompletion(taskId: string, apiKey: string): Promise<string> {
    const maxAttempts = 30; // Max 5 minutes (10 seconds * 30)
    const pollInterval = 10000; // 10 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get<DashScopeTaskResponse>(
          `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
            timeout: 10000
          }
        );

        const { task_status, results, message } = response.data.output;

        if (task_status === 'SUCCEEDED' && results && results.length > 0) {
          console.error(`Image generation completed successfully`);
          return results[0].url;
        } else if (task_status === 'FAILED') {
          throw new Error(`Image generation failed: ${message || 'Unknown error'}`);
        } else if (task_status === 'PENDING' || task_status === 'RUNNING') {
          console.error(`Task ${taskId} is ${task_status.toLowerCase()}, waiting...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        } else {
          throw new Error(`Unknown task status: ${task_status}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to check task status: ${error.message}`);
        }
        throw error;
      }
    }

    throw new Error('Image generation timeout. The task took too long to complete.');
  }

  private async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      return Buffer.from(response.data);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to download image: ${error.message}`);
      }
      throw error;
    }
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AI Picture MCP Server v1.0.1 running on stdio (DashScope API)');
  }
}

const server = new AIPicMCPServer();
server.run().catch(console.error);