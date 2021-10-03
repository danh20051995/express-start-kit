import express, { Router } from 'express'
import swaggerUi from 'swagger-ui-dist'

/**
 * @param {{ customOptions?: any, [key in string]: any }} obj
 * @returns {string}
 */
const stringify = function (obj) {
  const placeholder = '____FUNCTIONPLACEHOLDER____'
  const fns = []
  let json = JSON.stringify(obj, function (key, value) {
    if (typeof value === 'function') {
      fns.push(value)
      return placeholder
    }
    return value
  }, 2)
  json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function (_) {
    return fns.shift()
  })
  return 'var options = ' + json + ';'
}

const favIconHtml = [
  '<link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />',
  '<link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />'
].join('')

const htmlTplString = `
<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><% title %></title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css" >
  <% favIconString %>
  <% customJs %>
  <style>
    html
    {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *,
    *:before,
    *:after
    {
      box-sizing: inherit;
    }

    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>

<body>

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position:absolute;width:0;height:0">
  <defs>
    <symbol viewBox="0 0 20 20" id="unlocked">
      <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V6h2v-.801C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8z"></path>
    </symbol>

    <symbol viewBox="0 0 20 20" id="locked">
      <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8zM12 8H8V5.199C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="close">
      <path d="M14.348 14.849c-.469.469-1.229.469-1.697 0L10 11.819l-2.651 3.029c-.469.469-1.229.469-1.697 0-.469-.469-.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-.469-.469-.469-1.228 0-1.697.469-.469 1.228-.469 1.697 0L10 8.183l2.651-3.031c.469-.469 1.228-.469 1.697 0 .469.469.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c.469.469.469 1.229 0 1.698z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="large-arrow">
      <path d="M13.25 10L6.109 2.58c-.268-.27-.268-.707 0-.979.268-.27.701-.27.969 0l7.83 7.908c.268.271.268.709 0 .979l-7.83 7.908c-.268.271-.701.27-.969 0-.268-.269-.268-.707 0-.979L13.25 10z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="large-arrow-down">
      <path d="M17.418 6.109c.272-.268.709-.268.979 0s.271.701 0 .969l-7.908 7.83c-.27.268-.707.268-.979 0l-7.908-7.83c-.27-.268-.27-.701 0-.969.271-.268.709-.268.979 0L10 13.25l7.418-7.141z"/>
    </symbol>


    <symbol viewBox="0 0 24 24" id="jump-to">
      <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>
    </symbol>

    <symbol viewBox="0 0 24 24" id="expand">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </symbol>

  </defs>
</svg>

<div id="swagger-ui"></div>

<script src="./swagger-ui-bundle.js"> </script>
<script src="./swagger-ui-standalone-preset.js"> </script>
<script src="./swagger-ui-init.js"> </script>
<% customCssUrl %>
<style>
  <% customCss %>
</style>
</body>

</html>
`

const jsTplString = `
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  <% swaggerOptions %>
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    // docExpansion: 'none',
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    withCredentials: false, // enables passing credentials|same domain only
    layout: "StandaloneLayout",
    tagsSorter: "alpha", // can also be a function
    apisSorter: "alpha", // can also be a function
    // can also be 'alpha', 'method' or a function
    operationsSorter: function (a, b) {
      var order = {
        get: '0',
        post: '1',
        put: '2',
        patch: '3',
        delete: '4'
      }
      return order[a.get('method')].localeCompare(order[b.get('method')])
    }
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
`

const generateHTML = function (swaggerDoc, opts) {
  let isExplorer
  let customJs
  let customCssUrl
  let customCss
  let customfavIcon
  let customSiteTitle
  if (opts && typeof opts === 'object') {
    customCss = opts.customCss
    customJs = opts.customJs
    customfavIcon = opts.customfavIcon
    isExplorer = opts.explorer || !!opts.swaggerUrls
    customSiteTitle = opts.customSiteTitle
    customCssUrl = opts.customCssUrl
  } else {
    // support legacy params based function
    isExplorer = opts
  }
  const explorerString = isExplorer ? '' : '.swagger-ui .topbar .download-url-wrapper { display: none }'
  customCss = explorerString + ' ' + customCss || explorerString
  customfavIcon = customfavIcon || false
  customSiteTitle = customSiteTitle || 'Swagger UI'

  const favIconString = customfavIcon ? '<link rel="icon" href="' + customfavIcon + '" />' : favIconHtml
  const htmlWithCustomCss = htmlTplString.replace('<% customCss %>', customCss)
  const htmlWithFavIcon = htmlWithCustomCss.replace('<% favIconString %>', favIconString)
  const htmlWithCustomJs = htmlWithFavIcon.replace('<% customJs %>', customJs ? `<script src="${customJs}"></script>` : '')
  const htmlWithCustomCssUrl = htmlWithCustomJs.replace('<% customCssUrl %>', customCssUrl ? `<link href="${customCssUrl}" rel="stylesheet">` : '')
  const html = htmlWithCustomCssUrl.replace('<% title %>', customSiteTitle)
  return html
}

const swaggerConfig = {}

function swaggerInitFn (req, res, next) {
  if (req.url === '/package.json') {
    res.sendStatus(404)
  } else if (req.url === '/swagger-ui-init.js') {
    res.set('Content-Type', 'application/javascript')
    res.send(swaggerConfig.swaggerUIInit)
  } else {
    next()
  }
}

/**
 * @param {swaggerUi.Spec} swaggerDoc swagger specs
 * @param {{
 *   customCss?: string,
 *   customJs?: string,
 *   customfavIcon?: string,
 *   explorer?: boolean,
 *   swaggerUrls?: string[],
 *   customSiteTitle?: string,
 *   customCssUrl?: string,
 *   customOptions?: swaggerUi.SwaggerConfigs
 * }} custom to custom swagger UI config
 */
export const setup = function (swaggerDoc, custom) {
  const swaggerUrl = custom.swaggerUrl
  const swaggerUrls = custom.swaggerUrls
  const windowOnload = jsTplString.split('<% swaggerOptions %>')

  swaggerConfig.swaggerUIInit = [
    windowOnload[0],
    stringify({
      swaggerDoc: swaggerDoc,
      swaggerUrl: swaggerUrl,
      swaggerUrls: swaggerUrls,
      customOptions: custom.customOptions || {}
    }),
    windowOnload[1]
  ].join('\n')

  const router = Router()

  router.use('/', [
    swaggerInitFn,
    express.static(swaggerUi.getAbsoluteFSPath(), { index: false })
  ])

  router.use('/', function (req, res) {
    const _swaggerDoc = req.swaggerDoc || swaggerDoc
    const html = generateHTML(_swaggerDoc, custom)
    res.send(html)
  })

  return router
}

export default { setup }
