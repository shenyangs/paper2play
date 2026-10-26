import express from 'express';
import { readFile } from 'node:fs/promises';
import { evidence,validatePdfSize } from '../shared/logistic';
const app=express();
app.get('/api/health',(_req,res)=>res.json({ok:true,project:'paper2play',mode:'heuristic'}));
app.get('/api/example',async(_req,res)=>res.json(evidence([await readFile(new URL('../fixtures/logistic.txt',import.meta.url),'utf8')],'fixture')));
app.post('/api/extract/text',express.json({limit:'100kb'}),(req,res)=>{
 try { if(typeof req.body?.text!=='string'||req.body.text.length>50000) throw new Error('Provide at most 50,000 characters.'); res.json(evidence([req.body.text],'pasted text')); }catch(e){res.status(422).json({error:(e as Error).message});}
});
let extracting=false;
app.post('/api/extract/pdf',express.raw({type:'application/pdf',limit:'5mb'}),async(req,res)=>{
 let task:ReturnType<typeof import('pdfjs-dist/legacy/build/pdf.mjs').getDocument>|undefined;
 let timer:ReturnType<typeof setTimeout>|undefined;
 if(extracting){res.status(429).json({error:'A PDF is already being processed. Try again shortly.'});return;}
 extracting=true;
 try {
  if(!Buffer.isBuffer(req.body)) throw new Error('Upload a PDF using application/pdf.');
  validatePdfSize(req.body.length);
  if(req.body.subarray(0,5).toString()!=='%PDF-') throw new Error('Invalid PDF header.');
  const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
  task=getDocument({data:new Uint8Array(req.body),useSystemFonts:false});
  const parse=async()=>{const pdf=await task!.promise;if(pdf.numPages>40) throw new Error('PDF limit is 40 pages.');const pages:string[]=[];for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const content=await page.getTextContent();pages.push(content.items.map(item=>'str' in item?item.str:'').join(' '));}return evidence(pages,'pdf');};
  const result=await Promise.race([parse(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('PDF extraction timed out.')),15000);})]);res.json(result);
 } catch(e){res.status(422).json({error:(e as Error).message});}
 finally{if(timer)clearTimeout(timer);await task?.destroy();extracting=false;}
});
app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(err.type==='entity.too.large'?413:400).json({error:err.type==='entity.too.large'?'Upload exceeds size limit (PDF: 5 MB; text: 100 KB).':'Invalid request body.'}));
app.listen(5209,'127.0.0.1',()=>console.log('[paper2play] http://127.0.0.1:5209'));
