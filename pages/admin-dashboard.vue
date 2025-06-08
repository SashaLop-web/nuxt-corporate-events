<template>
  <div class="admin-dashboard">
    <h1>Админ-панель</h1>
    <p>Добро пожаловать, {{ user?.full_name || 'администратор' }}!</p>

    <div class="section">
      <h2>Ближайшие мероприятия</h2>
      <ul v-if="upcomingEvents.length" class="event-list">
        <li v-for="event in upcomingEvents" :key="event.id" class="event-card">
          <h3>{{ event.title }}</h3>
          <p>📅 {{ formatDateTime(event.event_date) }}</p>
          <p>🏷️ Тип: {{ formatEventType(event.type) }}</p>
          <p>📍 Место: {{ event.location || 'не указано' }}</p>
          <p v-if="event.location_comment">💬 {{ event.location_comment }}</p>
          <p v-if="event.description">📝 {{ event.description }}</p>
        </li>
      </ul>
      <p v-else>Нет запланированных мероприятий.</p>
    </div>

    <div class="section" v-if="pastEvents.length">
      <h2>Прошедшие мероприятия</h2>
      <ul class="event-list">
        <li v-for="event in pastEvents" :key="event.id" class="event-card past">
          <h3>{{ event.title }}</h3>
          <p>📅 {{ formatDateTime(event.event_date) }}</p>
          <p>🏷️ Тип: {{ formatEventType(event.type) }}</p>
          <p>📍 Место: {{ event.location || 'не указано' }}</p>
          <p v-if="event.location_comment">💬 {{ event.location_comment }}</p>
          <p v-if="event.description">📝 {{ event.description }}</p>
        </li>
      </ul>
    </div>

    <div class="section">
      <h2>Мои новости</h2>
      <ul v-if="news.length" class="news-list">
        <li v-for="n in sortedNews" :key="n.id" class="news-card">
          <h3>{{ n.title }}</h3>
          <p class="news-date">📅 {{ formatDate(n.published_at || n.created_at) }}</p>
          <p class="news-content">{{ truncateText(n.content, 160) }}</p>
          <p v-if="n.event_title" class="news-event">🔗 Связано с мероприятием: <strong>{{ n.event_title }}</strong></p>
        </li>
      </ul>
      <p v-else>Вы ещё не публиковали новости.</p>
    </div>

    <LogoutButton />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { storeToRefs } from 'pinia'
import { useFetch, definePageMeta } from '#imports'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const events = ref<any[]>([])
const news = ref<any[]>([])

const now = new Date()

const upcomingEvents = computed(() =>
  events.value
    .filter(e => new Date(e.event_date) >= now)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
)

const pastEvents = computed(() =>
  events.value
    .filter(e => new Date(e.event_date) < now)
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
)

const sortedNews = computed(() =>
  news.value.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
)

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

const formatEventType = (type: string): string => {
  const map: Record<string, string> = {
    meeting_individual: 'Встреча с сотрудниками',
    meeting_department: 'Встреча по отделу',
    teambuilding: 'Тимбилдинг',
    training: 'Обучение / Воркшоп',
    corporate: 'Корпоративный праздник',
    presentation: 'Презентация / Конференция'
  }
  return map[type] || type
}

function truncateText(text: string, maxLength: number) {
  return text.length <= maxLength ? text : text.slice(0, maxLength) + '...'
}

const fetchDashboardData = async () => {
  const token = localStorage.getItem('authToken')
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  if (!token || !currentUser.id) return

  try {
    const { data: eventData } = await useFetch<{ events: any[] }>('/api/events/by-user', {
      query: { organizer_id: currentUser.id },
      headers: { Authorization: `Bearer ${token}` }
    })
    events.value = eventData.value?.events || []

    const { data: newsData } = await useFetch<{ news: any[] }>('/api/news/by-user', {
      query: { author_id: currentUser.id },
      headers: { Authorization: `Bearer ${token}` }
    })
    news.value = newsData.value?.news || []
  } catch (err) {
    console.error('Ошибка загрузки данных:', err)
  }
}

onMounted(fetchDashboardData)

definePageMeta({
  middleware: ['auth-middleware'],
  roles: ['admin']
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 900px;
  margin: 120px auto;
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
}

.section {
  margin-top: 40px;
}

h2 {
  font-size: 22px;
  margin-bottom: 15px;
  color: #333;
}

.event-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 15px;
}

.event-card {
  background: #f1fef4;
  border-left: 5px solid #4caf50;
  padding: 15px 20px;
  border-radius: 8px;
}

.event-card.past {
  background: #f7f7f7;
  border-left-color: #ccc;
  opacity: 0.8;
}

.event-card h3 {
  margin: 0 0 5px;
  font-size: 18px;
  color: #222;
}

.event-card p {
  margin: 4px 0;
  font-size: 14px;
  color: #444;
}

.news-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 15px;
}

.news-card {
  background: #fffdf9;
  border-left: 4px solid #ffa726;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.news-card h3 {
  margin-bottom: 6px;
  font-size: 18px;
  color: #222;
}

.news-date {
  font-size: 13px;
  color: #777;
}

.news-content {
  margin: 10px 0;
  font-size: 14px;
  color: #444;
}

.news-event {
  font-size: 13px;
  color: #4caf50;
  font-weight: 500;
}
</style>
