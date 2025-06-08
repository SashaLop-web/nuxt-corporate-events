<template>
  <div class="event-create-page">
    <h1>Создать мероприятие</h1>

    <form @submit.prevent="createEvent" class="event-form">
      <div class="form-field">
        <label for="title">Название:</label>
        <input type="text" id="title" v-model="formData.title" required />
      </div>

      <div class="form-field">
        <label for="type">Тип:</label>
        <select id="type" v-model="formData.type" required>
          <option v-for="option in eventTypes" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="form-field" v-if="formData.type === 'meeting_individual'">
        <label for="participants">Участники встречи:</label>
        <select id="participants" multiple v-model="formData.participants">
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.full_name }}
          </option>
        </select>
        <small>Зажмите Ctrl (или ⌘ на Mac), чтобы выбрать нескольких сотрудников</small>
      </div>

      <div class="form-field">
        <label for="event_date">Дата:</label>
        <input type="datetime-local" id="event_date" v-model="formData.event_date" required />
      </div>

      <div class="form-field">
        <label for="description">Описание:</label>
        <textarea id="description" v-model="formData.description"></textarea>
      </div>

      <div class="form-field">
        <label for="location">Место:</label>
        <input type="text" id="location" v-model="formData.location" />
      </div>

      <div class="form-field">
        <label for="location_comment">Комментарий к месту:</label>
        <input type="text" id="location_comment" v-model="formData.location_comment" />
      </div>

      <div class="form-field" v-if="showCreateNewsOption">
        <label>Хотите сразу создать новость об этом мероприятии?</label>
        <select v-model="wantCreateNews">
          <option value="no">Нет</option>
          <option value="yes">Да</option>
        </select>
      </div>

      <button type="submit" class="submit-btn">Создать мероприятие</button>
    </form>

    <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFetch } from '#app'
import { useRouter } from 'vue-router'

interface User {
  id: number
  full_name: string
}
interface CreateEventResponse {
  status: 'success' | 'error'
  message?: string
  eventId?: number
}

const router = useRouter()

const eventTypes = [
  { value: 'meeting_individual', label: 'Встреча с конкретным(и) сотрудником(ами)' },
  { value: 'meeting_department', label: 'Встреча с сотрудниками отдела' },
  { value: 'teambuilding', label: 'Тимбилдинг' },
  { value: 'training', label: 'Обучение / Воркшопы' },
  { value: 'corporate', label: 'Корпоративный праздник' },
  { value: 'presentation', label: 'Презентация проекта / Конференция' },
]

const majorTypes = ['corporate', 'presentation', 'teambuilding']

const formData = ref({
  title: '',
  type: 'meeting_individual',
  event_date: '',
  description: '',
  location: '',
  location_comment: '',
  participants: [] as number[]
})

const users = ref<User[]>([])
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const wantCreateNews = ref<'yes' | 'no'>('no')

const showCreateNewsOption = computed(() => majorTypes.includes(formData.value.type))

onMounted(async () => {
  try {
    const token = localStorage.getItem('authToken')
    const { data, error } = await useFetch<{ users: User[] }>('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (error.value) throw new Error('Ошибка получения сотрудников')
    users.value = data.value?.users || []
  } catch (err: any) {
    console.error('Ошибка загрузки сотрудников:', err.message)
  }
})

async function createEvent() {
  try {
    message.value = null
    const token = localStorage.getItem('authToken')
    if (!token) throw new Error('Вы не авторизованы')

    const { data, error } = await useFetch<CreateEventResponse>('/api/events', {
      method: 'POST',
      body: formData.value,
      headers: { Authorization: `Bearer ${token}` }
    })

    if (error.value) throw new Error(error.value.data?.message || 'Ошибка создания мероприятия')

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const redirectToDashboard = user.role === 'admin' ? '/admin-dashboard' : '/manager-dashboard'

    if (showCreateNewsOption.value && wantCreateNews.value === 'yes') {
      router.push('/news/create')
    } else {
      router.push(redirectToDashboard)
    }

  } catch (err: any) {
    message.value = { type: 'error', text: err.message }
  }
}
</script>

<style scoped>
.event-create-page {
  max-width: 600px;
  margin: 100px auto;
  padding: 20px;
}
.event-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
input,
select,
textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}
select[multiple] {
  height: 140px;
  overflow-y: auto;
}
.submit-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
.submit-btn:hover {
  background-color: #45a049;
}
.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
}
.message.success {
  background-color: #d4edda;
  color: #155724;
}
.message.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
