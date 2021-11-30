<template>
    <div class="q-pa-md">
        <div class="q-gutter-y-md" style="max-width:600%">
            <q-card>
                <q-tabs
                    v-model="tab"
                    dense
                    class="text-grey"
                    active-color="primary"
                    indicator-color="primary"
                    align="justify"
                    narrow-indicator
                >
                    <q-tab name="bar" label="bar" />
                    <q-tab name="line" label="line" />
                    <q-tab name="movies" label="Movies" />
                </q-tabs>
                <q-tab-panels v-model="tab" keep-alive>
                    <q-tab-panel name="bar">
                        <Bar></Bar>
                    </q-tab-panel>
                </q-tab-panels>
            </q-card>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import bar from '../pages/bar.vue'
export default {
    components: {
        Bar: bar
    },
    setup () {

        return { tab: ref('movies') }
    },
}
</script>