<template>
    <SupportHero />
    <SupportFAQ />
    <SupportForm />
    <SupportContact />
    <KnowledgeBaseSection/>
    <CareersSupport/>
  
</template>
<script setup>
import SupportHero from '@/components/support/SupportHero.vue'
  import SupportFAQ from '@/components/support/SupportFAQ.vue'
  import SupportForm from '@/components/support/SupportForm.vue'
  import SupportContact from '@/components/support/SupportContact.vue'
  import KnowledgeBaseSection from '@/components/support/KnowledgeBaseSection.vue'
  import CareersSupport from '@/components/support/CareersSupport.vue'
//   import SupportContact from '@/components/support/SupportContact.vue'

    const submitTicket = () => {
    alert('Запрос отправлен!');
    };

    const openChat = () => {
    // Логика открытия виджета чата
    };
</script>

  
