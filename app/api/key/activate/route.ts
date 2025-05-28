import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { keyCode } = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未提供有效的认证token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // 这里应该连接到您的后端API
    // 暂时使用模拟的后端调用
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/key/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ keyCode }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: data.message || '密钥激活失败' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      message: '密钥激活成功',
      keyInfo: data.keyInfo,
    });
  } catch (error) {
    console.error('Key activation error:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 