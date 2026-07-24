import { NextResponse } from 'next/server';

export async function GET() {
  const aasa = {
    applinks: {
      apps: [],
      details: [
        {
          appID: 'TEAMID.com.heartecho.ai',
          paths: [
            'NOT /ai-sex-chat*',
            'NOT /hot-*',
            'NOT /ai-girlfriend-no-filter*',
            '/chat/*',
            '/subscribe',
            '/pricing',
            '/profile/*',
            '/referral/*',
            '/login',
            '/signup'
          ]
        }
      ]
    }
  };

  return NextResponse.json(aasa, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
