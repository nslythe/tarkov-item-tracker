// Utilities
import { defineStore } from 'pinia'
import { inject, ref } from "vue";
import { id } from 'vuetify/locale';

export type ItemRequirement = {
  id: string
  count: number
  quantity: number
  item: {
    id: string
    name: string
    gridImageLink: string
    iconLink: string
  }
}

export const useHideoutStationStore = defineStore('hideout_station', () => {
  const hideout_station = ref()
  const loaded = ref<boolean>(false)

  const load = async function()
  {
    loaded.value = false
    const response = await fetch('https://api.tarkov.dev/graphql', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query: `{
            hideoutStations(lang: en, gameMode: pve) {
                id
                name
                normalizedName
                levels {
                  id
                  level
                  itemRequirements {
                      id
                      count
                      quantity
                      item {
                        id
                        name
                        gridImageLink
                        iconLink
                      }
                  }
              }
          }
        }`
    })})
    hideout_station.value = (await response.json()).data.hideoutStations
    loaded.value = true
  }

  const get_item_requirement_from_id = function(item_requirement_id: string): ItemRequirement | undefined
  {
    if (hideout_station.value === undefined)
    {
      return undefined
    }

    for (const hs of hideout_station.value)
    {
      for(const hl of hs.levels)
      {
        for(const ir of hl.itemRequirements)
        {
          if (ir.id === item_requirement_id)
          {
            return ir
          }
        }
      }
    }
    return undefined;
  }

  const get_level_requirement_from_id = function(level_requirement_id: string): Array<ItemRequirement>
  {
    const return_value: Array<ItemRequirement> = []
    if (hideout_station.value === undefined)
    {
      return return_value
    }

    for (const hs of hideout_station.value)
    {
      for(const hl of hs.levels)
      {
        if (hl.id === level_requirement_id)
        {
          for(const ir of hl.itemRequirements)
          {
            return_value.push(ir)
          }
        }
      }
    }
    return return_value
  }


  return {
    loaded,
    load,
    hideout_station,
    get_item_requirement_from_id,
  }

})
