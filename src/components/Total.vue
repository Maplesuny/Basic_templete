<template>
    <div class="q-pa-md">
        <div class="q-gutter-y-md" style="max-width:2400px">
            <q-card>
                <q-tabs
                    v-model="which"
                    dense
                    class="text-grey"
                    active-color="primary"
                    indicator-color="primary"
                    align="justify"
                    narrow-indicator
                >
                    <q-tab name="A1_A2" label="A1 A2 Montage" />
                    <q-tab name="CZ" label="CZ Montage" />
                    <q-tab name="Double_Banana" label="Double Banana" />
                </q-tabs>
                <q-tab-panels v-model="which" keep-alive>
                    <q-tab-panel name="A1_A2">
                        <A1_A2></A1_A2>
                    </q-tab-panel>
                    <q-tab-panel name="CZ">
                        <CZ></CZ>
                    </q-tab-panel>
                    <q-tab-panel name="Double_Banana">
                        <Banana></Banana>
                    </q-tab-panel>
                </q-tab-panels>
            </q-card>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import A1_A2 from '../pages/A1_A2.vue'
import CZ from '../pages/CZ.vue'
import Banana from '../pages/Double Banana.vue'
export default {
    components: {
        A1_A2: A1_A2,
        CZ: CZ,
        Banana: Banana,
    },
    setup () {

        return { which: ref('A1_A2') }
    },
}
</script>