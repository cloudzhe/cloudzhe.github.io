/**
 * Vercel Serverless Function: UAPI IP 归属地查询代理
 * 路由: /api/ipinfo
 * 功能: 转发浏览器请求到 UAPI (uapis.cn) 并附加 CORS 头，解决浏览器跨域限制
 * 依赖: 无（仅使用 Node.js 内置 https 模块）
 */

const https = require('https');
const url = require('url');

// UAPI 完整 API 地址
const UAPI_IPINFO_URL = 'https://uapis.cn/api/v1/network/ipinfo';

// 从环境变量读取 UAPI 密钥（Vercel Project Settings > Environment Variables）
const UAPI_KEY = process.env.UAPI_KEY || '';

/**
 * 构建请求头：有密钥时附加 Authorization: Bearer <KEY>
 * @returns {Object} 请求头对象
 */
function buildHeaders() {
  var headers = { 'Accept': 'application/json' };
  if (UAPI_KEY && UAPI_KEY.startsWith('uapi-')) {
    headers['Authorization'] = 'Bearer ' + UAPI_KEY;
  }
  return headers;
}

/**
 * 发送 JSON 响应并附加 CORS 头
 * @param {Object} res - Vercel response 对象
 * @param {number} statusCode - HTTP 状态码
 * @param {Object} body - 响应体
 */
function sendJson(res, statusCode, body) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = statusCode;
  res.end(JSON.stringify(body));
}

/**
 * 使用 https 模块发起 GET 请求
 * @param {string} targetUrl - 完整请求地址
 * @param {Object} headers - 请求头
 * @param {number} timeoutMs - 超时毫秒
 * @returns {Promise<{status: number, data: Object}>}
 */
function httpsGet(targetUrl, headers, timeoutMs) {
  return new Promise(function(resolve, reject) {
    var parsed = url.parse(targetUrl);
    var opts = {
      hostname: parsed.hostname,
      path: parsed.path,
      method: 'GET',
      headers: headers
    };
    var req = https.request(opts, function(resp) {
      var chunks = [];
      resp.on('data', function(c) { chunks.push(c); });
      resp.on('end', function() {
        var raw = Buffer.concat(chunks).toString('utf8');
        try {
          resolve({ status: resp.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: resp.statusCode, data: { raw: raw } });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, function() {
      req.destroy(new Error('UAPI 请求超时'));
    });
    req.end();
  });
}

/**
 * Vercel Serverless Function 入口
 * GET /api/ipinfo?ip=8.8.8.8
 * 如果不传 ip 参数，使用请求者的真实 IP（从 x-forwarded-for 提取）
 */
module.exports = async function handler(req, res) {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { code: 'METHOD_NOT_ALLOWED', message: '仅支持 GET 请求' });
    return;
  }

  // 从查询参数获取 IP，或从请求头提取访客 IP
  var query = url.parse(req.url, true).query;
  var ip = query.ip || '';

  if (!ip) {
    // 从 Vercel 请求头提取访客真实 IP
    var xff = req.headers['x-forwarded-for'];
    if (xff) {
      ip = xff.split(',')[0].trim();
    } else if (req.headers['x-real-ip']) {
      ip = req.headers['x-real-ip'];
    }
  }

  // 参数校验：检查是否为合法 IP 或域名
  if (!ip || ip.length < 3) {
    sendJson(res, 400, { code: 'INVALID_ARGUMENT', message: 'IP 参数无效' });
    return;
  }

  try {
    var result = await httpsGet(
      UAPI_IPINFO_URL + '?ip=' + encodeURIComponent(ip),
      buildHeaders(),
      8000
    );

    // 转发 UAPI 原始状态码和响应体
    sendJson(res, result.status, result.data);
  } catch (err) {
    sendJson(res, 500, {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'UAPI 请求失败: ' + (err.message || String(err))
    });
  }
};
