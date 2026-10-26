import {test,expect} from '@playwright/test';
test('fixture to computed curve with source evidence',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'载入示例'}).click();
 await expect(page.getByText('已识别 Logistic 增长方程')).toBeVisible();
 const before=await page.getByTestId('chart-data').textContent();
 await expect(page.getByTestId('midpoint')).toHaveText('69.057');
 await page.getByRole('slider',{name:'r 增长速率',exact:true}).fill('0.6');
 await expect(page.getByTestId('midpoint')).toHaveText('97.818');
 const after=await page.getByTestId('chart-data').textContent();expect(after).not.toBe(before);
 const data=JSON.parse(after!);expect(data[50].p).toBeCloseTo(100/(1+9*Math.exp(-6)),8);
 await page.getByRole('button',{name:'查看来源'}).click();await expect(page.getByTestId('source-snippet')).toContainText('自编演示资料');
 await page.screenshot({path:'artifacts/zh-curve-evidence.png',fullPage:true});
});
test('unsupported input never unlocks simulator',async({page})=>{
 await page.goto('/');await page.getByRole('textbox',{name:'论文或公式文本'}).fill('E = mc²');await page.getByRole('button',{name:'识别文本'}).click();
 await expect(page.getByRole('alert')).toContainText('暂不支持此公式');await expect(page.getByRole('slider')).toHaveCount(0);
});
test('PDF extraction reports real second page, invalid and oversized uploads rejected',async({page,request})=>{
 await page.goto('/');await page.getByLabel('上传 PDF').setInputFiles('fixtures/logistic.pdf');
 await expect(page.getByText('PDF 文件 · 第 2 页')).toBeVisible();await page.getByRole('button',{name:'查看来源'}).click();await expect(page.getByTestId('source-snippet')).toContainText('P(t)=K/(1+A*exp(-r*t))');
 const invalid=await request.post('/api/extract/pdf',{headers:{'Content-Type':'application/pdf'},data:Buffer.from('not PDF')});expect(invalid.status()).toBe(422);
 const oversized=await request.post('/api/extract/pdf',{headers:{'Content-Type':'application/pdf'},data:Buffer.alloc(5*1024*1024+1)});expect(oversized.status()).toBe(413);
});

test('pasted source and all parameter controls update results',async({page})=>{
 await page.goto('/');await page.getByRole('textbox',{name:'论文或公式文本'}).fill('My note: P(t)=K/(1+A*exp(-r*t))');await page.getByRole('button',{name:'识别文本'}).click();
 await expect(page.getByText('粘贴文本',{exact:true})).toBeVisible();
 await page.getByRole('slider',{name:'A 初始条件系数',exact:true}).fill('4');
 await expect(page.getByTestId('midpoint')).toHaveText('83.393');
 await page.getByRole('button',{name:'查看来源'}).click();await expect(page.getByTestId('source-snippet')).toHaveText('My note: P(t)=K/(1+A*exp(-r*t))');
 await page.getByLabel('上传 PDF').setInputFiles({name:'too-large.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(5*1024*1024+1)});
 await expect(page.getByRole('alert')).toHaveText('PDF 超过 5 MB 大小限制。');await expect(page.getByRole('slider')).toHaveCount(0);
});

test('中文小屏、键盘滑块与焦点可用',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
 const load=page.getByRole('button',{name:'载入示例'});await load.focus();await expect(load).toBeFocused();await page.keyboard.press('Enter');
 const slider=page.getByRole('slider',{name:'r 增长速率',exact:true});await expect(slider).toBeVisible();await slider.focus();await page.keyboard.press('ArrowRight');
 await expect(slider).toHaveValue('0.35');await expect(page.getByTestId('midpoint')).toHaveText((100/(1+9*Math.exp(-3.5))).toFixed(3));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.getByRole('button',{name:'查看来源'}).click();await expect(page.getByTestId('source-snippet')).toContainText('自编演示资料');
 await page.screenshot({path:'artifacts/zh-mobile.png',fullPage:true});
});
test('忙碌状态与连接失败均有中文反馈且能重试',async({page})=>{
 await page.route('**/api/example',async route=>{await new Promise(resolve=>setTimeout(resolve,500));await route.abort();});
 await page.goto('/');const button=page.getByRole('button',{name:'载入示例'});await button.click();
 await expect(page.getByRole('status')).toContainText('正在提取来源文字');await expect(button).toBeDisabled();
 await expect(page.getByRole('alert')).toHaveText('连接失败，请确认 API 已启动后重试。');await expect(button).toBeEnabled();
 await page.unroute('**/api/example');await button.click();await expect(page.getByTestId('midpoint')).toHaveText('69.057');
});
