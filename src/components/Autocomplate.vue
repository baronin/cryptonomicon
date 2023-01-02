<template>
  <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
    <span
      v-for="coin in coins"
      :key="coin"
      class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
    >
      {{ coin }}
    </span>
  </div>
</template>

<script>
export default {
  name: "Autocomplate",
  props: {
    coins: {
      type: Array,
      default: () => []
    }
  }
};
</script>
