import { HTTP } from '@/bootstrap/kernel/http'
import { buildResponse } from '@/bootstrap/kernel/router/swagger/buildResponse'
import { User } from '@/database/models'

export const login = buildResponse(
  {
    code: HTTP._CODE.BAD_REQUEST,
    description: 'OTP invalid'
  },
  {
    code: HTTP._CODE.OK,
    example: {
      tokenType: 'Bearer',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoicmVkaXNLZXkiLCJ2YWx1ZSI6ImtpbWFuLWNtcy1iYWNrZW5kOmNyZWRlbnRpYWxzOmFkbWluOjIwMjE6MDc6MDI6ODdhYTllNGItZGViNi00NTY2LTg4MjEtZjc1ZjVkMTVhMjkzOjVjMzMzNzM4LWU3MTctNGE5MS1hZTJjLTJkMDI2NDIzMDRiNiIsImlhdCI6MTYyNTIyMDk2MX0.jMazzA5z3JUaeHrRI78WDDXESXylFvKHr9miOKTr7P8',
      tokenExpireAt: '2021-07-09T10:16:01.374Z',
      tokenExpireIn: 604800,
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidG9rZW5JZCIsInZhbHVlIjoiNWMzMzM3MzgtZTcxNy00YTkxLWFlMmMtMmQwMjY0MjMwNGI2IiwiaWF0IjoxNjI1MjIwOTYxfQ.V1457W2dulrZxgIA4d5IuhmuA68QUShBtHdQm8QwuE8',
      refreshTokenExpireAt: '2022-07-02T10:16:01.374Z',
      refreshTokenExpireIn: 31536000
    }
  }
)

export const profile = buildResponse({ code: HTTP._CODE.OK, schema: User })

export const refreshToken = buildResponse(
  {
    code: HTTP._CODE.OK,
    example: {
      tokenType: 'Bearer',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoicmVkaXNLZXkiLCJ2YWx1ZSI6ImtpbWFuLWNtcy1iYWNrZW5kOmNyZWRlbnRpYWxzOmFkbWluOjIwMjE6MDc6MDI6ODdhYTllNGItZGViNi00NTY2LTg4MjEtZjc1ZjVkMTVhMjkzOjVjMzMzNzM4LWU3MTctNGE5MS1hZTJjLTJkMDI2NDIzMDRiNiIsImlhdCI6MTYyNTIyMDk2MX0.jMazzA5z3JUaeHrRI78WDDXESXylFvKHr9miOKTr7P8',
      tokenExpireAt: '2021-07-09T10:16:01.374Z',
      tokenExpireIn: 604800,
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidG9rZW5JZCIsInZhbHVlIjoiNWMzMzM3MzgtZTcxNy00YTkxLWFlMmMtMmQwMjY0MjMwNGI2IiwiaWF0IjoxNjI1MjIwOTYxfQ.V1457W2dulrZxgIA4d5IuhmuA68QUShBtHdQm8QwuE8',
      refreshTokenExpireAt: '2022-07-02T10:16:01.374Z',
      refreshTokenExpireIn: 31536000
    }
  }
)
