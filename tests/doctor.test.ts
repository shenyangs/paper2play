import {it,expect} from 'vitest';
import {mkdtempSync,writeFileSync,rmSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
it('缺少依赖时 doctor 给出中文恢复指引且退出非零',()=>{
 mkdirSync('artifacts',{recursive:true});const root=mkdtempSync(resolve('artifacts/doctor-missing-'));
 try{
  writeFileSync(join(root,'package.json'),JSON.stringify({dependencies:{react:'*'}}));
  const result=spawnSync(process.execPath,[resolve('scripts/doctor.mjs')],{cwd:root,encoding:'utf8'});
  writeFileSync('artifacts/logs/zh-doctor-missing.log',result.stdout+result.stderr);
  expect(result.status).toBe(1);expect(result.stdout).toContain('缺少依赖 react');expect(result.stdout).toContain('npm ci');expect(result.stdout).toContain('无需配置任何 API Key');expect(result.stderr).not.toContain('ERR_MODULE_NOT_FOUND');
 }finally{rmSync(root,{recursive:true,force:true});}
});
