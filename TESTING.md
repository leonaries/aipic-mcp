# AI Picture MCP Server - 测试指南

## 测试概述

这份文档描述了如何测试 AI Picture MCP Server 的各种功能。

## 前置要求

1. 确保已安装依赖并构建项目：
```bash
npm install
npm run build
```

2. 确保有有效的 ModelScope API 密钥（用于实际图像生成测试）

## 测试方法

### 方法 1: 自动化测试脚本

运行完整的测试套件：

```bash
node test-mcp-server.js
```

这个脚本会测试：
- ✅ 服务器初始化
- ✅ 工具列表获取
- ✅ 图像生成工具调用机制
- ✅ 参数验证

**预期输出：**
```
🎉 所有测试通过! MCP服务器工作正常
```

### 方法 2: 手动测试

#### 启动服务器
```bash
node dist/index.js
```

#### 发送测试命令

1. **初始化：**
```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}
```

2. **列出工具：**
```json
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
```

3. **调用图像生成（需要真实API密钥）：**
```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"generate_web_image","arguments":{"prompt":"A beautiful sunset over mountains","apiKey":"YOUR_REAL_API_KEY","width":800,"height":600}}}
```

### 方法 3: Claude Desktop 集成测试

1. **配置 Claude Desktop：**

编辑 `claude_desktop_config.json`：
```json
{
  "mcpServers": {
    "aipic": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/Users/leon/Desktop/yideng/aipic-mcp"
    }
  }
}
```

2. **重启 Claude Desktop**

3. **测试对话：**
```
用户：使用 generate_web_image 工具，生成一张现代办公室的图片，prompt 是 "Modern office workspace with laptop and plants"，使用我的 API 密钥 "your-api-key"
```

## 测试结果解读

### 成功的测试结果

- **初始化成功：** 返回服务器信息和能力
- **工具列表：** 显示 `generate_web_image` 工具及其参数
- **图像生成：** 
  - 有效API密钥：返回图片路径和 base64 数据
  - 无效API密钥：返回 "Invalid API key" 错误
- **参数验证：** 缺少必需参数时返回相应错误

### 常见问题

1. **服务器无响应：**
   - 检查 Node.js 版本 (需要 18+)
   - 确保依赖已正确安装
   - 检查构建是否成功

2. **API 调用失败：**
   - 验证 ModelScope API 密钥
   - 检查网络连接
   - 确认 API 配额未用完

3. **图像保存失败：**
   - 检查文件系统权限
   - 确保目标目录存在

## 性能测试

### API 响应时间
- 初始化：< 100ms
- 工具列表：< 50ms  
- 图像生成：30-60秒（取决于 ModelScope API）

### 内存使用
- 基础运行：~50MB
- 处理图像时：+20-100MB（取决于图像大小）

## 安全测试

1. **API 密钥处理：**
   - 密钥不会被记录到日志
   - 密钥不会存储在服务器中
   - 错误响应不会泄露密钥信息

2. **输入验证：**
   - 空的或无效的 prompt 被拒绝
   - 参数类型验证正常工作
   - 恶意输入被适当处理

## 持续集成建议

在 CI/CD 流程中，可以运行：

```bash
# 基础功能测试（不需要API密钥）
npm test

# 完整集成测试（需要API密钥）
MODELSCOPE_API_KEY=your_key npm run test:integration
```

## 故障排除

### 常用调试命令

```bash
# 检查服务器是否响应
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node dist/index.js

# 检查构建
npm run build

# 清理重装
rm -rf node_modules package-lock.json && npm install
```

### 日志分析

服务器错误信息会输出到 stderr：
- 网络错误：检查连接和 API 端点
- 认证错误：验证 API 密钥
- 文件系统错误：检查权限和磁盘空间