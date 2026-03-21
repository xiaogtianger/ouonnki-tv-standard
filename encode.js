const fs = require('fs');
const bs58 = require('bs58');
const https = require('https');

const SOURCE_URL = 'https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/LunaTV-config.json';

const FIXED_JSON = 'ouonnki-tv-latest.json';
const FIXED_TXT  = 'ouonnki-tv-latest.txt';

console.log('开始从 hafrey1 下载并转换...');

https.get(SOURCE_URL, (res) => {
  if (res.statusCode !== 200) {
    console.error(`下载失败，状态码: ${res.statusCode}`);
    process.exit(1);
  }

  let rawData = '';
  res.on('data', chunk => { rawData += chunk; });
  res.on('end', () => {
    try {
      const original = JSON.parse(rawData);
      const apiSites = original.api_site || {};

      const now = new Date().toISOString();

      // 转换为标准数组格式
      const configArray = Object.entries(apiSites).map(([domain, info], index) => ({
        id: `site-${index + 1}`,
        name: info.name || domain,
        url: info.api,
        detailUrl: info.detail || `https://${domain}`,
        timeout: 5000,
        retry: 2,
        isEnabled: true,
        updatedAt: now
      }));

      const jsonString = JSON.stringify(configArray, null, 2);

      // 写入固定 JSON 文件（覆盖）
      fs.writeFileSync(FIXED_JSON, jsonString, 'utf8');

      // Base58 编码并写入 txt
      const buffer = Buffer.from(jsonString, 'utf8');
      const base58Str = bs58.encode(buffer);
      fs.writeFileSync(FIXED_TXT, base58Str, 'utf8');

      console.log(`转换完成`);
      console.log(`源数量: ${configArray.length}`);
      console.log(`更新时间: ${now}`);
      console.log(`生成文件: ${FIXED_JSON} 和 ${FIXED_TXT}`);
    } catch (err) {
      console.error('解析或写入失败:', err.message);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('网络请求失败:', err.message);
  process.exit(1);
});
