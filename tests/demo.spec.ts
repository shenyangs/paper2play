import {test,expect} from '@playwright/test';
test('demo: source equation becomes a real interactive experiment',async({page})=>{
 await page.goto('/');await page.waitForTimeout(600);await page.getByRole('button',{name:'Load example'}).click();
 await expect(page.getByTestId('midpoint')).toHaveText('69.057');await page.getByRole('button',{name:'Show source'}).click();
 await expect(page.getByTestId('source-snippet')).toContainText('P(t)=K/(1+A*exp(-r*t))');await page.waitForTimeout(700);
 await page.getByRole('slider',{name:'r',exact:true}).fill('0.6');await expect(page.getByTestId('midpoint')).toHaveText('97.818');
 await page.getByRole('slider',{name:'K',exact:true}).fill('150');await expect(page.getByTestId('midpoint')).toHaveText('146.727');
 await page.locator('.recharts-surface').hover({position:{x:360,y:90}});await page.waitForTimeout(900);
 await page.screenshot({path:'artifacts/demo.png',fullPage:true});
});
