<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <spinner v-if="isLoading" />
    <div class="container">
      <add-ticker @add-ticker="add" :disabled="toManyTickersAdded" />
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />

        <div class="mb-5">
          <button
            v-if="page > 1"
            type="button"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
            @click="page = page - 1"
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            type="button"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
            @click="nextPage"
          >
            Вперед
          </button>
        </div>
        <p>Фильтр: <input v-model="filter" placeholder="filter" /></p>
        <p>Страница {{ page }}</p>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
            :class="[
              { 'border-4': selectedTicker === t },
              { 'bg-red-400': formatPrice(t.price) === '-' }
            ]"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <v-chart v-if="selectedTicker" :selected-ticker="selectedTicker" :graph="graph" />
    </div>
  </div>
</template>

<script>
// import Autocomplate from "./components/Autocomplate.vue";
import Spinner from "./components/Spinner.vue";
import coinsListJson from "./mockData/coinsList.json";
import { api } from "./api";
import AddTicker from "@/components/AddTicker";
import VChart from "@/components/chart";

export default {
  name: "App",
  components: {
    VChart,
    AddTicker,
    Spinner
    // Autocomplate
  },
  data() {
    return {
      isLoading: false,
      isOpen: false,
      newCoin: [],
      coinsList: [],
      filter: "",
      tickers: [],
      hasTicker: false,
      selectedTicker: null,
      graph: [],
      topCoins: ["BTC", "DOGE", "BCH", "CHD"],
      page: 1,
      maxGraphElements: 1
    };
  },
  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    /*  if (windowData.filter) {
      this.filter = windowData.filter;
    }
    if (windowData.page) {
      this.page = windowData.page;
    } */
    // оптимизация
    const VALID_KEYS = ["filter", "page"];

    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    const tickersData = localStorage.getItem("cryptonomicon-list");
    console.log("tickersData", tickersData);
    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        api.subscribeToTicker(ticker.name, (newPrice) => {
          console.log("ticker.name, newPrice", ticker.name, newPrice);
          this.updateTicker(ticker.name, newPrice);
        });
      });
    }

    setInterval(this.updateTicker, 5000);
  },
  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphElements);
    if (coinsListJson.Response === "Success") {
      for (let key of Object.keys(Object.assign(coinsListJson.Data))) {
        this.coinsList.push(key.toLocaleLowerCase());
      }
    }
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.calculateMaxGraphElements);
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    filteredTickers() {
      return this.tickers.filter((ticker) => ticker.name.includes(this.filter));
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      };
    },
    toManyTickersAdded() {
      return this.tickers.length > 3;
    }
  },
  methods: {
    calculateMaxGraphElements() {
      if (!this.$refs.graph) return;
      this.maxGraphElements = this.$refs.graph.clientWidth / 38;
    },
    updateTicker(tickerName, price) {
      console.log("updateTicker", this.$refs.graph);
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          if (t === this.selectedTicker) {
            this.graph.push(price);
            while (this.graph.length > this.maxGraphElements) {
              this.graph.shift();
            }
          }
          t.price = price;
        });
    },
    formatPrice(price) {
      if (price === "-") return price;
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    nextPage() {
      this.page = Number(this.page) + 1;
    },
    add(ticker) {
      // this.newCoin = [];
      // if (!this.ticker.length) return;
      // const hasTicker = this.tickers.find((item) => item.name === this.ticker);
      // if (hasTicker) return;

      const currentTicker = {
        name: ticker,
        price: "-"
      };

      this.tickers = [...this.tickers, currentTicker];
      this.filter = "";
      api.subscribeToTicker(currentTicker.name, (newPrice) =>
        this.updateTicker(currentTicker.name, newPrice)
      );
    },
    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((item) => item !== tickerToRemove);

      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      api.unsubscribeFromTicker(tickerToRemove.name);
    },
    onInputTickets() {
      this.hasTicker = false;
      this.filterResult();
      this.isOpen = true;

      // this.checkHasTicker ? (this.hasTicker = true) : (this.hasTicker = false);
    },
    filterResult() {
      this.newCoin = this.coinsList
        .filter((item) => {
          return item.toLowerCase().indexOf(this.ticker.toLowerCase()) > -1;
        })
        .slice(0, 4);
    },
    select(ticker) {
      this.selectedTicker = ticker;
    },
    onSelectCoin(e) {
      this.ticker = e;
      this.newCoin = [];
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.newCoin = [];
      }
    }
  },
  watch: {
    async selectedTicker() {
      this.graph = [];
      await this.$nextTick();
      this.calculateMaxGraphElements();
    },
    tickers(newValue, oldValue) {
      // TODO почему не сработал watch при добавлении
      console.log(newValue === oldValue);
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        // this.page = Math.max(1, this.page - 1);
        this.page = Number(this.page) - 1;
      }
    },
    filter() {
      this.page = 1;
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    }
  },
  unmounted() {
    document.removeEventListener("click", this.handleClickOutside);
  }
};
</script>
