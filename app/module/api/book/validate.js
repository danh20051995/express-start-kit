/**
* File name: validate.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:38:47
*/
import Joi from 'joi'
export default {
  store: {
    body: {
      name: Joi.string().required().description('Name'),
      description: Joi.string().required().description('Description'),
      cover: Joi.string().required().description('Cover')
    }
  },

  getItem: {
    params: {
      _id: Joi.string().required().length(24).description('_id')
    }
  },

  update: {
    params: {
      _id: Joi.string().length(24).required().description('_id')
    },
    body: {
      name: Joi.string().required().description('Name'),
      description: Joi.string().required().description('Description')
    }
  },

  status: {
    params: {
      _id: Joi.string().length(24).required().description('_id')
    },
    body: {
      status: Joi.string().valid('active', 'inactive', 'archive').required().description('status')
    }
  }
}
