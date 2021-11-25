<template>
    <q-layout view="hHh  Lpr lFf" class="shadow-2 rounded-borders">
        <q-header elevated>
            <q-toolbar class="bg-blue-grey-6">
                <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
                <q-toolbar-title class="navbar-brand">CMUH AI CENTER</q-toolbar-title>
                <q-space></q-space>
                <div class="q-pa-md q-gutter-sm">
                    <q-btn flat dense icon="login" label="login" @click="toggleLeftDrawer" />
                    <q-btn flat dense icon="logout" label="logout" @click="toggleLeftDrawer" />
                </div>

                <!-- <div>Quasar v{{ $q.version }}</div> -->
            </q-toolbar>
        </q-header>
        <q-drawer
            v-model="drawer"
            showif-above
            :mini="miniState"
            @mouseover="miniState = false"
            @mouseout="miniState = true"
            :width="180"
            :breakpoint="500"
            bordered
            class="bg-grey-1"
        >
            <q-scroll-area class="fit">
                <q-list v-model="tab" padding>
                    <q-item to="/" exact>
                        <q-item-section avatar>
                            <q-icon name="home" />
                        </q-item-section>
                        <q-item-section>Home</q-item-section>
                    </q-item>
                    <q-item to="/line" exact>
                        <q-item-section avatar>
                            <q-icon name="signal_cellular_alt" />
                        </q-item-section>
                        <q-item-section>Inbox</q-item-section>
                    </q-item>
                    <q-item to="/eeg" exact>
                        <q-item-section avatar>
                            <q-icon name="insert_chart_outlined"></q-icon>
                        </q-item-section>
                        <q-item-section>EEG</q-item-section>
                    </q-item>
                    <q-item to="/Total" exact>
                        <q-item-section avatar>
                            <q-icon name="poll"></q-icon>
                        </q-item-section>
                        <q-item-section>Charts</q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>
        </q-drawer>
        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script>

import { defineComponent, ref } from 'vue'
export default defineComponent({
    name: 'MainLayout',
    setup () {
        return {
            tab: ref(''),
            drawer: ref(false),
            miniState: ref(true),
        }
    }
})
</script>
