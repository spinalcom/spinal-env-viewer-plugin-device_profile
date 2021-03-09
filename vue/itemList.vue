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
                <h1 class="md-title">Item List</h1>

                <md-button class="buttonExport" @click="exportJSON">Export JSON</md-button>
                
                <!-- <md-button class="md-dense md-raised md-primary" @click="importBOGFile">Import BOG file</md-button> -->
                <md-button class="buttonImportBOG" @click="importBOGFile">Import BOG file</md-button> 

                <md-button class="md-icon-button md-raised md-accent" @click="clearItemList">
                  <md-icon>delete_forever</md-icon>
                </md-button>
              </md-table-toolbar>


              <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
                <md-table-cell md-label="Item name" md-sort-by="Item name">{{
                  item.name
                }}</md-table-cell>
                <md-table-cell md-label="Maitre" md-sort-by="Maitre">{{
                  item.maitre
                }}</md-table-cell>
                <md-table-cell md-label="Item Type" md-sort-by="Item Type">{{
                  item.itemType
                }}</md-table-cell>

                <md-table-cell md-label="Monitoring">
                  <md-checkbox class="md-primary" @change="onChangeMonitoring">{{item.monitoring}}</md-checkbox>
                </md-table-cell>

                <md-table-cell md-label="BIM Naming Convention" md-edit=true md-sort-by="BIM Naming Convention">{{
                  item.namingConvention
                }}</md-table-cell>


                <md-table-cell md-label="Details">
                  <md-button class="md-icon-button" @click ="onDetails(item)" > 
                    <md-icon>arrow_right_alt</md-icon>
                  </md-button>
                </md-table-cell>

              </md-table-row>
            </md-table>
          </div>
          <v-card-actions>
            <v-btn color="red darken-1" flat @click="onCancel">Annuler </v-btn>
            <v-spacer></v-spacer>
            
      <md-button class="md-icon-button md-dense md-raised md-primary" flat @click="onAdd">
        <md-icon>add</md-icon>
      </md-button>

          </v-card-actions>

          <md-dialog class="test" :md-active.sync="dialog2">
            <md-dialog-title>Add Item</md-dialog-title>
            <md-content> Fill in this form to add an Item</md-content>


            <md-field :class="requiredClass1">
              <label>Item Name...</label>
              <md-input v-model="item_added.name" required></md-input>
              <span class="md-helper-text">Ex: L_1</span>
              <span class="md-error"> Required </span>
            </md-field>

            <md-field :class="requiredClass2">
              <label>Item Type...</label>
              <md-input v-model="item_added.type" required></md-input>
              <span class="md-helper-text">Ex: Lamp</span>
              <span class="md-error"> Required </span>
            </md-field>

            <md-checkbox v-model="item_added.maitre">Maitre</md-checkbox>

            <md-field>
              <label>BIM Naming Convention...</label>
              <md-input v-model="item_added.namingConvention"></md-input>
              <span class="md-helper-text">Ex: L_1</span>
            </md-field>

            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" flat @click="onCancelDialog">Annuler </v-btn>

            <v-btn color="green darken-1" flat @click="onSaveDialog">Valider </v-btn>
          </v-card-actions>

          </md-dialog>

          <md-dialog-alert
      :md-active.sync="dialog3"
      md-title="Error : invalid item !"
      md-content="This item already exists in this profile." />

      <md-dialog class="dialogImportBogFile" :md-active.sync="dialogImportBogFile">
        <md-dialog-title>Import BOG File</md-dialog-title>
        <md-content> Import xml file from BOG</md-content>
        <md-field>
          <label>xml file</label>
          <md-file v-model="single" @change="getFile"/>
          <!-- <input type="file" name="xmlFile" id="single" @change="getFile"> -->
        </md-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click="onCancelDialogImport">Annuler </v-btn>
          <v-btn color="green darken-1" flat @click="onSaveDialogImport">Valider </v-btn>
        </v-card-actions>

       


      </md-dialog>

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
  name: "DialogItemList",

  data: () => ({
    users: [],
    parentId: null,
    parentNode: null,
    selected: {},
    dialog: null,
    dialog2: false,
    other: null,
    dialog3: false,
    dialogImportBogFile: false,
    value: [],
    invalidFieldName: true,
    invalidFieldType: true,
    item_added: {
      name: null,
      maitre: false,
      type: null,
      monitoring: false,
      namingConvention: ""
    },
    single: null,
    tempBlob: null,
    parsedBOGTab: null,
  }),
  computed: {
    requiredClass1 (){
      return {
        'md-invalid': !(this.invalidFieldName)
      }
    },
    requiredClass2 (){
      return {
        'md-invalid': !(this.invalidFieldType)
      }
    }
  },
  methods: {
    initialize: async function (option) {
      this.parentId = await option.selectedNode.id;
      this.parentNode = await option.selectedNode;
      this.users = await DeviceHelper.listItemInTab(this.parentNode);
    },
    onMouse: function(item){
      if(item != null){
        this.selected = item;
      }
    },
    onSelect: function(item){
      if(item != null){
        this.selected = item;
      }
    },
    onAdd: async function () {
      this.dialog = false;
      this.dialog2 = true;
      this.item_added.name = null;
      this.item_added.type = null;
      this.item_added.maitre = false;
      this.item_added.namingConvention = "";
    },
    onDetails:  async function(item) {
      this.onSelect(item);


      
      // console.log("clicked", item);

      var paramSent = new Object();
      const graphOfSelectedNode = await SpinalGraphService.getGraph(this.selected.nodeId);
      var tempNode = await SpinalGraphService.getRealNode(this.selected.nodeId);

      tempNode.id = tempNode.info.id;
      paramSent.graph = graphOfSelectedNode;
      paramSent.selectedNode = tempNode;

      console.log(paramSent);

      spinalPanelManagerService.openPanel("DialogItemDetail", paramSent);
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
    onCheckField: async function(){

      if(this.item_added.name == null || this.item_added.name == "" || this.item_added.name == undefined){
        this.invalidFieldName = false;
      }
      else{
        this.invalidFieldName = true;
      }

      if(this.item_added.type == null || this.item_added.type == "" || this.item_added.type == undefined){
        this.invalidFieldType = false;
      }
      else{
        this.invalidFieldType = true;
      }
      
      return ((this.invalidFieldName) && (this.invalidFieldType));
      
    },
    onCheckUsers: async function(){
      for (var elt in this.users){
        if(this.item_added.name == this.users[elt].name && this.item_added.type == this.users[elt].itemType && this.item_added.maitre == this.users[elt].maitre){
          return true;
        }
      }
      return false;
    },
    clearItemList: async function(){
      await DeviceHelper.clearItems(this.parentId);
      await DeviceHelper.clearLinks(this.parentId, "hasTempTab", SPINAL_RELATION_PTR_LST_TYPE);
      this.users = [];
    },
    importBOGFile: async function(){
      console.log("import BOG file function");
      await DeviceHelper.clearLinks(this.parentId, "hasTempTab", SPINAL_RELATION_PTR_LST_TYPE);
      this.single = null;
      this.dialog = false;
      this.dialogImportBogFile = true;

    },
    onCancelDialog: function () {
      this.dialog2 = false;
      this.dialog = true;
    },
    onSaveDialog: async function () {

      if(await this.onCheckField()){
        if(await this.onCheckUsers()){
          this.dialog3 = true;
        }
        else{
          this.users.push(await DeviceHelper.generateItem(this.parentId, this.item_added.name, this.item_added.maitre, this.item_added.type, this.item_added.namingConvention, "hasItem"));
          this.dialog2 = false;
          this.dialog = true;
        }
        
      }
      else{
        console.log("fill the required fields please");
      }
    },
    onSaveDialogImport: async function(){
      var realParentNode = SpinalGraphService.getRealNode(this.parentId);
      let bogTab;
      if(realParentNode.hasRelation("hasTempTab", SPINAL_RELATION_PTR_LST_TYPE)){
        const childOfTab = await realParentNode.getChildren("hasTempTab");
        bogTab = childOfTab[0].info.tab;
        await DeviceHelper.clearItems(this.parentId);
        this.users = await DeviceHelper.generateItemFromBOG(this.parentId, bogTab);
        await DeviceHelper.clearLinks(this.parentId, "hasTempTab", SPINAL_RELATION_PTR_LST_TYPE);
        this.dialogImportBogFile = false;
        this.dialog = true;
      }
      else{
        this.dialogImportBogFile = false;
        this.dialog = true;
      }
      
    },
    onCancelDialogImport: async function(){
      await DeviceHelper.clearLinks(this.parentId, "hasTempTab", SPINAL_RELATION_PTR_LST_TYPE);
      this.dialogImportBogFile = false;
      this.dialog = true;
    },
     getFile: async function(event){
      return new Promise((resolve, reject) => {
        this.single = event.target.files;
        const reader = new FileReader();
        
        var testId = this.parentId;

        reader.onload = async function(e) {
          this.parsedBOGTab = await FileExplorer.parseBOGFile(e.target.result);

               DeviceHelper.initialize()
      .then(async result => {
      const generatedNodeId = SpinalGraphService.createNode({
          tab: this.parsedBOGTab,
          name: 'tempTab',
          type: "tempTab",
        }, undefined);
        var generatedNode = await SpinalGraphService.addChildInContext(testId, generatedNodeId, DeviceHelper.contextId,
          "hasTempTab", SPINAL_RELATION_PTR_LST_TYPE);
      })
        }
        reader.readAsText(event.target.files[0]);
      })
    },
    exportJSON: async function(){
      await DeviceHelper.clearLinks(this.parentId, "hasTempTab", SPINAL_RELATION_PTR_LST_TYPE);
      await DeviceHelper.exportJSONItemList(this.parentId);
    },
    onChangeMonitoring: async function(){
      console.log("change monitoring");
    }
  },
};
</script>

<style scoped>
.test{
  padding-left: 10px;
  padding-right: 10px;
}
.md-dialog-title{
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.md-table-row{
  justify-content: center;
  align-items: center;
}
.buttonExport{
  background-color: green;
}
.buttonImportBOG{
  background-color: dodgerblue;
}

</style>

