<template>
  <div
    v-if="open"
    class="modal"
    :class="{ 'modal--open': open }"
    @click="close"
  >
    <div class="modal-content" @click.stop>
      <h2>Modal</h2>
      <hr class="my-8" />
      <slot />
      <hr class="my-8" />
      <div class="footer">
        <slot name="actions" :close="close" :confirm="confirm">
          <button
            @click="confirm"
            type="button"
            class="btn-confirm bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          >
            ok
          </button>
          <button
            type="button"
            class="close bg-transparent hover:bg-red-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
            @click="close"
          >
            &times;
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VModal",
  props: {
    open: {
      type: Boolean,
      required: false
    }
  },
  emits: {
    ok: null,
    close: null
  },
  mounted() {
    document.addEventListener("keydown", this.handleKeyDown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    close() {
      this.$emit("close");
    },
    confirm() {
      this.$emit("open");
    },
    handleKeyDown(e) {
      if (this.isOpen && e.key === "Escape") {
        this.close();
      }
    }
  }
};
</script>

<style scoped>
.modal {
  display: none;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}

.modal--open {
  display: block;
}

/* Modal Content/Box */
.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.footer {
  display: flex;
}
.btn-confirm {
  margin-left: auto;
  margin-right: 5px;
}
</style>
