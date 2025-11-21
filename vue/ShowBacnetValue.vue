<template>
   <md-dialog class="mdDialogContainer" :md-active.sync="DialogGetFromDiscovery" @md-closed="closeDialog(false)">
      <md-dialog-title class="dialogTitle">Get bacnetValues from discovery</md-dialog-title>

      <md-dialog-content class="content">
         <link-component v-if="pageSelected === PAGES.selection" :context_title="'Contexts'"
            :category_title="'Subnetworks'" :group_title="'Bms devices'" :data="data" :profils="networks"
            :devices="devices" :contextSelected="contextSelected" :profilSelected="networkSelected"
            :deviceSelected="deviceSelected" :isAutomate="isAutomate" @selectContext="selectContext"
            @selectProfil="selectNetwork" @selectDevice="selectDevice"></link-component>

         <div class="state" v-else-if="pageSelected === PAGES.loading">
            <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
         </div>

         <div class="state" v-else-if="pageSelected === PAGES.error">
            <md-icon class="md-size-5x">error_outline</md-icon>
         </div>

         <div class="state" v-else-if="pageSelected === PAGES.success">
            <md-icon class="md-size-5x">done</md-icon>
         </div>



      </md-dialog-content>

      <md-dialog-actions>
         <md-button class="md-primary" @click="closeDialog(false)">Close</md-button>



         <md-button class="md-primary" @click="closeDialog(true)">{{ isupdatePage ? 'Update' : 'Discover' }}</md-button>
      </md-dialog-actions>

   </md-dialog>

</template>

<script>

import networkService from "spinal-env-viewer-plugin-network-tree/src/js/network/networkService";
import LinkComponent from "./links/LinkComponent.vue";
import { DeviceHelper } from "../build/DeviceHelper";

const lodash = require("lodash");



export default {
   name: "Test",

   components: {
      "link-component": LinkComponent
   },

   props: ["onFinised"],

   data() {

      this.PAGES = {
         selection: 0,
         configuration: 1,
         result: 2,
         creation: 3,
         loading: 4,
         success: 5,
         error: 6,
      };

      this.contextId;
      this.nodeId;

      this.callback = this.generateProfilesFromDiscovery.bind(this);

      return {
         DialogGetFromDiscovery: true,
         data: [],
         networks: [],
         devices: [],
         contextSelected: undefined,
         networkSelected: undefined,
         deviceSelected: undefined,
         pageSelected: this.PAGES.selection,
         isupdatePage: false,
      }
   },
   methods: {

      onSave: function () {

      },

      onCancel: function () {
         this.DialogGetFromDiscovery = false;
      },

      generateProfilesFromDiscovery: async function (nodeId, contextId, deviceSelected, networkSelected, contextSelected) {
         try {
            //await DeviceHelper.generateBacNetValues(nodeId, result);
            await DeviceHelper.generateBacNetValuesFromDiscovery(nodeId, contextId, deviceSelected, networkSelected, contextSelected);
            await DeviceHelper.generateItem_list(nodeId);
            await DeviceHelper.generateSupervisionGraph(nodeId);
         } catch (error) {
            console.error("Error generating profiles from discovery:", error);
         }


      },

      removed: async function (save) {
         if (save) {
            //DeviceHelper.generateBacNetValuesFromDiscovery(this.deviceSelected, this.nodeId, this.contextId );
            // this.generateProfilesFromDiscovery();
            if (this.callback) await this.callback(this.nodeId, this.contextId, this.deviceSelected, this.networkSelected, this.contextSelected);
         }
         //console.log("save : ", save);
         this.DialogGetFromDiscovery = false;

      },

      closeDialog(closeResult) {
         if (typeof this.onFinised === "function") {
            this.onFinised(closeResult);
         }

      },

      opened(option) {
         //this.DialogGetFromDiscovery = true;
         this.pageSelected = this.PAGES.loading;
         this.contextId = option.contextId;
         this.nodeId = option.nodeId;
         this.isAutomate = option.isAutomate;

         if (option.callback) {
            this.callback = option.callback;
            this.isupdatePage = true;
         }

         this.getAllData();

      },



      getAllData() {
         return networkService
            .getDeviceContextTreeStructure()
            .then((result) => {
               this.data = result;
               this.updateNetworks();
               this.pageSelected = this.PAGES.selection;
            });
      },

      _getBmsDevices() {
         if (typeof this.deviceSelected !== "undefined") {
            return this.devices.filter((el) => el.id === this.deviceSelected);
         } else if (typeof this.networkSelected !== "undefined") {
            const found = this.networks.find(
               (el) => el.id === this.networkSelected
            );
            return found && found.devices ? found.devices : [];
         } else if (typeof this.contextSelected !== "undefined") {
            const devices = [];
            const found = this.data.find(
               (el) => el.id === this.contextSelected
            );
            if (found && found.networks) {
               for (const network of found.networks) {
                  if (network.devices) {
                     devices.push(...network.devices);
                  }
               }
            }
            return devices;
         }
      },



      /* Selection */
      selectContext(id) {
         this.contextSelected = id;
      },
      selectNetwork(id) {
         this.networkSelected = id;
      },
      selectDevice(id) {
         this.deviceSelected = id;
      },
      /* Update */
      updateNetworks() {
         this.networks = [];
         if (this.contextSelected) {
            let val = this.data.find((el) => el.id === this.contextSelected);
            if (val) this.networks = val.networks;
         }
      },
      updateDevices() {
         this.devices = [];
         if (this.networkSelected) {
            let val = this.networks.find(
               (el) => el.id === this.networkSelected
            );
            if (val) this.devices = val.devices;
         }
      },

   },

   watch: {
      async contextSelected() {
         await this.updateNetworks();
         this.networkSelected = undefined;
      },
      async networkSelected() {
         this.updateDevices();
         this.deviceSelected = undefined;
      },
   }
}
</script>

<style scoped>
.mdDialogContainer {
   width: 60%;
   height: 600px;
}

.mdDialogContainer .dialogTitle {
   text-align: center;
}

.mdDialogContainer .content {
   padding: 0 10px 24px 24px;
}

.mdDialogContainer .content .state {
   width: 100%;
   height: 100%;
   display: flex;
   justify-content: center;
   align-items: center;
}

.mdDialogContainer .content .progress-bar {
   width: 100%;
   height: 100%;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
}

.mdDialogContainer .content .progress-bar .percent-number {
   font-size: 1.8em;
   margin: 10px 0;
}

.mdDialogContainer .content .progress-bar .percent-bar {
   width: 90%;
}
</style>

<style>
.mdDialogContainer .md-dialog-container {
   max-width: 100%;
   max-height: 100%;
}
</style>