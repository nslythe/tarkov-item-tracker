// Utilities
import { defineStore } from 'pinia'
import { inject, ref } from "vue";
import { useHideoutStationStore } from '../stores/hideout_station'

export type ItemRequirement = {
  id: string
  item: any
  count: number
  needed: number
  finished: boolean
}

export const useProgressStore = defineStore('progress', () => {
  const hideout_station_store = useHideoutStationStore()

  const loaded = ref<boolean>(false)
  const tasksProgress = ref()
  const taskObjectivesProgress = ref()
  const hideoutModulesProgress = ref()
  const hideoutPartsProgress = ref()
  const item_total_needed_map = ref<Map<string, ItemRequirement>>(new Map<string, ItemRequirement>())
  const item_total_owned_map = ref<Map<string, ItemRequirement>>(new Map<string, ItemRequirement>())
  const tarkov_tracker_token = ref<string | null>()

  const init = function()
  {
    tarkov_tracker_token.value = localStorage.getItem('tarkov_tracker_token')
  }

  const load = async function()
  {
    loaded.value = false;
    const r = await fetch('https://tarkovtracker.io/api/v2/progress',
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + tarkov_tracker_token.value,
      },
    })

    const json_data = await r.json()
    tasksProgress.value = json_data.data.tasksProgress
    taskObjectivesProgress.value = json_data.data.taskObjectivesProgress
    hideoutModulesProgress.value = json_data.data.hideoutModulesProgress
    hideoutPartsProgress.value = json_data.data.hideoutPartsProgress

    loaded.value = true
  }

  const calculate = function()
  {
    calculate_total_item_needed()
    calculate_total_item_owned()
  }

  const calculate_total_item_needed = function()
  {
    if (!hideout_station_store.loaded)
    {
      return
    }

    item_total_needed_map.value.clear()
    for (const hs of hideout_station_store.hideout_station)
    {
      for(const hl of hs.levels)
      {
        for(const ir of hl.itemRequirements)
        {
          let new_item: ItemRequirement = {
            id: ir.item.id,
            needed: ir.count,
            item: ir.item,
            count: 0,
            finished: false,
          }
          if (item_total_needed_map.value.has(ir.item.id))
          {
            new_item.needed += item_total_needed_map.value.get(ir.item.id)!.needed
          }

          item_total_needed_map.value.set(new_item.id, new_item)
        }
      }
    }
  }

  const calculate_total_item_owned = function()
  {
    item_total_owned_map.value.clear()
    for (const p of hideoutPartsProgress.value)
    {
      const hideout_item_requirement = hideout_station_store.get_item_requirement_from_id(p.id)
      if (hideout_item_requirement === undefined)
      {
        continue
      }

      const new_item: ItemRequirement = {
        id: hideout_item_requirement!.item.id,
        item: hideout_item_requirement!.item,
        count: p.count,
        needed: item_total_needed_map.value.get(hideout_item_requirement!.item.id)!.needed,
        finished: false,
      }

      if (item_total_owned_map.value.has(new_item.id))
      {
        new_item.count += item_total_owned_map.value.get(new_item.id)!.count
      }

      if (new_item.count >= new_item.needed)
      {
        new_item.finished = true
      }

      item_total_owned_map.value.set(new_item.id, new_item)
    }
  }


  const item_total_needed = computed(() => {
    return Array.from(item_total_needed_map.value.values())
  })

  const item_total_owned = computed(() => {
    const return_value = Array.from(item_total_owned_map.value.values())
    return return_value.sort((a, b) => {
      if (a.finished && !b.finished)
      {
        return 1
      }
      if (!a.finished && b.finished)
      {
        return -1
      }

      return a.item.name.localeCompare(b.item.name)
    });
  })

  return {
    init,
    tarkov_tracker_token,
    load,
    loaded,
    calculate,
    item_total_needed,
    item_total_owned,
  }
})
