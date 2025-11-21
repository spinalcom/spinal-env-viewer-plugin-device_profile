<template>
    <div class="section">
        <div class="title" title="Endpoint to create in profile">
            {{ title }}
        </div>
        <div class="listContent">
            <md-list class="md-double-line">
                <!-- <md-subheader>Endpoint to create in profile</md-subheader> -->
                <md-list-item v-for="(endpoint, index) in endpoints" :key="index">
                    <md-checkbox v-model="endpoint.checked" />
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

.section .title {
    width: 100%;
    height: 40px;
    font-weight: bold;
    border-bottom: 1px solid #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 10px;
}

.section .listContent {
    width: 100%;
    height: calc(100% - 40px);
    overflow: hidden;
    overflow-y: auto;
}
</style>