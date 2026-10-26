import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {diagnoseNodeVersion,NODE_RANGE} from '../scripts/node-version.mjs';

describe('Node.js 版本边界诊断（setup 与 doctor 共用）',()=>{
 it.each([
  ['21.9.0',false],['22.12.99',false],['22.13.0',true],['22.13.1',true],
  ['22.99.0',true],['23.0.0',false],['23.99.0',false],['24.0.0',true],
  ['24.99.0',true],['25.0.0',false],['25.99.0',false],['26.0.0',true],
  ['26.4.0',true],['27.0.0',true],['26.0.0-rc.1',false],['invalid',false],
 ])('%s 的支持状态为 %s',(version,supported)=>{
  const result=diagnoseNodeVersion(version);
  expect(result.supported).toBe(supported);
  expect(result.message).toContain(NODE_RANGE);
  expect(result.message).toContain('推荐 Node.js 24 LTS');
  if(!supported)expect(result.message).toContain('当前版本不受支持');
 });
 it('声明、锁文件与诊断使用同一支持范围',()=>{
  const pkg=JSON.parse(readFileSync('package.json','utf8'));
  const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
  expect(pkg.engines.node).toBe(NODE_RANGE);
  expect(lock.packages[''].engines.node).toBe(NODE_RANGE);
 });
});
