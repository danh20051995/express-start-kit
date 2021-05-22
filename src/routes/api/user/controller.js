import { UserModel } from '@/database/postgresql/models'

export const index = (req, res, next) => {
  return UserModel.paginate()
}
