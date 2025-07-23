const { defineConfig } = require('@vue/cli-service')
const { VantResolver } = require('unplugin-vue-components/resolvers')
const ComponentsPlugin = require('unplugin-vue-components/webpack')
const webpack = require('webpack');


module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        // 设置 Vue 3 的编译时特性标志
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false), // 关闭 SSR 水合不匹配的详细警告
        __VUE_OPTIONS_API__: JSON.stringify(true),    // 启用 Options API（如果只用 Composition API 可设为 false）
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false), // 关闭生产环境 DevTools
      }),
      ComponentsPlugin({
        resolvers: [VantResolver()], // 自动导入 Vant 组件
      }),
    ],
  },
  transpileDependencies: true,
})
