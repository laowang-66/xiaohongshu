/**
 * 快速下载一致性测试工具 - 浏览器控制台版本
 * 
 * 使用方法：
 * 1. 打开项目主页面 (localhost:3002)
 * 2. 生成一个封面
 * 3. 在浏览器控制台粘贴并运行此脚本
 * 4. 查看测试结果和下载的图片
 */

console.log('🔧 启动下载一致性快速测试工具...');

async function quickDownloadTest() {
  try {
    console.log('🔍 开始检查页面状态...');
    
    // 检查是否有封面内容
    const containers = [
      document.querySelector('[data-editable-card-container]'),
      document.querySelector('[data-download-container]'),
      ...Array.from(document.querySelectorAll('div[style*="width"][style*="height"]'))
    ].filter(Boolean);
    
    console.log(`📋 找到 ${containers.length} 个潜在容器`);
    
    if (containers.length === 0) {
      console.log('❌ 未找到任何封面容器，请先生成封面再测试');
      return;
    }
    
    // 显示容器信息
    containers.forEach((container, index) => {
      const element = container;
      console.log(`📦 容器 ${index + 1}:`, {
        标签: element.tagName,
        类名: element.className,
        数据属性: Array.from(element.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .map(attr => `${attr.name}="${attr.value}"`)
          .join(', '),
        尺寸: `${element.offsetWidth}×${element.offsetHeight}`,
        内容长度: element.innerHTML.length
      });
    });
    
    // 动态导入下载助手
    console.log('📥 导入下载助手...');
    const downloadHelper = await import('./app/utils/downloadHelper.js');
    
    // 测试智能查找功能
    console.log('🎯 测试智能容器查找...');
    const testContainer = containers[0];
    
    // 生成测试文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `快速测试_${timestamp}.png`;
    
    console.log('📝 测试参数:', {
      容器: testContainer.tagName + (testContainer.className ? `.${testContainer.className}` : ''),
      文件名: filename,
      目标尺寸: '900×1200'
    });
    
    // 执行下载测试
    console.log('🚀 开始下载测试...');
    const success = await downloadHelper.downloadCoverImage('auto', {
      width: 900,
      height: 1200,
      filename: filename,
      backgroundColor: null,
      scale: 2
    });
    
    if (success) {
      console.log('✅ 下载测试成功！');
      console.log('📋 请检查下载文件夹中的图片：', filename);
      console.log('🔍 验证步骤：');
      console.log('  1. 对比下载的图片与页面预览');
      console.log('  2. 检查文字是否清晰');
      console.log('  3. 检查布局是否一致');
      console.log('  4. 检查颜色是否正确');
    } else {
      console.log('❌ 下载测试失败');
      console.log('🔧 可能的问题：');
      console.log('  - 容器查找失败');
      console.log('  - HTML2Canvas 渲染异常');
      console.log('  - 网络或权限问题');
    }
    
  } catch (error) {
    console.error('❌ 测试过程出错:', error);
    console.log('📋 错误详情:', error.message);
  }
}

// 启动测试
quickDownloadTest();

// 提供手动测试函数
window.testDownloadConsistency = quickDownloadTest;
console.log('💡 可以随时运行 testDownloadConsistency() 重新测试');

/**
 * 高级调试功能
 */
window.debugDownloadContainers = function() {
  console.log('🔍 详细容器调试信息:');
  
  const allContainers = document.querySelectorAll('div');
  const relevantContainers = Array.from(allContainers).filter(div => {
    const element = div;
    return element.offsetWidth > 100 && element.offsetHeight > 100;
  });
  
  console.log(`📊 找到 ${relevantContainers.length} 个可能的容器`);
  
  relevantContainers.forEach((container, index) => {
    const element = container;
    const hasEditableAttr = element.hasAttribute('data-editable-card-container');
    const hasDownloadAttr = element.hasAttribute('data-download-container');
    const hasTransform = element.style.transform && element.style.transform.includes('scale');
    
    console.log(`📦 容器 ${index + 1}:`, {
      可编辑容器: hasEditableAttr,
      下载容器: hasDownloadAttr,
      有缩放变换: hasTransform,
      尺寸: `${element.offsetWidth}×${element.offsetHeight}`,
      位置: element.getBoundingClientRect(),
      样式概要: {
        position: element.style.position,
        transform: element.style.transform,
        visibility: element.style.visibility
      }
    });
  });
};

console.log('🔧 调试工具已准备，运行 debugDownloadContainers() 查看详细信息'); 