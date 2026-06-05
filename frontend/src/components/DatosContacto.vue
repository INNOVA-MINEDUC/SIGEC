<template>
    <v-card
      class="pa-6"
      elevation="16"
      width="60vw"
      title="Datos de Contacto:"
      subtitle="Recuerda llenar toda la información del FORMULARIO"
      text="Por favor, completa todos los campos con información verídica."
    >
      <v-form class="d-flex flex-column align-center" style="width: 100%;">
        
        <!-- Nombre -->
        <v-text-field
          clearable
          label="Nombre Completo"
          prepend-inner-icon="mdi-account"
          class="w-75"
        ></v-text-field>

        <!-- DPI -->
        <v-text-field
          clearable
          label="DPI"
          prepend-inner-icon="mdi-card-account-details"
          class="w-75"
        ></v-text-field>

        <!-- Tipo de Usuario -->
        <v-select
          clearable
          label="Tipo de Usuario"
          prepend-inner-icon="mdi-account-group"
          :items="['Ciudadano', 'Empleado Público', 'Proveedor', 'Otro']"
          class="w-75"
        ></v-select>

        <!-- Contacto Principal -->
        <div class="d-flex justify-space-between w-75" style="gap: 16px;">
          <v-select
            clearable
            label="Tipo de Contacto Principal"
            prepend-inner-icon="mdi-cellphone"
            :items="['Teléfono', 'Correo', 'WhatsApp']"
            class="w-50"
          ></v-select>

          <v-text-field
            clearable
            label="Contacto Principal"
            prepend-inner-icon="mdi-phone"
            class="w-50"
          ></v-text-field>
        </div>

        <!-- Contacto Alterno -->
        <div class="d-flex justify-space-between w-75" style="gap: 16px;">
          <v-select
            clearable
            label="Tipo de Contacto Alterno"
            prepend-inner-icon="mdi-cellphone-message"
            :items="['Teléfono', 'Correo', 'WhatsApp']"
            class="w-50"
          ></v-select>

          <v-text-field
            clearable
            label="Contacto Alterno"
            prepend-inner-icon="mdi-phone-in-talk"
            class="w-50"
          ></v-text-field>
        </div>

        <!-- Confidencialidad -->
        <v-radio-group
          label="¿Desea que sus datos personales sean confidenciales?"
          class="w-75 mt-4"
        >
          <v-radio label="Sí" value="true"></v-radio>
          <v-radio label="No" value="false"></v-radio>
        </v-radio-group>
      </v-form>
    </v-card>
</template>
