<template>
    <div class="section">
        <div class="header" title="Endpoint to create in profile">
            <div class="title">
                {{ title }}
            </div>

            <div class="actions">

                <md-button class="md-icon-button md-primary" @click="selectAll" title="select all">
                    <md-icon>toggle_on</md-icon>
                </md-button>

                <md-button class="md-icon-button" @click="deselectAll" title="deselect all">
                    <md-icon>toggle_off</md-icon>
                </md-button>
            </div>
        </div>

        <div class="listContent">
            <md-list class="md-double-line">
                <!-- <md-subheader>Endpoint to create in profile</md-subheader> -->
                <md-list-item v-for="(endpoint, index) in endpoints" :key="index">
                    <md-checkbox class="md-primary" v-model="endpoint.checked" />
                    <!-- <md-checkbox v-model="endpoint.checked" :value="endpoint.id" /> -->
                    <div class="md-list-item-text">
                        <span>{{ endpoint.name }}</span>
                        <span>
                            type : {{ getEndpointType(endpoint.typeId) }} - id : {{ endpoint.idNetwork }}
                        </span>
                    </div>
                </md-list-item>
            </md-list>
        </div>
    </div>
</template>


<script>

import { endpointTypes } from '../constants';


export default {
    name: "selectItemsComponent",
    props: {
        title: {
            type: String,
            required: true
        },
        endpoints: {
            type: Array,
            required: true
        }
    },
    methods: {
        getEndpointType: function (typeId) {
            const type = endpointTypes[typeId];
            return type || "Unknown";
        },

        selectAll: function () {
            this.$emit('selectAll');
        },

        deselectAll: function () {
            this.$emit('deselectAll');
        }
    }
}
</script>


<style scoped>
.section {
    width: 50%;
    height: 100%;
    border: 1px solid #ccc;
    border-radius: 10px;

}

.section .header {
    width: 100%;
    height: 40px;
    border-bottom: 1px solid #ccc;
    display: flex;
}

.section .header .title {
    width: calc(100% - 80px);
    display: inline-block;
    vertical-align: middle;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 10px;
}

.section .header .actions {
    width: 80px;
    display: flex;
    justify-content: end;
    align-items: center;
}


.section .listContent {
    width: 100%;
    height: calc(100% - 40px);
    overflow: hidden;
    overflow-y: auto;
}
</style>