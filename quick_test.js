// 快速测试脚本 - 在浏览器控制台中运行
// 使用方法：复制此脚本到 http://localhost:3000 页面的控制台中运行

console.log('%c🚀 开始预览与下载一致性快速测试', 'color: #007bff; font-size: 16px; font-weight: bold;');
console.log('%c请确保已经生成了封面内容', 'color: #666; font-style: italic;');

function quickConsistencyTest() {
  const results = [];
  let score = 0;
  const maxScore = 5;
  
  console.log('\n📋 测试1: DOM容器检查');
  // 检查预览容器
  const previewContainer = document.querySelector('[data-editable-card-container]');
  if (previewContainer) {
    console.log('✅ 预览容器存在');
    score++;
  } else {
    console.log('❌ 预览容器不存在');
  }
  
  // 检查下载容器
  const downloadContainer = document.querySelector('[data-download-container]');
  if (downloadContainer) {
    console.log('✅ 下载容器存在');
    score++;
  } else {
    console.log('❌ 下载容器不存在');
  }
  
  console.log('\n📋 测试2: 内容同步检查');
  if (previewContainer && downloadContainer) {
    const previewContent = previewContainer.firstElementChild?.outerHTML || '';
    const downloadContent = downloadContainer.innerHTML || '';
    
    console.log(`预览内容长度: ${previewContent.length}`);
    console.log(`下载内容长度: ${downloadContent.length}`);
    
    if (downloadContent.length > 100) {
      console.log('✅ 下载容器有内容');
      score++;
    } else {
      console.log('❌ 下载容器内容不足');
    }
  }
  
  console.log('\n📋 测试3: 样式清理检查');
  if (downloadContainer?.innerHTML) {
    const content = downloadContainer.innerHTML;
    const hasEditingStyles = content.includes('rgba(59, 130, 246') || 
                            content.includes('cursor: pointer') ||
                            content.includes('transform: scale') ||
                            content.includes('editable-');
    
    if (!hasEditingStyles) {
      console.log('✅ 样式清理完成 - 无编辑样式残留');
      score++;
    } else {
      console.log('❌ 发现编辑样式残留');
      if (content.includes('rgba(59, 130, 246')) console.log('  - 蓝色编辑框');
      if (content.includes('cursor: pointer')) console.log('  - pointer光标');
      if (content.includes('transform: scale')) console.log('  - 缩放变换');
      if (content.includes('editable-')) console.log('  - 编辑类名');
    }
  }
  
  console.log('\n📋 测试4: 字体设置检查');
  if (downloadContainer?.innerHTML) {
    const content = downloadContainer.innerHTML;
    const hasCorrectFont = content.includes('PingFang SC') || content.includes('Microsoft YaHei');
    
    if (hasCorrectFont) {
      console.log('✅ 字体设置正确');
      score++;
    } else {
      console.log('❌ 字体设置可能有问题');
    }
  }
  
  console.log('\n📊 测试结果汇总:');
  console.log(`%c得分: ${score}/${maxScore} (${Math.round(score/maxScore*100)}%)`, 
    `color: ${score === maxScore ? '#28a745' : score >= 3 ? '#ffc107' : '#dc3545'}; font-weight: bold;`);
  
  if (score === maxScore) {
    console.log('%c🎉 所有测试通过！预览与下载一致性修复成功！', 'color: #28a745; font-size: 14px; font-weight: bold;');
  } else if (score >= 3) {
    console.log('%c⚠️ 大部分测试通过，但仍有改进空间', 'color: #ffc107; font-weight: bold;');
  } else {
    console.log('%c❌ 测试未通过，需要进一步修复', 'color: #dc3545; font-weight: bold;');
  }
  
  return { score, maxScore, passed: score === maxScore };
}

// 下载测试函数
function testDownloadFlow() {
  console.log('\n💾 测试下载流程...');
  
  const downloadBtn = document.querySelector('button:contains("下载")') || 
                     document.querySelector('[class*="download"]') ||
                     Array.from(document.querySelectorAll('button')).find(btn => 
                       btn.textContent.includes('下载') || btn.textContent.includes('💾'));
  
  if (downloadBtn) {
    console.log('✅ 找到下载按钮');
    console.log('💡 点击下载按钮测试下载功能：');
    console.log(downloadBtn);
    
    // 模拟点击（仅供参考，实际需要手动点击）
    console.log('%c注意：请手动点击下载按钮并检查下载的图片是否与预览一致', 'color: #007bff; font-weight: bold;');
  } else {
    console.log('❌ 未找到下载按钮');
  }
}

// 生成诊断报告
function generateDiagnosticReport() {
  console.log('\n🔍 生成诊断报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    previewContainerExists: !!document.querySelector('[data-editable-card-container]'),
    downloadContainerExists: !!document.querySelector('[data-download-container]'),
    previewContentLength: document.querySelector('[data-editable-card-container]')?.firstElementChild?.outerHTML?.length || 0,
    downloadContentLength: document.querySelector('[data-download-container]')?.innerHTML?.length || 0,
    hasEditingStylesRemaining: false,
    fontSettingsCorrect: false
  };
  
  const downloadContent = document.querySelector('[data-download-container]')?.innerHTML || '';
  if (downloadContent) {
    report.hasEditingStylesRemaining = downloadContent.includes('rgba(59, 130, 246') || 
                                      downloadContent.includes('cursor: pointer') ||
                                      downloadContent.includes('transform: scale');
    report.fontSettingsCorrect = downloadContent.includes('PingFang SC') || downloadContent.includes('Microsoft YaHei');
  }
  
  console.table(report);
  return report;
}

// 主要测试函数
window.testConsistency = quickConsistencyTest;
window.testDownload = testDownloadFlow;
window.generateReport = generateDiagnosticReport;

console.log('\n🎯 快速测试工具已加载！可用命令：');
console.log('• testConsistency() - 运行一致性测试');
console.log('• testDownload() - 测试下载流程');
console.log('• generateReport() - 生成诊断报告');
console.log('\n📝 使用步骤：');
console.log('1. 确保已生成封面');
console.log('2. 运行 testConsistency() 进行测试');
console.log('3. 运行 testDownload() 检查下载按钮');
console.log('4. 手动测试下载功能并对比图片');

// 自动运行初始测试
console.log('\n🚀 自动运行初始测试...');
setTimeout(() => {
  if (document.querySelector('[data-editable-card-container]')) {
    quickConsistencyTest();
  } else {
    console.log('%c⚠️ 请先生成封面内容，然后运行 testConsistency() 进行测试', 'color: #ffc107; font-weight: bold;');
  }
}, 1000); 