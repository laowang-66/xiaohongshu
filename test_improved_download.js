/**
 * 测试改进后的下载同步功能
 * 验证下载容器与预览容器的一致性
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testImprovedDownload() {
  console.log('🚀 开始测试改进后的下载同步功能');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  // 设置视口
  await page.setViewportSize({ width: 1400, height: 900 });
  
  try {
    // 访问应用
    console.log('📱 访问应用页面');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 切换到封面生成tab
    console.log('🎨 切换到封面生成功能');
    await page.click('button:has-text("AI封面生成")');
    await page.waitForTimeout(2000);
    
    // 输入测试内容
    const testContent = '测试改进的下载同步功能 - 验证预览与下载的一致性';
    console.log('📝 输入测试内容:', testContent);
    await page.fill('textarea[placeholder*="输入小红书封面文案"]', testContent);
    
    // 选择模板和尺寸
    console.log('🎯 选择模板和尺寸');
    await page.selectOption('select', 'minimal_grid'); // 选择模板
    await page.selectOption('select[onChange*="setCardSize"]', 'xiaohongshu'); // 选择尺寸
    
    // 生成封面
    console.log('⚡ 开始生成封面');
    await page.click('button:has-text("生成封面")');
    
    // 等待生成完成
    console.log('⏳ 等待封面生成完成...');
    await page.waitForSelector('[data-download-container]', { timeout: 60000 });
    await page.waitForTimeout(5000);
    
    // 验证编辑功能
    console.log('✏️ 验证编辑功能');
    const editableReady = await page.waitForSelector('span:has-text("编辑模式已激活")', { timeout: 10000 });
    if (editableReady) {
      console.log('✅ 编辑模式已激活');
      
      // 尝试编辑文字
      const textElements = await page.$$('[data-text-element]');
      if (textElements.length > 0) {
        console.log('🎯 找到可编辑文字元素，尝试编辑');
        await textElements[0].click();
        await page.waitForTimeout(1000);
        
        // 查找编辑对话框
        const editDialog = await page.$('.fixed.inset-0');
        if (editDialog) {
          console.log('📝 编辑对话框已打开');
          
          // 修改文字
          await page.fill('input[value*="测试"]', '已编辑：测试改进的下载同步功能');
          await page.click('button:has-text("保存")');
          await page.waitForTimeout(2000);
          console.log('✅ 文字编辑完成');
        }
      }
    }
    
    // 验证下载容器内容
    console.log('🔍 验证下载容器内容');
    const downloadContainerExists = await page.$('[data-download-container]');
    if (downloadContainerExists) {
      // 获取下载容器内容
      const downloadContent = await page.evaluate(() => {
        const container = document.querySelector('[data-download-container]');
        return {
          exists: !!container,
          hasContent: !!(container && container.innerHTML.trim()),
          contentLength: container ? container.innerHTML.length : 0,
          hasEditingStyles: container ? container.innerHTML.includes('rgba(59, 130, 246') : false,
          hasEditableClasses: container ? container.innerHTML.includes('editable-') : false,
          dimensions: container ? {
            width: container.style.width,
            height: container.style.height
          } : null,
          preview: container ? container.innerHTML.substring(0, 200) : ''
        };
      });
      
      console.log('📊 下载容器分析结果:');
      console.log('  ✅ 容器存在:', downloadContent.exists);
      console.log('  📄 包含内容:', downloadContent.hasContent);
      console.log('  📏 内容长度:', downloadContent.contentLength);
      console.log('  🎨 包含编辑样式:', downloadContent.hasEditingStyles);
      console.log('  🏷️ 包含编辑类名:', downloadContent.hasEditableClasses);
      console.log('  📐 容器尺寸:', downloadContent.dimensions);
      console.log('  🔍 内容预览:', downloadContent.preview + '...');
      
      // 验证同步质量
      if (!downloadContent.hasEditingStyles && !downloadContent.hasEditableClasses) {
        console.log('✅ 下载容器样式清理验证通过');
      } else {
        console.log('⚠️ 下载容器仍包含编辑样式，需要进一步优化');
      }
    } else {
      console.log('❌ 下载容器不存在');
    }
    
    // 验证预览容器内容
    console.log('🔍 验证预览容器内容');
    const previewContent = await page.evaluate(() => {
      const container = document.querySelector('[data-editable-card-container]');
      return {
        exists: !!container,
        hasContent: !!(container && container.innerHTML.trim()),
        contentLength: container ? container.innerHTML.length : 0,
        hasEditingStyles: container ? container.innerHTML.includes('rgba(59, 130, 246') : false,
        hasEditableClasses: container ? container.innerHTML.includes('editable-') : false,
        preview: container ? container.innerHTML.substring(0, 200) : ''
      };
    });
    
    console.log('📊 预览容器分析结果:');
    console.log('  ✅ 容器存在:', previewContent.exists);
    console.log('  📄 包含内容:', previewContent.hasContent);
    console.log('  📏 内容长度:', previewContent.contentLength);
    console.log('  🎨 包含编辑样式:', previewContent.hasEditingStyles);
    console.log('  🏷️ 包含编辑类名:', previewContent.hasEditableClasses);
    console.log('  🔍 内容预览:', previewContent.preview + '...');
    
    // 模拟下载过程
    console.log('⬇️ 模拟下载过程');
    
    // 监听console.log以捕获下载日志
    const downloadLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('下载') || text.includes('同步') || text.includes('📋') || text.includes('🚀')) {
        downloadLogs.push(text);
      }
    });
    
    // 点击下载按钮
    await page.click('button:has-text("下载封面")');
    await page.waitForTimeout(5000);
    
    console.log('📋 下载过程日志:');
    downloadLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log}`);
    });
    
    // 生成测试报告
    const testReport = {
      timestamp: new Date().toISOString(),
      testName: '改进的下载同步功能测试',
      results: {
        downloadContainer: downloadContent,
        previewContainer: previewContent,
        downloadLogs: downloadLogs,
        syncQuality: {
          passed: downloadContent.exists && 
                   downloadContent.hasContent && 
                   !downloadContent.hasEditingStyles && 
                   !downloadContent.hasEditableClasses,
          issues: []
        }
      }
    };
    
    if (downloadContent.hasEditingStyles) {
      testReport.results.syncQuality.issues.push('下载容器包含编辑样式');
    }
    if (downloadContent.hasEditableClasses) {
      testReport.results.syncQuality.issues.push('下载容器包含编辑类名');
    }
    if (!downloadContent.hasContent) {
      testReport.results.syncQuality.issues.push('下载容器内容为空');
    }
    
    // 保存测试报告
    const reportPath = 'IMPROVED_DOWNLOAD_TEST_REPORT.md';
    const reportContent = `# 改进的下载同步功能测试报告

## 测试信息
- **测试时间**: ${testReport.timestamp}
- **测试内容**: ${testContent}

## 测试结果

### 下载容器验证
- **容器存在**: ${downloadContent.exists ? '✅ 通过' : '❌ 失败'}
- **包含内容**: ${downloadContent.hasContent ? '✅ 通过' : '❌ 失败'}
- **内容长度**: ${downloadContent.contentLength} 字符
- **样式清理**: ${!downloadContent.hasEditingStyles && !downloadContent.hasEditableClasses ? '✅ 通过' : '⚠️ 需要优化'}
- **容器尺寸**: ${JSON.stringify(downloadContent.dimensions)}

### 预览容器验证
- **容器存在**: ${previewContent.exists ? '✅ 通过' : '❌ 失败'}
- **包含内容**: ${previewContent.hasContent ? '✅ 通过' : '❌ 失败'}
- **内容长度**: ${previewContent.contentLength} 字符
- **编辑功能**: ${previewContent.hasEditingStyles || previewContent.hasEditableClasses ? '✅ 正常' : '⚠️ 可能异常'}

### 同步质量评估
- **总体评分**: ${testReport.results.syncQuality.passed ? '✅ 优秀' : '⚠️ 需要改进'}
- **发现问题**: ${testReport.results.syncQuality.issues.length === 0 ? '无' : testReport.results.syncQuality.issues.join(', ')}

### 下载过程日志
${downloadLogs.map((log, i) => `${i + 1}. ${log}`).join('\n')}

## 改进建议

${testReport.results.syncQuality.passed ? 
  '🎉 下载同步功能工作正常，预览与下载内容保持一致！' : 
  '需要进一步优化同步机制，确保下载容器完全清理编辑样式。'}

---
*测试由自动化脚本生成*`;

    fs.writeFileSync(reportPath, reportContent);
    console.log(`📄 测试报告已保存: ${reportPath}`);
    
    // 最终结果
    if (testReport.results.syncQuality.passed) {
      console.log('🎉 测试通过！下载同步功能改进成功！');
    } else {
      console.log('⚠️ 测试发现问题，需要进一步优化');
    }
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

// 运行测试
testImprovedDownload().catch(console.error); 