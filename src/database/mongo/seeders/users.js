import { AuthenticateService } from '@/services/authenticate'
import { UserModel } from '../models'

export const execute = async () => {
  const users = [
    'danh.danh20051995@gmail.com'
  ]

  const exists = await UserModel.find({ email: { $in: users } })
  const _now = new Date()
  const emails = exists.map(u => u.email)

  const docs = users
    .filter(email => !emails.includes(email))
    .map(
      email => ({
        email,
        username: email.split('@').shift(),
        password: AuthenticateService.hash('123456789'),
        createdAt: _now,
        updatedAt: _now
      })
    )

  for (const doc of docs) {
    const user = await UserModel.create(doc)
    console.log(user)
  }
}

execute()
