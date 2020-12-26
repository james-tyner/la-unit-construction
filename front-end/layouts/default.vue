<template>
  <div>
    <Navbar></Navbar>

    <Nuxt />

    <Footer></Footer>
  </div>
</template>

<script>
import Navbar from '~/components/Navbar.vue';
import Footer from '~/components/Footer.vue';

export default {
  components:{
    Navbar,
    Footer
  }
}
</script>

<style>
@import '~/assets/styles/css/base.min.css';
</style>
