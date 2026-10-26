import express from 'express';
import { readFile } from 'node:fs/promises';
import { evidence,validatePdfSize } from '../shared/logistic';
const app=express();
app.get('/api/health',(_req,res)=>res.json({ok:true,project:'paper2play',mode:'heuristic'}));
app.get('/api/example',async(_req,res)=>res.json(evidence([await readFile(new URL('../fixtures/logistic.txt',import.meta.url),'utf8')],'fixture')));
app.post('/api/extract/text',express.json({limit:'100kb'}),(req,res)=>{
 try { if(typeof req.body?.text!=='string'||req.body.text.length>50000) throw new Error('请提供不超过 50,000 字符的文本。'); res.json(evidence([req.body.text],'pasted text')); }catch(e){res.status(422).json({error:(e as Error).message});}
});
let extracting=false;
app.post('/api/extract/pdf',express.raw({type:'application/pdf',limit:'5mb'}),async(req,res)=>{
 let task:ReturnType<typeof import('pdfjs-dist/legacy/build/pdf.mjs').getDocument>|undefined;
 let timer:ReturnType<typeof setTimeout>|undefined;
 if(extracting){res.status(429).json({error:'已有 PDF 正在处理，请稍后重试。'});return;}
 extracting=true;
 try {
  if(!Buffer.isBuffer(req.body)) throw new Error('请上传 PDF 文件（application/pdf）。');
  validatePdfSize(req.body.length);
  if(req.body.subarray(0,5).toString()!=='%PDF-') throw new Error('PDF 文件格式无效，请换一个文件重试。');
  const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
  task=getDocument({data:new Uint8Array(req.body),useSystemFonts:false});
  const parse=async()=>{const pdf=await task!.promise;if(pdf.numPages>40) throw new Error('PDF 不能超过 40 页。');const pages:string[]=[];for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const content=await page.getTextContent();pages.push(content.items.map(item=>'str' in item?item.str:'').join(' '));}return evidence(pages,'pdf');};
  const result=await Promise.race([parse(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('PDF 提取超时，请缩小文件或改为粘贴文本。')),15000);})]);res.json(result);
 } catch(e){res.status(422).json({error: /[\u3400-\u9fff]/.test((e as Error).message)?(e as Error).message:'无法读取 PDF。请确认文件未加密、未损坏且包含可提取文字，或改为粘贴文本。'});}
 finally{if(timer)clearTimeout(timer);await task?.destroy();extracting=false;}
});
app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(err.type==='entity.too.large'?413:400).json({error:err.type==='entity.too.large'?'上传内容超限（PDF：5 MB；文本请求：100 KB）。':'请求格式无效，请检查输入后重试。'}));
const server=app.listen(5209,'127.0.0.1',()=>console.log('[paper2play] 网页入口：http://127.0.0.1:4209\n[paper2play] API 健康检查：http://127.0.0.1:5209/api/health\n[paper2play] 零 Key 演示：载入示例 → 调整参数 → 查看来源；未使用 AI 模型。'));
server.on('error',(error:NodeJS.ErrnoException)=>{console.error(error.code==='EADDRINUSE'?'API 端口 5209 已占用。请关闭占用它的服务，再运行 npm run doctor。':'API 启动失败，请运行 npm run doctor 检查环境。');process.exit(1);});
