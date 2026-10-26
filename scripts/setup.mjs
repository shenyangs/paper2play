import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {diagnoseNodeVersion} from './node-version.mjs';
const nodeVersion=diagnoseNodeVersion(process.versions.node);
if(!nodeVersion.supported){console.error(nodeVersion.message);process.exit(1);}
if(!process.env.npm_execpath){console.error('请通过 npm run setup 运行安装程序。');process.exit(1);}
function run(args){const result=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});if(result.error||result.status!==0){console.error('安装未完成。请检查网络连接和上方依赖安装日志，修复后重试。');process.exit(result.status??1);}}
console.log('正在按锁文件安装项目依赖，缓存仅写入 .npm-cache；不修改系统设置。');
run([process.env.npm_execpath,'ci','--cache',resolve('.npm-cache')]);
console.log('正在准备浏览器与录屏编码器；已存在的匹配缓存将复用。');
run(['scripts/install-browser.mjs']);
console.log('安装完成。下一步：npm run doctor，再运行 npm run dev。网页入口：http://127.0.0.1:4209');
