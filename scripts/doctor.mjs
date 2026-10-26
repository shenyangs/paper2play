import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {createRequire} from 'node:module';
import net from 'node:net';
import {diagnoseNodeVersion} from './node-version.mjs';

const root=process.cwd();
let failures=0;
function report(ok,message){console.log(`${ok?'✓':'✗'} ${message}`);if(!ok)failures++;}
const nodeVersion=diagnoseNodeVersion(process.versions.node);
report(nodeVersion.supported,nodeVersion.message);
if(!nodeVersion.supported)process.exit(1);
let ready=true;
let pkg;
try{pkg=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));}catch{report(false,'当前目录缺少 package.json，请进入 Paper2Play 项目目录再运行。');process.exit(1);}
for(const name of Object.keys({...pkg.dependencies,...pkg.devDependencies})){
 if(!existsSync(resolve(root,'node_modules',name,'package.json'))){report(false,`缺少依赖 ${name}，请运行 npm ci 或 npm run setup。`);ready=false;}
}
if(ready)report(true,'项目依赖齐全。');
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(root,'.browsers');
if(ready){
 try{
  const require=createRequire(resolve(root,'package.json'));
  const {chromium}=require('playwright');
  const browser=await chromium.launch({headless:true,timeout:8000,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
  await browser.close();report(true,'Chromium 可以启动（仅本地空白浏览器探测）。');
  const metadata=JSON.parse(readFileSync(join(dirname(require.resolve('playwright-core/package.json')),'browsers.json'),'utf8'));
  const ffmpeg=metadata.browsers.find(b=>b.name==='ffmpeg');
  const folder=resolve(process.env.PLAYWRIGHT_BROWSERS_PATH,`ffmpeg-${ffmpeg.revision}`);
  report(existsSync(folder)&&readdirSync(folder).some(n=>n.startsWith('ffmpeg-')), '录屏编码器 FFmpeg：缺少时运行 npm run browsers:install。');
 }catch{report(false,'浏览器无法启动或录屏依赖不完整。请运行 npm run browsers:install；复用缓存时检查 PLAYWRIGHT_EXECUTABLE_PATH。网页本身不依赖自动化浏览器。');}
}else{console.log('— 依赖不全，跳过浏览器探测。无需配置任何 API Key。');}
for(const port of [4209,5209]){
 const available=await new Promise(resolveResult=>{const server=net.createServer();server.once('error',()=>resolveResult(false));server.listen(port,'127.0.0.1',()=>server.close(()=>resolveResult(true)));});
 report(available,available?`端口 ${port} 可用。`:`端口 ${port} 已占用；若本项目已启动，这是正常现象。请先停止已有服务再复查，不会自动结束其他进程。`);
}
console.log(failures?`发现 ${failures} 项待处理，请按上方提示恢复。`:'环境检查通过。运行 npm run dev，然后打开 http://127.0.0.1:4209；无需 API Key。');
process.exitCode=failures?1:0;
