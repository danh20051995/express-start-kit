import { UserModel } from '@/database/models'

export const index = (req, res, next) => {
  return UserModel.paginate()
}
