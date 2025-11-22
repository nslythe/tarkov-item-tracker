<template>
  <div>
    <v-container>
      <a href="https://github.com/nslythe/tarkov-item-tracker">
        <font-awesome-icon color="white" white="64" :icon="['fab', 'github']" />
      </a>
      <v-text-field
        class="mt-3"
        :append-icon="show_token ? 'mdi-eye' : 'mdi-eye-off'"
        v-model="progress_store.tarkov_tracker_token"
        @keydown.enter="tarkov_tracker_token_updated"
        :type="show_token ? 'text' : 'password'"
        @click:append="show_token = !show_token"/>

    <v-btn @click="refresh_progress">Refresh</v-btn>
    </v-container>

    <div v-if="progress_store.tarkov_tracker_token === null">
      Configure
    </div>

    <div v-else>
      <div v-if="!progress_store.loaded || !hideout_station_store.loaded">
        <v-skeleton-loader type="table-row"></v-skeleton-loader>
      </div>
      
      <div v-else>
        <v-row>
          <v-col v-for="item in progress_store.item_total_owned" :cols="cols_factor">
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
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { useHideoutStationStore } from '../stores/hideout_station'
  import { useProgressStore, type ItemRequirement } from '../stores/progress'

  const hideout_station_store = useHideoutStationStore()
  const progress_store = useProgressStore()

  const show_token = ref<boolean>(false)
  const cols_factor = ref<number>(2)

  onMounted(async () => {
    resize()
    progress_store.init()
    await progress_store.load()
    await hideout_station_store.load()
    progress_store.calculate()
  })

  window.addEventListener("resize", function()
  {
    resize()
  });

  const resize = async function()
  {
    if (window.innerHeight > window.innerWidth)
    {
      cols_factor.value = 2;
    }else{
      cols_factor.value = 1;
    }
  }


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
    if (progress_store.tarkov_tracker_token !== undefined)
    {
      localStorage.setItem('tarkov_tracker_token', progress_store.tarkov_tracker_token!)
      refresh_progress()
    }
  }
</script>
