import { Model } from 'mongoose'

export const getModelName = Mod => Mod?.tableName || Mod?.modelName

export const isSequelizeModel = Mod => {
  if (!Mod || !Mod.tableName || typeof Mod.tableName !== 'string' || !Mod.queryInterface?.sequelize) {
    return false
  }

  return true
}

export const isMongooseModel = Mod => {
  return Mod.prototype instanceof Model
}
