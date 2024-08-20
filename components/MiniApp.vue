<script lang="ts" setup>
import { MainButton, useWebAppPopup, useWebAppTheme } from 'vue-tg'

const { showAlert } = useWebAppPopup()
const { setBackgroundColor } = useWebAppTheme()
</script>

<template>
  <MainButton text="Заказать" @click="() => showAlert('Спасибо за ваш заказ! Мы свяжемся с вами в Телеграм.')" />
</template>