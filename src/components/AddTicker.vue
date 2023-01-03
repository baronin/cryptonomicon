<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Ticker {{ ticker }}</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @input="onInputTickets"
            @keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Example DOGE"
          />
        </div>
        <!-- <autocomplate
          v-show="isOpen"
          v-if="newCoin.length"
          :coins="newCoin"
          @click="onSelectCoin($event.target.textContent)"
          @mousedown.prevent
        /> -->
        <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
          <span
            v-for="coin in topCoins"
            :key="coin"
            @click="ticker = coin"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ coin }}
          </span>
        </div>
        <div v-if="hasTicker" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button @click="add" :disabled="disabled" class="my-4" />
  </section>
</template>

<script>
import AddButton from "@/components/AddButton";

export default {
  name: "AddTicker",
  components: {
    AddButton
  },
  props: {
    disabled: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  emits: {
    "add-ticker": (value) => typeof value === "string" && value.length > 0
  },
  data() {
    return {
      ticker: ""
    };
  },
  methods: {
    add() {
      if (this.ticker.length === 0) return;
      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
    }
  }
};
</script>
