export const MAX_PDF_BYTES = 5 * 1024 * 1024;
export function validatePdfSize(size: number) { if (size > MAX_PDF_BYTES) throw new Error('PDF exceeds the 5 MB limit.'); }
export function logistic(t:number,K:number,A:number,r:number) {
 if (![t,K,A,r].every(Number.isFinite) || t<0 || K<=0 || A<=0 || r<=0) throw new Error('Parameters must be finite and positive.');
 return K/(1+A*Math.exp(-r*t));
}
export function detect(text:string) {
 const normalized=text.toLowerCase().replace(/−/g,'-').replace(/\s/g,'');
 return normalized.includes('p(t)=k/(1+a*exp(-r*t))');
}
export function evidence(pages:string[],kind:string) {
 const index=pages.findIndex(detect);
 if(index<0) throw new Error('Unsupported equation. Only P(t)=K/(1+A*exp(-r*t)) is recognized. Choose the labelled demonstration sample to explore.');
 const text=pages[index];
 return {family:'Logistic growth',kind,page:kind==='pdf'?index+1:null,snippet:text,formula:'P(t) = K / (1 + A × exp(−r × t))'};
}
