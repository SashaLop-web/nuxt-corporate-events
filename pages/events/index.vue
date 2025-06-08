<template>
  <div class="events-list-page">
    <h1>Список мероприятий</h1>

    <!-- Список мероприятий -->
    <ul v-if="events.length > 0" class="events-list">
      <li v-for="event in events" :key="event.id" class="event-item">
        <h3>{{ event.title }}</h3>
        <p><strong>Тип:</strong> {{ event.type }}</p>
        <p><strong>Дата:</strong> {{ formatDate(event.event_date) }}</p>
        <p><strong>Место:</strong> {{ event.location || 'Не указано' }}</p>
      </li>
    </ul>

    <!-- Сообщение, если мероприятий нет -->
    <p v-else>Список мероприятий пуст.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFetch } from '#app'

interface EventItem {
  id: number
  title: string
  type: string
  event_date: string
  location?: string | null
}

interface ApiResponse {
  status: string
  data: EventItem[]
}

const events = ref<EventItem[]>([])

const { data, error } = await useFetch<ApiResponse>('/api/events')

if (error.value) {
  console.error('Ошибка получения мероприятий:', error.value)
} else if (data.value?.data) {
  events.value = data.value.data
}

// Форматирование даты
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<style scoped>
.events-list-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.events-list {
  list-style: none;
  padding: 0;
}

.event-item {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 15px;
}

.event-item h3 {
  margin: 0 0 10px;
}

.event-item p {
  margin: 5px 0;
}
</style>
