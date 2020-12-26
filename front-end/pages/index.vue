<template>
  <div class="container">
    <p v-for="zip in zips">
      {{zip}}
    </p>
  </div>
</template>

<script>
export default {
  data(){
    return {
      zips:[]
    }
  },
  async fetch(){
    this.zips = await fetch(
        `${process.env.apiUrl}/api/neighborhoods/list`
      ).then(res => res.json())
  }
}
</script>