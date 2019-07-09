var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',

  // // 连接到线上的测试服务。
  // API_BASE_URL: '"http://118.89.236.164:8081/3dapitest1/"',
  // API_PARAM_SEP_FIRST: '"&"', // 如果API_BASE_URL中包含了?，则这里应该配置为&，否则就配置为?

  // 连接到本地的测试服务。
  API_BASE_URL: '"http://zcy36x.natappfree.cc/"',
  API_PARAM_SEP_FIRST: '"?"', // 如果API_BASE_URL中包含了?，则这里应该配置为&，否则就配置为?

  // // 通过本地服务跳转到客户那边的服务。
  // API_BASE_URL: '"http://jtech2.s1.natapp.cc/index.php?type="',
  // API_PARAM_SEP_FIRST: '"&"', // 如果API_BASE_URL中包含了?，则这里应该配置为&，否则就配置为?
})
