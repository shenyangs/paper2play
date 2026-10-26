export const MAX_PDF_BYTES = 5 * 1024 * 1024;
export function validatePdfSize(size: number) { if (size > MAX_PDF_BYTES) throw new Error('PDF 超过 5 MB 大小限制。'); }
export function logistic(t:number,K:number,A:number,r:number) {
 if (![t,K,A,r].every(Number.isFinite) || t<0 || K<=0 || A<=0 || r<=0) throw new Error('参数必须为有限正数，时间不能小于零。');
 return K/(1+A*Math.exp(-r*t));
}
export function detect(text:string) {
 const normalized=text.toLowerCase().replace(/−/g,'-').replace(/\s/g,'');
 return normalized.includes('p(t)=k/(1+a*exp(-r*t))');
}
export function evidence(pages:string[],kind:string) {
 const index=pages.findIndex(detect);
 if(index<0) throw new Error('暂不支持此公式。仅识别 P(t)=K/(1+A*exp(-r*t))，可点击“载入示例”体验自编演示资料。');
 const text=pages[index];
 return {family:'Logistic 增长方程',kind,page:kind==='pdf'?index+1:null,snippet:text,formula:'P(t) = K / (1 + A × exp(−r × t))'};
}
