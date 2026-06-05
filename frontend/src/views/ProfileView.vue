<template>
  <v-card class="mx-auto profile-card" max-width="900">

    <!-- COVER -->
    <div class="cover-wrapper">
      <v-img src="logo.png" height="400" contain />

      <div class="cover-gradient"></div>

      <!-- ICONOS SUPERIORES -->
      <div class="cover-actions">
        <v-btn icon="mdi-chevron-left" variant="text" />
        <div>
          <v-btn icon="mdi-pencil" variant="text" />
          <v-btn icon="mdi-dots-vertical" variant="text" />
        </div>
      </div>

      <!-- PROFILE FLOAT -->
      <div class="profile-float">
        <v-avatar size="140" class="profile-avatar">
          <v-img src="/logo.jpg" />
        </v-avatar>

        <div class="profile-name">
          {{ user.name }}
        </div>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="content">

      <v-list lines="two">

        <!-- ROL -->
        <v-list-item>
          <template #prepend>
            <v-avatar>
              <v-icon icon="mdi-shield-account" color="indigo" />
            </v-avatar>
          </template>
          <v-list-item-title>{{ user.role }}</v-list-item-title>
          <v-list-item-subtitle>Rol</v-list-item-subtitle>
        </v-list-item>

        <v-divider inset />

        <!-- EMAIL -->
        <v-list-item>
          <template #prepend>
            <v-avatar>
              <v-icon icon="mdi-email" color="indigo" />
            </v-avatar>
          </template>
          <v-list-item-title>{{ user.email }}</v-list-item-title>
          <v-list-item-subtitle>Correo electrónico</v-list-item-subtitle>
        </v-list-item>

        <v-divider inset />

        <!-- PHONE -->
        <v-list-item>
          <template #prepend>
            <v-avatar>
              <v-icon icon="mdi-phone" color="indigo" />
            </v-avatar>
          </template>
          <v-list-item-title>{{ user.phone }}</v-list-item-title>
          <v-list-item-subtitle>Teléfono</v-list-item-subtitle>
        </v-list-item>

        <v-divider inset />

        <!-- LOCATION -->
        <v-list-item>
          <template #prepend>
            <v-avatar>
              <v-icon icon="mdi-map-marker" color="indigo" />
            </v-avatar>
          </template>
          <v-list-item-title>{{ user.location }}</v-list-item-title>
          <v-list-item-subtitle>Ubicación</v-list-item-subtitle>
        </v-list-item>

        <v-divider inset />

        <!-- JOINED -->
        <v-list-item>
          <template #prepend>
            <v-avatar>
              <v-icon icon="mdi-calendar" color="indigo" />
            </v-avatar>
          </template>
          <v-list-item-title>{{ user.memberSince }}</v-list-item-title>
          <v-list-item-subtitle>Miembro desde</v-list-item-subtitle>
        </v-list-item>

      </v-list>

      <!-- ABOUT -->
      <div class="about">
        <h3>Sobre mí</h3>
        <p>{{ user.about || "Usuario del Sistema Activo" }}</p>
      </div>

    </div>

  </v-card>
</template>

<script setup>

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// usuario logueado
const user = computed(() => authStore.user)

console.log(user)

</script>



<style scoped>
.profile-card {
  overflow: visible;
}

.cover-wrapper {
  position: relative;
}

.cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.15),
    rgba(0,0,0,0.8)
  );
}

.cover-actions {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}

.profile-float {
  position: absolute;
  bottom: -50px;
  left: 32px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 3;
}

.profile-avatar {
  border: 4px solid white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.35);
}

.profile-name {
  color: white;
  font-size: 28px;
  font-weight: 600;
  text-shadow: 0 3px 8px rgba(0,0,0,0.6);
}

.content {
  margin-top: 80px;
}

.about {
  padding: 16px;
}
</style>
