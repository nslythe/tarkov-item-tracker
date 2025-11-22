<template>
  <v-container>
    <v-text-field
      :append-icon="show_token ? 'mdi-eye' : 'mdi-eye-off'"
      v-model="progress_store.tarkov_tracker_token"
      @keydown.enter="tarkov_tracker_token_updated"
      :type="show_token ? 'text' : 'password'"
      @click:append="show_token = !show_token"/>

    <v-btn @click="refresh_progress">Refresh</v-btn>


    <v-container v-if="progress_store.tarkov_tracker_token === null">
      Configure
    </v-container>

    <v-container v-else>
      <v-container v-if="!progress_store.loaded || !hideout_station_store.loaded">
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-container>
      
      <v-container v-else>
        <v-row>
          <v-col v-for="item in progress_store.item_total_owned" cols="3">
            <v-card :color="card_color_for_item_requirement(item)">
              <v-card-text>
                <v-img height="64" :src="item.item.iconLink" />
                <p class="text-center">
                {{ item.count }} / {{ item.needed }}
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { useHideoutStationStore } from '../stores/hideout_station'
  import { useProgressStore, type ItemRequirement } from '../stores/progress'

  const hideout_station_store = useHideoutStationStore()
  const progress_store = useProgressStore()

  const show_token = ref<boolean>(false)

  onMounted(async () => {
    progress_store.init()
    await progress_store.load()
    await hideout_station_store.load()
    progress_store.calculate()
  })

  const refresh_progress = async function()
  {
    await progress_store.load()
    progress_store.calculate()
  }

  const card_color_for_item_requirement = function(item: ItemRequirement)
  {
    if (item.finished)
    {
      return 'success'
    }
    return undefined
  }

  const tarkov_tracker_token_updated = function()
  {
    localStorage.setItem('tarkov_tracker_token', progress_store.tarkov_tracker_token)
    refresh_progress()
  }
</script>
