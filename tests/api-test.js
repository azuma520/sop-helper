#!/usr/bin/env node

/**
 * API 測試腳本
 * 
 * 用於測試 AI SOP MVP 的 API 端點
 * 
 * 使用方法：
 *   node tests/api-test.js [--base-url=http://localhost:3000] [--token=your-jwt-token]
 * 
 * 環境變數：
 *   API_BASE_URL: API 基礎 URL（預設: http://localhost:3000/api/v1）
 *   JWT_TOKEN: JWT 認證 Token（如果沒有提供，會跳過需要認證的測試）
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// 解析命令列參數
const args = process.argv.slice(2);
const options = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
  token: process.env.JWT_TOKEN || null,
};

args.forEach(arg => {
  if (arg.startsWith('--base-url=')) {
    options.baseUrl = arg.split('=')[1];
  } else if (arg.startsWith('--token=')) {
    options.token = arg.split('=')[1];
  }
});

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP 請求函數
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, options.baseUrl);
    const requestModule = url.protocol === 'https:' ? https : http;

    const requestOptions = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (options.token) {
      requestOptions.headers['Authorization'] = `Bearer ${options.token}`;
    }

    const req = requestModule.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed || body,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 測試案例
const tests = [];

// 測試 1: Health Check（如果有的話）
tests.push({
  name: 'Health Check',
  run: async () => {
    try {
      const response = await makeRequest('GET', '/health');
      if (response.status === 200 || response.status === 404) {
        return { success: true, message: `Status: ${response.status}` };
      }
      return { success: false, message: `Unexpected status: ${response.status}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
});

// 測試 2: Swagger Docs
tests.push({
  name: 'Swagger Documentation',
  run: async () => {
    try {
      const response = await makeRequest('GET', '/docs', null, {
        'Accept': 'text/html',
      });
      if (response.status === 200 || response.status === 301 || response.status === 302) {
        return { success: true, message: 'Swagger docs accessible' };
      }
      return { success: false, message: `Unexpected status: ${response.status}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
});

// 測試 3: Conversation Parse（需要認證）
tests.push({
  name: 'Conversation Parse API',
  requiresAuth: true,
  run: async () => {
    try {
      const response = await makeRequest('POST', '/conversation/parse', {
        text: '我需要建立一個資料庫備份的 SOP，包含檢查連線、執行備份、驗證完整性三個步驟',
        context: {
          existingTags: {
            domain: 'ops',
          },
        },
      });

      if (response.status === 200 || response.status === 201) {
        const hasSopDraft = response.body && response.body.sopDraft;
        const hasActions = response.body?.sopDraft?.actionDrafts?.length > 0;

        if (hasSopDraft && hasActions) {
          return {
            success: true,
            message: `成功解析，產生 ${response.body.sopDraft.actionDrafts.length} 個行動卡`,
            data: {
              draftId: response.body.sopDraft.draftId,
              title: response.body.sopDraft.title,
              actionCount: response.body.sopDraft.actionDrafts.length,
              promptVersion: response.body.promptVersion,
            },
          };
        }
        return { success: false, message: '回應格式不正確', data: response.body };
      }

      if (response.status === 401) {
        return { success: false, message: '認證失敗，請提供有效的 JWT Token' };
      }

      return { success: false, message: `Unexpected status: ${response.status}`, data: response.body };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
});

// 測試 4: SOP List（需要認證）
tests.push({
  name: 'SOP List API',
  requiresAuth: true,
  run: async () => {
    try {
      const response = await makeRequest('GET', '/sops?limit=10');

      if (response.status === 200) {
        const hasItems = Array.isArray(response.body.items) || Array.isArray(response.body);
        return {
          success: true,
          message: hasItems
            ? `成功取得 SOP 列表（${hasItems ? (response.body.items || response.body).length : 0} 筆）`
            : '成功取得 SOP 列表',
          data: response.body,
        };
      }

      if (response.status === 401) {
        return { success: false, message: '認證失敗，請提供有效的 JWT Token' };
      }

      return { success: false, message: `Unexpected status: ${response.status}`, data: response.body };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
});

// 測試 5: Tags Suggest（需要認證）
tests.push({
  name: 'Tags Suggest API',
  requiresAuth: true,
  run: async () => {
    try {
      const response = await makeRequest('POST', '/tags/suggest', {
        text: '這是一個關於資料庫備份的標準作業程序',
        context: {},
      });

      if (response.status === 200) {
        const hasSuggestions = response.body && response.body.suggestions;
        return {
          success: true,
          message: hasSuggestions
            ? `成功取得標籤建議（${response.body.suggestions.length} 個）`
            : '成功取得標籤建議',
          data: response.body,
        };
      }

      if (response.status === 401) {
        return { success: false, message: '認證失敗，請提供有效的 JWT Token' };
      }

      return { success: false, message: `Unexpected status: ${response.status}`, data: response.body };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
});

// 執行測試
async function runTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('AI SOP MVP API 測試', 'bright');
  log('='.repeat(60), 'cyan');
  log(`Base URL: ${options.baseUrl}`, 'cyan');
  log(`Token: ${options.token ? '已提供' : '未提供（將跳過需要認證的測試）'}`, 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const test of tests) {
    if (test.requiresAuth && !options.token) {
      log(`⏭  ${test.name} (跳過：需要認證)`, 'yellow');
      skipped++;
      continue;
    }

    log(`⏳ ${test.name}...`, 'blue');
    try {
      const result = await test.run();
      if (result.success) {
        log(`✅ ${test.name}`, 'green');
        if (result.message) {
          log(`   ${result.message}`, 'green');
        }
        if (result.data && process.env.VERBOSE) {
          log(`   Data: ${JSON.stringify(result.data, null, 2)}`, 'cyan');
        }
        passed++;
      } else {
        log(`❌ ${test.name}`, 'red');
        log(`   ${result.message}`, 'red');
        if (result.data && process.env.VERBOSE) {
          log(`   Response: ${JSON.stringify(result.data, null, 2)}`, 'yellow');
        }
        failed++;
      }
    } catch (error) {
      log(`❌ ${test.name}`, 'red');
      log(`   Error: ${error.message}`, 'red');
      failed++;
    }
    log('');
  }

  // 總結
  log('='.repeat(60), 'cyan');
  log('測試總結', 'bright');
  log('='.repeat(60), 'cyan');
  log(`✅ 通過: ${passed}`, 'green');
  log(`❌ 失敗: ${failed}`, 'red');
  log(`⏭  跳過: ${skipped}`, 'yellow');
  log(`📊 總計: ${passed + failed + skipped}`, 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  process.exit(failed > 0 ? 1 : 0);
}

// 執行
runTests().catch((error) => {
  log(`\n❌ 測試執行失敗: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

