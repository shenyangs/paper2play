import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
const cli=resolve('node_modules/playwright/cli.js');
if(!existsSync(cli)){console.error('缺少 Playwright，请先运行 npm ci，再运行 npm run browsers:install。');process.exit(1);}
const executable=process.env.PLAYWRIGHT_EXECUTABLE_PATH;
if(executable&&!existsSync(executable)){console.error('PLAYWRIGHT_EXECUTABLE_PATH 指向的浏览器不存在，请修正路径或清除此环境变量。');process.exit(1);}
console.log(executable?'复用指定的 Chromium，仅准备匹配的 FFmpeg 录屏编码器。':'准备项目内 Chromium 无头浏览器与 FFmpeg，不安装系统组件。');
const result=spawnSync(process.execPath,[cli,'install',...(executable?['ffmpeg']:['chromium','--only-shell'])],{stdio:'inherit',env:{...process.env,PLAYWRIGHT_BROWSERS_PATH:process.env.PLAYWRIGHT_BROWSERS_PATH||resolve('.browsers')}});
if(result.error||result.status!==0)console.error('浏览器安装失败。请检查网络后重试；也可按 README 复用已有浏览器缓存。');
else console.log('浏览器组件准备完成。请运行 npm run doctor 验证启动。');
process.exit(result.status ?? 1);
