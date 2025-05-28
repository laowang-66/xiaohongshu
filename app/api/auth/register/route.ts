import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 这里应该连接到您的后端API
    // 暂时使用模拟的后端调用
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: data.message || '注册失败' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      message: '注册成功',
      token: data.token,
      user: data.user,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 