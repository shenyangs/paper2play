import {test,expect} from '@playwright/test';
test('demo: source equation becomes a real interactive experiment',async({page})=>{
 await page.goto('/');await page.waitForTimeout(600);await page.getByRole('button',{name:'载入示例'}).click();
 await expect(page.getByTestId('midpoint')).toHaveText('69.057');await page.getByRole('button',{name:'查看来源'}).click();
 await expect(page.getByTestId('source-snippet')).toContainText('P(t)=K/(1+A*exp(-r*t))');await page.waitForTimeout(700);
 await page.getByRole('slider',{name:'r 增长速率',exact:true}).fill('0.6');await expect(page.getByTestId('midpoint')).toHaveText('97.818');
 await page.getByRole('slider',{name:'K 环境容量',exact:true}).fill('150');await expect(page.getByTestId('midpoint')).toHaveText('146.727');
 await page.locator('.recharts-surface').hover({position:{x:360,y:90}});await page.waitForTimeout(900);
 await page.screenshot({path:'artifacts/zh-demo.png',fullPage:false});
});
