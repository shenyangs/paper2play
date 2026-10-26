import {describe,it,expect} from 'vitest';
import {logistic,evidence,validatePdfSize,MAX_PDF_BYTES} from '../shared/logistic';
describe('logistic model and source boundaries',()=>{
 it('computes initial value exactly',()=>expect(logistic(0,100,9,.3)).toBe(10));
 it('grows monotonically while remaining bounded',()=>{let previous=0;for(let t=0;t<=20;t+=.2){const value=logistic(t,100,9,.3);expect(value).toBeGreaterThan(previous);expect(value).toBeLessThan(100);previous=value;}});
 it('rejects unsupported equations',()=>expect(()=>evidence(['E=mc²'],'pasted text')).toThrow('Unsupported equation'));
 it('preserves actual page and source snippet',()=>{const snippet='P(t)=K/(1+A*exp(-r*t))';expect(evidence(['Introduction',snippet],'pdf')).toMatchObject({page:2,snippet,kind:'pdf'});});
 it('enforces PDF size cap at its boundary',()=>{expect(()=>validatePdfSize(MAX_PDF_BYTES)).not.toThrow();expect(()=>validatePdfSize(MAX_PDF_BYTES+1)).toThrow('5 MB');});
 it('rejects invalid numerical parameters',()=>{expect(()=>logistic(0,-1,9,.3)).toThrow();expect(()=>logistic(0,100,9,NaN)).toThrow();});
});
