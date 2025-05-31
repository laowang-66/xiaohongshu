// 🔧 长文内容优化修复脚本
// 解决长文内容无法提炼优化的问题

console.log('🔧 加载长文内容优化修复脚本...');

// 修复长文内容提炼功能
window.fixLongContentOptimization = async function(content, platform = 'xiaohongshu') {
    console.log('🚀 开始修复长文内容优化...');
    console.log('📝 原始内容长度:', content.length);
    
    if (!content || content.trim().length < 5) {
        console.error('❌ 内容太短或为空');
        return null;
    }
    
    try {
        // 第一步：智能内容分段处理
        const processedContent = intelligentContentSplit(content, platform);
        console.log('✅ 内容分段完成');
        
        // 第二步：调用优化API，使用分段内容
        const optimizedResult = await callOptimizationAPI(processedContent, platform);
        console.log('✅ 内容优化完成');
        
        return optimizedResult;
        
    } catch (error) {
        console.error('❌ 长文优化失败:', error);
        
        // 降级方案：使用本地智能提炼
        console.log('🔄 启用本地智能提炼...');
        return localIntelligentExtraction(content, platform);
    }
};

// 智能内容分段处理
function intelligentContentSplit(content, platform) {
    const maxLength = platform === 'wechat' ? 800 : platform === 'video' ? 300 : 500;
    
    if (content.length <= maxLength) {
        return content;
    }
    
    console.log(`⚡ 内容过长(${content.length}字)，开始智能分段...`);
    
    // 方法1：找关键段落
    const keywordPriority = {
        xiaohongshu: ['种草', '实测', '推荐', '分享', '干货', '攻略', '必看', '真实', '体验'],
        video: ['震惊', '揭秘', '必看', '爆料', '秘密', '真相', '方法', '技巧', '绝了'],
        wechat: ['分析', '深度', '解读', '洞察', '思考', '趋势', '专业', '权威', '研究']
    };
    
    const keywords = keywordPriority[platform] || keywordPriority.xiaohongshu;
    
    // 按段落分割
    const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 10);
    
    if (paragraphs.length > 1) {
        // 找包含关键词最多的段落
        let bestParagraph = '';
        let maxScore = 0;
        
        paragraphs.forEach(para => {
            let score = 0;
            keywords.forEach(keyword => {
                if (para.includes(keyword)) score += 2;
            });
            
            // 数字和符号也加分
            if (/\d+/.test(para)) score += 1;
            if (/[！？。：]/.test(para)) score += 1;
            
            if (score > maxScore && para.length <= maxLength) {
                maxScore = score;
                bestParagraph = para;
            }
        });
        
        if (bestParagraph) {
            console.log('✅ 找到最佳段落，包含关键词数量:', maxScore);
            return bestParagraph;
        }
    }
    
    // 方法2：智能摘要
    return extractKeyContent(content, maxLength, keywords);
}

// 提取关键内容
function extractKeyContent(content, maxLength, keywords) {
    // 提取标题（通常在开头）
    const titleMatch = content.match(/^[^\n]{10,50}/);
    let result = titleMatch ? titleMatch[0] : '';
    
    // 提取包含关键词的句子
    const sentences = content.split(/[。！？\n]/).filter(s => s.trim().length > 5);
    const keySentences = [];
    
    sentences.forEach(sentence => {
        keywords.forEach(keyword => {
            if (sentence.includes(keyword) && sentence.length < 100) {
                keySentences.push(sentence.trim());
            }
        });
    });
    
    // 组合关键内容
    keySentences.slice(0, 3).forEach(sentence => {
        if ((result + sentence).length < maxLength) {
            result += (result ? '\n' : '') + sentence;
        }
    });
    
    // 如果还是太长，强制截取但保持语义完整
    if (result.length > maxLength) {
        result = result.substring(0, maxLength - 3);
        const lastPunctuation = Math.max(
            result.lastIndexOf('。'),
            result.lastIndexOf('！'),
            result.lastIndexOf('？'),
            result.lastIndexOf('：')
        );
        
        if (lastPunctuation > maxLength * 0.7) {
            result = result.substring(0, lastPunctuation + 1);
        } else {
            result += '...';
        }
    }
    
    console.log('✅ 智能摘要完成，长度:', result.length);
    return result;
}

// 调用优化API（绕过长度限制）
async function callOptimizationAPI(content, platform) {
    console.log('📡 调用优化API...');
    
    try {
        const response = await fetch('/api/optimize-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: content,
                platform: platform
            })
        });
        
        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.versions) {
            console.log('✅ API优化成功，生成版本数:', data.versions.length);
            return {
                success: true,
                versions: data.versions,
                method: 'api',
                originalLength: content.length
            };
        } else {
            throw new Error(data.error || 'API返回异常');
        }
        
    } catch (error) {
        console.error('❌ API调用失败:', error);
        throw error;
    }
}

// 本地智能提炼（降级方案）
function localIntelligentExtraction(content, platform) {
    console.log('🧠 开始本地智能提炼...');
    
    const templates = {
        xiaohongshu: {
            template: {
                主标题: '',
                副标题: '',
                情感标签: '',
                核心卖点: '',
                适用场景: ''
            },
            keywords: ['种草', '实测', '分享', '干货', '必看', '真实', '推荐'],
            emotions: ['惊喜', '兴奋', '满意', '推荐', '种草']
        },
        video: {
            template: {
                核心标题: '',
                关键数字: '',
                情绪强度: '',
                视觉提示: '',
                适用场景: ''
            },
            keywords: ['震惊', '必看', '揭秘', '绝了', '真相', '秘密'],
            emotions: ['震惊', '惊喜', '好奇', '兴奋', '震撼']
        },
        wechat: {
            template: {
                主标题: '',
                副标题: '',
                专业定位: '',
                目标读者: '',
                价值承诺: ''
            },
            keywords: ['分析', '深度', '解读', '洞察', '专业', '权威'],
            emotions: ['理性', '专业', '权威', '深度', '价值']
        }
    };
    
    const config = templates[platform] || templates.xiaohongshu;
    
    // 提取关键信息
    const titleMatch = content.match(/^[^\n]{5,50}/);
    const numbers = content.match(/\d+/g) || [];
    const hasKeywords = config.keywords.filter(k => content.includes(k));
    
    // 生成3个版本
    const versions = [];
    
    for (let i = 0; i < 3; i++) {
        const version = { ...config.template };
        
        // 根据平台生成不同的标题
        if (platform === 'xiaohongshu') {
            version.主标题 = generateXiaohongshuTitle(content, titleMatch?.[0], hasKeywords, i);
            version.副标题 = generateSubtitle(content, i);
            version.情感标签 = config.emotions[i % config.emotions.length];
            version.核心卖点 = extractCoreValue(content);
            version.适用场景 = '适合日常分享和种草推荐';
        } else if (platform === 'video') {
            version.核心标题 = generateVideoTitle(content, titleMatch?.[0], hasKeywords, i);
            version.关键数字 = numbers.length > 0 ? numbers[0] : '100%';
            version.情绪强度 = (8 + i).toString();
            version.视觉提示 = '大号字体，高对比色';
            version.适用场景 = '适合快节奏短视频';
        } else {
            version.主标题 = generateWechatTitle(content, titleMatch?.[0], hasKeywords, i);
            version.副标题 = generateProfessionalSubtitle(content, i);
            version.专业定位 = '深度分析';
            version.目标读者 = '专业人士和深度用户';
            version.价值承诺 = '获得专业见解和实用知识';
        }
        
        versions.push(version);
    }
    
    console.log('✅ 本地提炼完成，生成版本数:', versions.length);
    
    return {
        success: true,
        versions: versions,
        method: 'local',
        fallback: true,
        originalLength: content.length
    };
}

// 生成小红书标题
function generateXiaohongshuTitle(content, originalTitle, keywords, version) {
    const prefixes = ['种草分享', '实测推荐', '必看干货'];
    const suffixes = ['超好用', '值得收藏', '必须安排'];
    
    let title = originalTitle || content.substring(0, 20);
    
    if (title.length > 15) {
        title = title.substring(0, 12) + '...';
    }
    
    if (keywords.length > 0) {
        title = keywords[0] + '！' + title;
    } else {
        title = prefixes[version] + '：' + title;
    }
    
    return title;
}

// 生成短视频标题  
function generateVideoTitle(content, originalTitle, keywords, version) {
    const intensifiers = ['震惊', '绝了', '必看'];
    
    let title = originalTitle || content.substring(0, 15);
    
    if (title.length > 12) {
        title = title.substring(0, 10);
    }
    
    return intensifiers[version] + '！' + title;
}

// 生成公众号标题
function generateWechatTitle(content, originalTitle, keywords, version) {
    const prefixes = ['深度解析', '专业分析', '权威解读'];
    
    let title = originalTitle || content.substring(0, 30);
    
    if (title.length > 25) {
        title = title.substring(0, 22) + '...';
    }
    
    return prefixes[version] + '：' + title;
}

// 辅助函数
function generateSubtitle(content, version) {
    const templates = ['核心要点总结', '实用技巧分享', '详细经验解析'];
    return templates[version] || '内容亮点提炼';
}

function generateProfessionalSubtitle(content, version) {
    const templates = ['专业视角解读', '深度价值分析', '权威观点分享'];
    return templates[version] || '专业内容解析';
}

function extractCoreValue(content) {
    if (content.includes('方法') || content.includes('技巧')) return '实用方法分享';
    if (content.includes('产品') || content.includes('推荐')) return '产品使用体验';
    if (content.includes('教程') || content.includes('学习')) return '学习心得分享';
    return '有价值的经验分享';
}

// 快速测试函数
window.testLongContentFix = async function() {
    const testContent = `
    今天给大家分享一个超级实用的生活小技巧，关于如何在家制作咖啡的详细教程。
    
    很多朋友都喜欢喝咖啡，但是外面买的咖啡不仅价格昂贵，而且口味也不一定符合自己的喜好。其实在家制作咖啡非常简单，只需要掌握几个关键要点就可以了。
    
    首先，选择合适的咖啡豆非常重要。建议选择新鲜烘焙的咖啡豆，最好是在烘焙后的2-4周内使用。咖啡豆的研磨粗细也会影响口感，一般来说，手冲咖啡适合中细度研磨。
    
    其次，水温的控制也是关键因素。理想的水温应该在90-96度之间，过热的水会让咖啡变苦，过冷的水则无法充分提取咖啡的香味。
    
    接下来是冲泡时间的掌握。不同的冲泡方法需要不同的时间，手冲咖啡一般需要2-4分钟，而法压壶则需要4分钟左右。
    
    最后，咖啡和水的比例也很重要，一般推荐1:15到1:17的比例，也就是1克咖啡粉对应15-17毫升水。
    
    掌握了这些技巧，你就可以在家制作出媲美咖啡店的美味咖啡了。不仅省钱，还能根据自己的喜好调整口味。
    `;
    
    console.log('🧪 开始测试长文优化...');
    console.log('📝 测试内容长度:', testContent.length);
    
    const result = await fixLongContentOptimization(testContent, 'xiaohongshu');
    
    if (result && result.success) {
        console.log('✅ 测试成功！');
        console.log('📊 生成结果:', result);
        
        // 显示结果
        result.versions.forEach((version, index) => {
            console.log(`\n版本${index + 1}:`);
            Object.entries(version).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
            });
        });
        
        return result;
    } else {
        console.error('❌ 测试失败');
        return null;
    }
};

// 工具函数：自动应用修复到页面
window.applyLongContentFix = function() {
    console.log('🔧 开始应用长文内容修复到页面...');
    
    // 查找内容输入框
    const textareas = document.querySelectorAll('textarea');
    let targetTextarea = null;
    
    textareas.forEach(textarea => {
        if (textarea.value && textarea.value.length > 200) {
            targetTextarea = textarea;
            console.log('✅ 找到长文内容输入框');
        }
    });
    
    if (!targetTextarea) {
        console.log('⚠️ 未找到包含长文内容的输入框');
        return false;
    }
    
    // 查找优化按钮
    const buttons = document.querySelectorAll('button');
    let optimizeButton = null;
    
    buttons.forEach(button => {
        if (button.textContent.includes('优化') || button.textContent.includes('提炼')) {
            optimizeButton = button;
            console.log('✅ 找到优化按钮');
        }
    });
    
    if (optimizeButton) {
        // 拦截按钮点击，使用修复版本
        const originalClick = optimizeButton.onclick;
        optimizeButton.onclick = async function(e) {
            e.preventDefault();
            
            console.log('🚀 使用修复版本进行内容优化...');
            const content = targetTextarea.value;
            
            // 获取平台选择
            let platform = 'xiaohongshu';
            const platformButtons = document.querySelectorAll('button[data-platform], select option:checked');
            platformButtons.forEach(btn => {
                if (btn.textContent.includes('短视频')) platform = 'video';
                if (btn.textContent.includes('公众号')) platform = 'wechat';
            });
            
            const result = await fixLongContentOptimization(content, platform);
            
            if (result && result.success) {
                console.log('✅ 修复版本优化成功！');
                
                // 显示结果（这里可以根据具体页面结构调整）
                displayOptimizationResult(result);
            } else {
                console.error('❌ 修复版本优化失败');
                
                // 回退到原始处理
                if (originalClick) {
                    originalClick.call(this, e);
                }
            }
        };
        
        console.log('✅ 修复已应用到优化按钮');
        return true;
    } else {
        console.log('⚠️ 未找到优化按钮');
        return false;
    }
};

// 显示优化结果
function displayOptimizationResult(result) {
    // 创建结果显示容器
    const existingResult = document.getElementById('long-content-fix-result');
    if (existingResult) {
        existingResult.remove();
    }
    
    const resultContainer = document.createElement('div');
    resultContainer.id = 'long-content-fix-result';
    resultContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-height: 600px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    
    resultContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #333;">长文优化结果</h3>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
        </div>
        
        <div style="margin-bottom: 10px; padding: 8px; background: #f0f7ff; border-radius: 4px; font-size: 12px;">
            ${result.method === 'local' ? '🔧 使用本地智能提炼' : '🌐 使用API优化'}
            ${result.fallback ? ' (降级模式)' : ''}
        </div>
        
        <div style="max-height: 400px; overflow-y: auto;">
            ${result.versions.map((version, index) => `
                <div style="margin-bottom: 15px; padding: 12px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa;">
                    <div style="font-weight: bold; margin-bottom: 8px; color: #4CAF50;">版本 ${index + 1}</div>
                    ${Object.entries(version).map(([key, value]) => `
                        <div style="margin-bottom: 6px;">
                            <span style="font-size: 11px; color: #666; display: block;">${key}:</span>
                            <span style="font-size: 13px; color: #333;">${value}</span>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
    
    document.body.appendChild(resultContainer);
}

console.log('✅ 长文内容优化修复脚本加载完成！');
console.log('📋 可用命令:');
console.log('  fixLongContentOptimization(content, platform) - 修复长文优化');
console.log('  testLongContentFix() - 测试修复功能');
console.log('  applyLongContentFix() - 应用修复到当前页面');

// 自动检测并应用修复
setTimeout(() => {
    if (document.querySelector('textarea')) {
        console.log('🔍 检测到文本输入框，你可以运行 applyLongContentFix() 应用修复');
    }
}, 1000); 