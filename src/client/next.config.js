module.exports = {
  distDir: 'build',
  env: {
    //API_URL: 'http://localhost:5000',//'https://qbestd-box.herokuapp.com',
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    API_URL: 'http://api:5000'
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    API_URL: 'http://localhost:5000'
  }
}
