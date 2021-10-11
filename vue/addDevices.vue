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
      <v-dialog v-model="dialog" max-width="290">
        <v-card :dark="true">
          <v-card-title class="headline">Add Device </v-card-title>
          <v-card-text>
            <v-text-field placeholder="Device Name" @change="onNameChange" />

            <md-field>
              <label>Import Main.xml in GFX folder</label>
              <md-file multiple @change="getFile" />
            </md-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" flat @click="onCancel">Annuler </v-btn>

            <v-btn color="green darken-1" flat @click="onSave">Valider </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-app>
</template>

<script>
import { SpinalNode } from "spinal-model-graph";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { SPINAL_RELATION_LST_PTR_TYPE } from "spinal-env-viewer-graph-service";

import { DeviceHelper } from "../build/DeviceHelper";
import { FileExplorer } from "../FileExplorer";

const xml2js = require("xml2js");
const fs = require("fs");

export default {
  name: "DialogAddDevices",

  data: function () {
    return {
      name: "",
      deviceProfile: null,
      parentId: null,
      dialog: false,
      multiple: null,
    };
  },
  methods: {
    initialize: function (option) {
      // this.deviceProfile = option.deviceProfile;
      this.parentId = option.selectedNode.id;
    },
    onNameChange: function (value) {
      this.name = value;
    },
    onSave: function () {
      this.addDevices(this.name).then((result) => {
        // var dossier = FileExplorer.createDirectory(result);
        //  FileExplorer.addFileUpload(dossier, this.multiple);
      });
      this.dialog = false;
    },
    addDevices: function (name) {

  
      return new Promise(async (resolve) => {
        
        var nodeCreated = await DeviceHelper.createDevice(this.parentId, name);
        if (this.multiple !== null){
          var dossier = await FileExplorer.createDirectory(nodeCreated);
          await FileExplorer.addFileUpload(dossier, this.multiple);
          }
    });
      
    
      
    },
    onCancel: function () {
      this.dialog = false;
    },
    opened: function (option) {
      this.initialize(option);
      this.dialog = true;
    },
    removed: function () {},
    closeDialog() {this.dialog = false},
    getFile(event) {
      this.multiple = event.target.files;
    },
  },
};
</script>

<style scoped>
</style>
