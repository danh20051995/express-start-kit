import { HTTP } from '@/bootstrap/kernel/http'
import { buildResponse } from '@/bootstrap/kernel/router/swagger/buildResponse'
import { AdministratorModel } from '@/database/models'

export const login = buildResponse(
  {
    code: HTTP._CODE.BAD_REQUEST,
    description: 'Invalid credentials'
  },
  {
    code: HTTP._CODE.OK,
    description: 'Login successed',
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

export const logout = buildResponse({ code: HTTP._CODE.NO_CONTENT, description: 'Logged out' })

export const getProfile = buildResponse({ code: HTTP._CODE.OK, schema: AdministratorModel })

export const refreshToken = buildResponse(
  {
    code: HTTP._CODE.BAD_REQUEST,
    description: 'Token invalid \n New password cannot be the same as your old password'
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
