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
   <md-dialog
      class="mdDialogContainer"
      :md-active.sync="DialogGetFromDiscovery"
      @md-closed="closeDialog(false)"
   >
      <md-dialog-title class="dialogTitle">Get bacnetValues from discovery</md-dialog-title>

      <md-dialog-content class="content">
          <link-component
            v-if="pageSelected === PAGES.selection"
            :context_title="'Contexts'"
            :category_title="'Subnetworks'"
            :group_title="'Bms devices'"
            :data="data"
            :profils="networks"
            :devices="devices"
            :contextSelected="contextSelected"
            :profilSelected="networkSelected"
            :deviceSelected="deviceSelected"
            :isAutomate="isAutomate"
            @selectContext="selectContext"
            @selectProfil="selectNetwork"
            @selectDevice="selectDevice"
         ></link-component> 

         <!-- <configuration-template
            v-else-if="pageSelected === PAGES.configuration"
            :properties="configuration"
            :bimData="configuration.bimData"
            :bmsData="configuration.bmsData"
         ></configuration-template> -->

         <!-- <confirm-link
            v-else-if="pageSelected === PAGES.result"
            :data="result"
         ></confirm-link> -->

         <div
            class="state"
            v-else-if="pageSelected === PAGES.loading"
         >
            <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
         </div>

         <div
            class="state"
            v-else-if="pageSelected === PAGES.error"
         >
            <md-icon class="md-size-5x">error_outline</md-icon>
         </div>

         <div
            class="state"
            v-else-if="pageSelected === PAGES.success"
         >
            <md-icon class="md-size-5x">done</md-icon>
         </div>

         

      </md-dialog-content>

      <md-dialog-actions>
         <md-button
            class="md-primary"
            @click="closeDialog(false)"
         >Close</md-button>



         <md-button
            class="md-primary"
            @click="closeDialog(true)"
         >Discover</md-button>
      </md-dialog-actions>

   </md-dialog>

</template>

<script>
import { bimObjectManagerService } from "spinal-env-viewer-bim-manager-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
// import linkAutomateToBmsDeviceUtilities from "../../../js/link_utilities/linkAutomateToBmsDevice";
import {
   AttributesUtilities,
   LinkBmsDeviceService,
} from "spinal-env-viewer-plugin-network-tree-service";
import networkService from "spinal-env-viewer-plugin-network-tree/src/js/network/networkService";
import LinkComponent from "./links/LinkComponent.vue";
//import ConfirmLinkToGTB from "./confirmLinkToGTB.vue";
import ConfigurationTemplate from "../../spinal-env-viewer-plugin-network-tree/src/vue/components/links/configuration.vue";
import bmsDataFunction from "../../spinal-env-viewer-plugin-network-tree/src/js/personalized_functions/replace_by.js";
import bimDataFunction from "../../spinal-env-viewer-plugin-network-tree/src/js/personalized_functions/replace-by.js";
// import { SpinalForgeViewer } from "spinal-env-viewer-plugin-forge";
import { DeviceHelper } from "../build/DeviceHelper";

const lodash = require("lodash");



  export default {
    name: "Test",

    components:{
       "link-component" : LinkComponent
    },
    
    props: ["onFinised"],
    
    data () {

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
      

      return {
        DialogGetFromDiscovery: true,
        data: [],
        networks: [],
        devices: [],
        contextSelected: undefined,
        networkSelected: undefined,
        deviceSelected: undefined,
        pageSelected: this.PAGES.selection,
      }
    },
    methods: {
      
      onSave: function () {

      },
    
      onCancel: function () {
        this.DialogGetFromDiscovery = false;
      },
      
      removed: function (save) {
         if(save){
            //DeviceHelper.generateBacNetValuesFromDiscovery(this.deviceSelected, this.nodeId, this.contextId );
            new Promise(async resolve => {

               //await DeviceHelper.generateBacNetValues(nodeId, result);
               await DeviceHelper.generateBacNetValuesFromDiscovery(this.nodeId, this.contextId, this.deviceSelected, this.networkSelected, this.contextSelected);
               await DeviceHelper.generateItem_list(this.nodeId);
               await DeviceHelper.generateSupervisionGraph(this.nodeId);

               }).catch(err => console.log(err));  
         }
         //console.log("save : ", save);
         this.DialogGetFromDiscovery = false;

      },
      
      closeDialog( closeResult ) {
         if (typeof this.onFinised === "function") {
            this.onFinised(closeResult);
         }

      },

      opened(option) {
         //this.DialogGetFromDiscovery = true;
         this.pageSelected = this.PAGES.loading,
         this.contextId = option.contextId;
         this.nodeId = option.nodeId;
         this.isAutomate = option.isAutomate;
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