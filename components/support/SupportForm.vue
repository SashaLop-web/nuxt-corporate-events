<template>
    <section class="support-form-section">
      <div class="container">
        <h2>Остались вопросы?</h2>
        <p>Заполните форму ниже и мы ответим в ближайшее время</p>
  
        <form @submit.prevent="submitTicket" class="support-form">
          <input type="text" placeholder="Ваше имя" v-model="form.name" required />
          <input type="email" placeholder="Email" v-model="form.email" required />
          <select v-model="form.topic" required>
            <option disabled value="">Выберите тему</option>
            <option value="bug">Ошибка в работе</option>
            <option value="question">Общий вопрос</option>
            <option value="feature">Предложить функцию</option>
            <option value="other">Другое</option>
          </select>
          <textarea
            v-model="form.message"
            placeholder="Опишите вашу проблему или запрос"
            rows="5"
          ></textarea>
  
          <button type="submit" :disabled="isSubmitting" class="submit-btn">
            {{ isSubmitting ? 'Отправка...' : 'Отправить запрос' }}
          </button>
  
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const form = ref({
    name: '',
    email: '',
    topic: '',
    message: ''
  })
  
  const isSubmitting = ref(false)
  const successMessage = ref('')
  const errorMessage = ref('')
  
  const submitTicket = () => {
    if (!form.value.name || !form.value.email || !form.value.message) {
      errorMessage.value = 'Пожалуйста, заполните все поля'
      return
    }
  
    isSubmitting.value = true
  
    // Здесь можно добавить логику отправки формы (через API, EmailJS, Formspree и т.д.)
    setTimeout(() => {
      isSubmitting.value = false
      successMessage.value = 'Спасибо! Ваш запрос успешно отправлен.'
      console.log('Форма отправлена:', form.value)
  
      // Очистка формы через 3 секунды
      setTimeout(() => {
        successMessage.value = ''
        form.value = {
          name: '',
          email: '',
          topic: '',
          message: ''
        }
      }, 3000)
    }, 1000)
  }
  </script>
<style scoped>
.support-form-section {
  background-color: #f9f9f9;
  padding: 80px 20px;
  text-align: center;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 20px;
}

.support-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
}

.support-form input,
.support-form select,
.support-form textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  background-color: #fff;
  transition: border-color 0.3s ease;
}

.support-form input:focus,
.support-form select:focus,
.support-form textarea:focus {
  border-color: #ff9800;
  outline: none;
}

.support-form button.submit-btn {
  padding: 14px;
  background-color: #ff9800;
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.support-form button.submit-btn:hover {
  background-color: #f48024;
}

.support-form button.submit-btn:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.success-message {
  margin-top: 20px;
  color: #4caf50;
  font-weight: 500;
}

.error-message {
  margin-top: 20px;
  color: #f44336;
  font-weight: 500;
}
@media (max-width: 768px) {
  .support-form-section h2 {
    font-size: 28px;
  }

  .support-form input,
  .support-form select,
  .support-form textarea {
    font-size: 14px;
  }

  .support-form button.submit-btn {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .support-form input,
  .support-form select,
  .support-form textarea {
    padding: 12px 14px;
  }
}
</style>