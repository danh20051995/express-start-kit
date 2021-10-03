export default [
  {
    method: 'GET',
    path: '/todo/authorization-1',
    tags: ['test'],
    auth: {
      mode: 'required',
      allow: 'user: permission1|user: permission2, permission3|admin: permission1, permission2, permission3'
    },
    handler: () => ({ message: 'OK' })
  },
  {
    method: 'GET',
    path: '/todo/authorization-2',
    tags: ['test'],
    auth: {
      mode: 'required',
      // allow: 'admin|user'
      // allow: 'user: permission1|user: permission2, permission3|admin: permission1, permission2, permission3'
      allow: [
        'user: permission2, permission3|admin: permission1',
        'admin: permission1, permission2, permission3'
      ]
    },
    handler: () => ({ message: 'OK' })
  },
  {
    method: 'GET',
    path: '/todo/authorization-3',
    tags: ['test'],
    auth: {
      mode: 'required',
      allow: [['admin|user', 'user']]
    },
    handler: () => ({ message: 'OK' })
  },
  {
    method: 'GET',
    path: '/todo/authorization-4',
    tags: ['test'],
    auth: {
      mode: 'required',
      allow: [[{ role: 'admin' }, { role: 'user' }]]
    },
    handler: () => ({ message: 'OK' })
  },
  {
    method: 'GET',
    path: '/todo/authorization-5',
    tags: ['test'],
    auth: {
      mode: 'required',
      allow: { role: 'admin' }
    },
    handler: () => ({ message: 'OK' })
  },
  {
    method: 'GET',
    path: '/todo/authorization-6',
    tags: ['test'],
    auth: {
      mode: 'required',
      allow: [
        [
          { role: 'admin' },
          { role: 'user' }
        ],
        'admin',
        'super-admin'
      ]
    },
    handler: () => ({ message: 'OK' })
  }
  // {
  //   method: 'GET',
  //   path: '/todo/auth-user',
  //   tags: ['test'],
  //   auth: {
  //     mode: 'required',
  //     allow: 'user'
  //   },
  //   handler: () => ({ message: 'OK' })
  // },
  // {
  //   method: 'GET',
  //   path: '/todo/auth-or-conditions',
  //   tags: ['test'],
  //   auth: {
  //     mode: 'required',
  //     allow: 'user: permission1|user: permission2, permission3|admin: permission1, permission2, permission3'
  //   },
  //   handler: () => ({ message: 'OK' })
  // },
  // {
  //   method: 'GET',
  //   path: '/todo/auth-and-conditions',
  //   tags: ['test'],
  //   auth: {
  //     mode: 'required',
  //     allow: [
  //       'user: permission1',
  //       'user: permission2, permission3',
  //       'admin: permission1, permission2, permission3'
  //     ]
  //   },
  //   handler: () => ({ message: 'OK' })
  // },
  // {
  //   method: 'POST',
  //   path: '/todo/auth-or-conditions',
  //   tags: ['test'],
  //   auth: {
  //     mode: 'required',
  //     allow: [
  //       ['user: permission1'],
  //       [{
  //         role: 'user',
  //         permissions: [
  //           'permission2',
  //           'permission3'
  //         ]
  //       }],
  //       [
  //         {
  //           role: 'user',
  //           permissions: [
  //             'permission2',
  //             'permission3'
  //           ]
  //         },
  //         {
  //           role: 'admin',
  //           permissions: [
  //             'permission1',
  //             'permission2',
  //             'permission3'
  //           ]
  //         }
  //       ]
  //     ]
  //   },
  //   handler: () => ({ message: 'OK' })
  // },
  // {
  //   method: 'POST',
  //   path: '/todo/auth-and-conditions',
  //   tags: ['test'],
  //   auth: {
  //     mode: 'required',
  //     allow: [
  //       'user: permission1',
  //       [
  //         'user: permission2, permission3',
  //         'admin: permission1, permission2, permission3'
  //       ]
  //     ]
  //   },
  //   handler: () => ({ message: 'OK' })
  // }
]
