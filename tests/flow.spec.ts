import {test,expect} from '@playwright/test';
test('fixture to computed curve with source evidence',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Load example'}).click();
 await expect(page.getByText('Logistic growth recognized')).toBeVisible();
 const before=await page.getByTestId('chart-data').textContent();
 await expect(page.getByTestId('midpoint')).toHaveText('69.057');
 await page.getByRole('slider',{name:'r',exact:true}).fill('0.6');
 await expect(page.getByTestId('midpoint')).toHaveText('97.818');
 const after=await page.getByTestId('chart-data').textContent();expect(after).not.toBe(before);
 const data=JSON.parse(after!);expect(data[50].p).toBeCloseTo(100/(1+9*Math.exp(-6)),8);
 await page.getByRole('button',{name:'Show source'}).click();await expect(page.getByTestId('source-snippet')).toContainText('self-authored demonstration');
 await page.screenshot({path:'artifacts/curve-evidence.png',fullPage:true});
});
test('unsupported input never unlocks simulator',async({page})=>{
 await page.goto('/');await page.getByRole('textbox',{name:'Paper text'}).fill('E = mc²');await page.getByRole('button',{name:'Analyze text'}).click();
 await expect(page.getByRole('alert')).toContainText('Unsupported equation');await expect(page.getByRole('slider')).toHaveCount(0);
});
test('PDF extraction reports real second page, invalid and oversized uploads rejected',async({page,request})=>{
 await page.goto('/');await page.getByLabel('Upload PDF').setInputFiles('fixtures/logistic.pdf');
 await expect(page.getByText('PDF · PAGE 2')).toBeVisible();await page.getByRole('button',{name:'Show source'}).click();await expect(page.getByTestId('source-snippet')).toContainText('P(t)=K/(1+A*exp(-r*t))');
 const invalid=await request.post('/api/extract/pdf',{headers:{'Content-Type':'application/pdf'},data:Buffer.from('not PDF')});expect(invalid.status()).toBe(422);
 const oversized=await request.post('/api/extract/pdf',{headers:{'Content-Type':'application/pdf'},data:Buffer.alloc(5*1024*1024+1)});expect(oversized.status()).toBe(413);
});

test('pasted source and all parameter controls update results',async({page})=>{
 await page.goto('/');await page.getByRole('textbox',{name:'Paper text'}).fill('My note: P(t)=K/(1+A*exp(-r*t))');await page.getByRole('button',{name:'Analyze text'}).click();
 await expect(page.getByText('PASTED TEXT',{exact:true})).toBeVisible();
 await page.getByRole('slider',{name:'A',exact:true}).fill('4');
 await expect(page.getByTestId('midpoint')).toHaveText('83.393');
 await page.getByRole('button',{name:'Show source'}).click();await expect(page.getByTestId('source-snippet')).toHaveText('My note: P(t)=K/(1+A*exp(-r*t))');
 await page.getByLabel('Upload PDF').setInputFiles({name:'too-large.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(5*1024*1024+1)});
 await expect(page.getByRole('alert')).toHaveText('PDF exceeds the 5 MB limit.');await expect(page.getByRole('slider')).toHaveCount(0);
});
