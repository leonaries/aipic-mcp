# 📦 NPM 发布指南

## 发布前准备

### 1. 确保代码质量

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test
```

### 2. 更新版本信息

根据变更类型更新版本：

```bash
# 修复bug: 1.0.0 -> 1.0.1  
npm version patch

# 新功能: 1.0.0 -> 1.1.0
npm version minor

# 重大变更: 1.0.0 -> 2.0.0  
npm version major
```

### 3. 更新README.md

确保README包含最新的：
- 安装说明
- 使用方法
- API文档
- 示例代码

## 发布到NPM

### 首次发布

1. **登录NPM账户:**
```bash
npm login
```

2. **检查包信息:**
```bash
npm pack --dry-run
```

3. **发布包:**
```bash
npm publish
```

### 后续版本发布

```bash
# 更新版本并发布
npm version patch && npm publish
```

## NPX 使用验证

发布成功后，用户可以通过以下方式使用：

### 直接运行
```bash
npx aipic-mcp
```

### Claude Desktop 配置
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

### 全局安装
```bash
npm install -g aipic-mcp
aipic-mcp
```

## 发布清单

- [ ] ✅ 代码构建成功
- [ ] ✅ 测试全部通过
- [ ] ✅ 版本号已更新
- [ ] ✅ README.md 已更新
- [ ] ✅ CHANGELOG.md 已更新（可选）
- [ ] ✅ 包信息检查正常
- [ ] ✅ NPM登录成功
- [ ] ✅ 发布成功
- [ ] ✅ NPX测试成功

## 发布后步骤

1. **创建Git标签:**
```bash
git tag v1.0.0
git push --tags
```

2. **更新GitHub Release**（如果有仓库）

3. **通知用户更新配置**

## 常见问题

### 包名冲突
如果`aipic-mcp`已被占用，可以：
- 使用 scoped package: `@yourusername/aipic-mcp`
- 选择其他名称: `aipic-mcp-server`, `ai-pic-mcp`

### 权限问题
```bash
# 检查登录状态
npm whoami

# 重新登录
npm logout && npm login
```

### 版本发布失败
```bash
# 检查当前版本
npm version

# 手动设置版本
npm version 1.0.1 --no-git-tag-version
```

## 包维护

### 定期更新依赖
```bash
npm audit
npm update
```

### 监控下载量
访问 https://www.npmjs.com/package/aipic-mcp

### 处理Issues
及时回复用户反馈和问题报告。