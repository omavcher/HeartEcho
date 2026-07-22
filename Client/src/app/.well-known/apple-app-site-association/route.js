import { NextResponse } from 'next/server';

export async function GET() {
  const aasa = {
    applinks: {
      apps: [],
      details: [
        {
          appID: 'TEAMID.com.heartecho.app',
          paths: [
            '*',
            '/subscribe',
            '/chat/*',
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
