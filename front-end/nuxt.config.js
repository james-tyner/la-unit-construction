const fetch = require("node-fetch");

export default {
  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'Add it up.',
    meta: [
      { name: "robots", content: "noindex" },
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    'bootstrap-vue/nuxt'
  ],

  bootstrapVue:{
    components:["BTable", "BPagination"]
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  },

  env:{
    apiUrl: process.env.API_URL,
    mapboxApiKey: process.env.MAPBOX_API_KEY
  },/*
  generate:{
    async routes(){
      console.log(process.env.API_URL + "/api/neighborhoods/list");
      
      const list = await fetch(process.env.API_URL + "/api/neighborhoods/list").then(res => res.json());

      return list.map(zip => {
        return `/info/${zip}`
      })
    }
  }*/
}
