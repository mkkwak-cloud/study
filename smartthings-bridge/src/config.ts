import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value || value === 'change_me') {
    throw new Error(
      `환경변수 ${name} 이(가) 설정되지 않았습니다. .env.example 을 .env 로 복사하고 값을 채우세요.`,
    )
  }
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 4310),
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
  smartthings: {
    clientId: required('SMARTTHINGS_CLIENT_ID'),
    clientSecret: required('SMARTTHINGS_CLIENT_SECRET'),
    redirectUri: required('SMARTTHINGS_REDIRECT_URI'),
    // FR-01: 기기 제어에 필요한 최소 스코프만 요청한다(NFR-24 최소 권한 원칙).
    scopes: ['r:devices:*', 'x:devices:*', 'r:locations:*'],
    authorizeUrl: 'https://api.smartthings.com/oauth/authorize',
    tokenUrl: 'https://auth-global.api.smartthings.com/oauth/token',
    apiBaseUrl: 'https://api.smartthings.com/v1',
  },
} as const
