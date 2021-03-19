<!--
Copyright 2020 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <v-app>
    <v-layout row justify-center>
      <v-dialog v-model="dialog" max-width="1200">
        <v-card :dark="true">

          <div>
            <md-table
              v-model="users"
              md-sort="name"
              md-sort-order="asc"
              md-card
              md-fixed-header
              @md-selected="onSelect"
            >
            
              <md-table-toolbar max-width="1200">
                <h1 class="md-title">Monitoring</h1>

                <!-- <md-button class="buttonExport" @click="exportJSON">Export JSON</md-button> -->
                
                <!-- <md-button class="md-dense md-raised md-primary" @click="importBOGFile">Import BOG file</md-button> -->
                <!-- <md-button class="buttonImportBOG" @click="importBOGFile">Import BOG file</md-button>  -->

                <!-- <md-button class="md-icon-button md-raised md-accent" @click="clearItemList"> -->
                  <!-- <md-icon>delete_forever</md-icon> -->
                <!-- </md-button> -->
              </md-table-toolbar>


              <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
                <md-table-cell md-label="Generic Name" md-sort-by="Generic Name">
                  {{item.generic_name}}
                </md-table-cell>

                <md-table-cell md-label="Name" md-sort-by="Name">
                  {{item.name}}
                </md-table-cell>

                <md-table-cell md-label="Item Name">
                  {{item.item_name}}
                </md-table-cell>

                <md-table-cell md-label="Monitoring">
                  <md-checkbox class="md-primary" @change="onChangeMonitoring">{{item.monitoring}}</md-checkbox>
                </md-table-cell>

                <md-table-cell md-label="Tags">
                  {{item.tags}}
                </md-table-cell>

                <!-- <md-table-cell md-label="BIM Naming Convention" md-edit=true md-sort-by="BIM Naming Convention">
                  {{item.namingConvention}}
                </md-table-cell> -->

              </md-table-row>
            </md-table>
          </div>
          <v-card-actions>
            <v-btn color="red darken-1">Annuler </v-btn>
            <v-spacer></v-spacer>
            
            <!-- <md-button class="md-icon-button md-dense md-raised md-primary" flat @click="onAdd"> -->
              <v-btn color="red darken-1">Save </v-btn>

          </v-card-actions>

          
        </v-card>
      </v-dialog>
    </v-layout>
  </v-app>
</template>

<script>
import { SpinalNode } from "spinal-model-graph";
import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
import { PART_RELATION_NAME, PART_RELATION_TYPE, DEVICE_RELATION_NAME, DEVICE_RELATION_TYPE, DEVICE_TYPE, DEVICE_PROFILES_TYPE } from "../constants";

import { DeviceHelper } from "../build/DeviceHelper";
import { FileExplorer } from '../FileExplorer';
import { resolve } from 'dns';

const {
  spinalPanelManagerService
} = require("spinal-env-viewer-panel-manager-service");

const xml2js = require('xml2js');
const fs = require('fs');

export default {
  name: "DialogMonitoring",

  data: () => ({
    users: [],
    parentId: null,
    parentNode: null,
    selected: {},
    dialog: null,
    other: null,
    single: null,
  }),
  computed: {
  },
  methods: {
    initialize: async function (option) {
      this.parentId = await option.selectedNode.id;
      this.parentNode = await option.selectedNode;
      // this.users = [{name: 0, maitre:false, itemType: "test", monitoring:true, namingConvention:0, nodeId:"1"}];
      this.users = await DeviceHelper.getLinkedOutputBacnetValues_FromMonitoringNodeId(option.selectedNode.id.get());

      // this.users = await DeviceHelper.listItemInTab(this.parentNode);
    },
    opened: function (option) {
      this.initialize(option);
      this.dialog = true;
    },
    removed: function () {},
    closeDialog() {
      this.dialog = false;
    },
    onCancel: function () {
      this.dialog = false;
    },
    onChangeMonitoring: async function(){
      console.log("change monitoring");
    },
    onSelect: function () {}
  },
};
</script>

<style scoped>
.md-table-row{
  justify-content: center;
  align-items: center;
}


</style>

