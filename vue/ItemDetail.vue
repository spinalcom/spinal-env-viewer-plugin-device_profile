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
          <v-card-title class="headline">{{ selected }} Item Details</v-card-title>

          

          
            <div class="infos">

              <md-field class="infos-details">
                <label>BIM Naming Convention</label>
                <md-input v-model="namingConvention"></md-input>
              </md-field>
              <v-spacer></v-spacer>
              <div class="infos-details2">
                <md-content> Master  </md-content>
                <md-checkbox class="checkbox" v-model="maitre"></md-checkbox>
              </div>
            </div>
            
            
            <md-tabs>
              <md-tab id="tab-input" md-label="Input">
                <div class="tableaux">
                  <div class="bloc-table">
                    <md-toolbar :md-elevation="1">
                      <span class="md-title">
                        Linked BacnetValues (Input)
                      </span>
                      <v-spacer></v-spacer>
                        <md-button class="md-icon-button md-raised md-accent" flat @click="onClickInputUnlink">
                          <md-icon>link_off</md-icon>
                        </md-button>

                    </md-toolbar>

                    <md-table
                      v-model="selectedInputs"
                      md-sort="title"
                      md-sort-order="asc"
                      md-card
                      md-fixed-header
                      @md-selected="onSelectinPutSelection"
                    >
                      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="multiple"
                        md-auto-select>
                        <md-table-cell
                          md-label="Network Values"
                          md-sort-by="title"
                          >{{ item.title }}
                        </md-table-cell>
                        <md-table-cell md-label="Name" md-sort-by="name"
                          >{{ item.name }}
                        </md-table-cell>
                        <md-table-cell md-label="IDX" md-sort-by="idx"
                          >{{ item.idx }}
                        </md-table-cell>
                      </md-table-row>
                    </md-table>
                  </div>

                  <div class="bloc-table">
                    <md-toolbar :md-elevation="1">
                      <span class="md-title">Available BacnetValues</span>
                      <v-spacer></v-spacer>
                      <md-field md-clearable @md-clear="onClear" class="md-toolbar-section-end">
                                              <v-spacer></v-spacer>

                        <md-input
                          class="search"
                          placeholder="Search..."
                          v-model="inputSearch"
                          @input="inputSearchOnTable"
                        />
                      </md-field>
                    </md-toolbar>

                    <md-table
                      v-model="inputTab"
                      md-sort="title"
                      md-sort-order="asc"
                      md-card
                      md-fixed-header
                      @md-selected="onSelectInput"
                    >
                      <md-table-row
                        slot="md-table-row"
                        slot-scope="{ item }"
                        md-selectable="single"
                        md-auto-select
                      >
                        <md-table-cell
                          md-label="Network Values"
                          md-sort-by="title"
                          >{{ item.title }}
                        </md-table-cell>
                        <md-table-cell md-label="Name" md-sort-by="name"
                          >{{ item.name }}
                        </md-table-cell>
                        <md-table-cell md-label="IDX" md-sort-by="idx"
                          >{{ item.idx }}
                        </md-table-cell>
                      </md-table-row>
                    </md-table>
                  </div>
                </div>
              </md-tab>

              <md-tab id="tab-output" md-label="Output">
                <div class="tableaux">
                  <div class="bloc-table">
                    <md-toolbar>
                      <span class="md-title">
                        Linked BacnetValues (Output)
                      </span>
                      <v-spacer></v-spacer>
                      <md-button class="md-icon-button md-raised md-accent" flat @click="onClickOutputUnlink">
                        <md-icon>link_off</md-icon>
                      </md-button>
                    </md-toolbar>

                    <md-table
                      v-model="selectedOutputs"
                      md-sort="title"
                      md-sort-order="asc"
                      md-card
                      md-fixed-header
                      @md-selected="onSelectOutputSelection"
                    >
                      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="multiple" md-auto-select>
                        <md-table-cell
                          md-label="Network Values"
                          md-sort-by="title"
                          >{{ item.title }}
                        </md-table-cell>
                        <md-table-cell md-label="Name" md-sort-by="name"
                          >{{ item.name }}
                        </md-table-cell>
                        <md-table-cell md-label="IDX" md-sort-by="idx"
                          >{{ item.idx }}
                        </md-table-cell>
                      </md-table-row>
                    </md-table>
                  </div>

                  <div class="bloc-table">
                    <md-toolbar>
                      <span class="md-title">Available BacnetValues</span>
                                              <v-spacer></v-spacer>

                      <md-field md-clearable class="md-toolbar-section-end">
                        <md-input
                          class="search"
                          placeholder="Search..."
                          v-model="outputSearch"
                          @input="outputSearchOnTable"
                        />
                      </md-field>
                    </md-toolbar>

                    <md-table
                      v-model="outputTab"
                      md-sort="title"
                      md-sort-order="asc"
                      md-card
                      md-fixed-header
                      @md-selected="onSelectOutput"
                    >
                      <md-table-row
                        slot="md-table-row"
                        slot-scope="{ item }"
                        md-selectable="single"
                        md-auto-select
                      >
                        <md-table-cell
                          md-label="Network Values"
                          md-sort-by="title"
                          >{{ item.title }}
                        </md-table-cell>
                        <md-table-cell md-label="Name" md-sort-by="name"
                          >{{ item.name }}
                        </md-table-cell>
                        <md-table-cell md-label="IDX" md-sort-by="idx"
                          >{{ item.idx }}
                        </md-table-cell>
                      </md-table-row>
                    </md-table>
                  </div>
                </div>
              </md-tab>
            </md-tabs>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" flat @click="onCancel"
                >Annuler
              </v-btn>

              <v-btn color="green darken-1" flat @click="onSave"
                >Valider
              </v-btn>
            </v-card-actions>
          
        </v-card>
      </v-dialog>
    </v-layout>
  </v-app>
</template>

<script>
import {
  SpinalContext,
  SpinalGraphService,
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
} from "spinal-env-viewer-graph-service";

import { DeviceHelper } from "../build/DeviceHelper";

export default {
  name: "DialogItemDetail",

  data: () => ({
    users: [],
    namingConvention: null,
    maitre: false,
    selected: null,
    parentId: null,
    parentNode: null,
    dialog: null,
    dialog2: false,
    value: [],
    ioTab: [],
    inputTab: [],
    selectedInputs: [{}],
    selectedSelectedInputs: [],
    selectedSelectedOutputs: [],
    outputTab: [],
    selectedOutputs: [{}],
    inputSearch: "",
    outputSearch: "",
    searched: [],
    saveInputTab: [],
    saveOutputTab: [],
    inputsId: null,
    outputsId: null,
    backupInput: [],
    backupOutput: [],
  }),
  methods: {
    initialize: async function (option) {
      this.initializeData();
      this.parentId = await option.selectedNode.id;
      this.selected = (await SpinalGraphService.getNodeAsync(this.parentId)).name._data;

      // this.parentNode = await SpinalGraphService.getRealNode(option.selectedNode.id);
      if((await SpinalGraphService.getChildren(this.parentId, "hasInputs")) != undefined ){
        this.inputsId = (await SpinalGraphService.getChildren(this.parentId, "hasInputs"))[0].id._data;
      }

      if((await SpinalGraphService.getChildren(this.parentId, "hasOutputs")) != undefined){
        this.outputsId = (await SpinalGraphService.getChildren(this.parentId, "hasOutputs"))[0].id._data;
      }
      
      this.ioTab = await DeviceHelper.itemDetailInputOutput(
        option.selectedNode
      );
      await this.arrangeTabs();

      this.namingConvention = (await DeviceHelper.itemDetailInfos(option.selectedNode)).namingConvention;
      this.maitre = (await DeviceHelper.itemDetailInfos(option.selectedNode)).maitre;

      // console.log("input, output, selected Inputs, selected Outputs");
      // console.log(this.inputTab);
      // console.log(this.outputTab);
      // console.log(this.selectedInputs);
      // console.log(this.selectedOutputs);
      // console.log("end logs");
    },
    arrangeTabs: async function () {
      for (var elt in this.ioTab.NetworkValue) {
        // this.inputTab.push(this.ioTab.NetworkValue[elt]);
        this.chooseBetweenTables(this.ioTab.NetworkValue[elt], this.inputsId, this.inputTab, this.selectedInputs, this.backupInput);
      }
      for (var elt in this.ioTab.BinaryValue) {
        this.chooseBetweenTables(this.ioTab.BinaryValue[elt], this.outputsId, this.outputTab, this.selectedOutputs, this.backupOutput);
        // this.outputTab.push(this.ioTab.BinaryValue[elt]);
      }
      for (var elt in this.ioTab.AnalogValue) {
        this.chooseBetweenTables(this.ioTab.AnalogValue[elt], this.outputsId, this.outputTab, this.selectedOutputs, this.backupOutput);

        // this.outputTab.push(this.ioTab.AnalogValue[elt]);
      }
      for (var elt in this.ioTab.MultiStateValue) {
        this.chooseBetweenTables(this.ioTab.MultiStateValue[elt], this.outputsId, this.outputTab, this.selectedOutputs, this.backupOutput);
        // this.outputTab.push(this.ioTab.MultiStateValue[elt]);
      }

      this.saveInputTab = this.inputTab;
      this.saveOutputTab = this.outputTab;

      // this.backupInput = this.inputTab;
      // this.backupOutput = this.outputTab;
    },
    chooseBetweenTables: function(elementToAdd, nodeId, entryTab, selectedTab, backup = 0){

      var selectedIds = [];
      selectedIds = SpinalGraphService.getChildrenIds(nodeId);
      
      backup.push(elementToAdd);

      if ((selectedIds.filter(elt => (elt == elementToAdd.nodeId))).length == 0 ){
        entryTab.push(elementToAdd);
      }
      else{
        selectedTab.push(elementToAdd);
      }

    }
    ,
    initializeData: function(){
      this.users = [];
      this.namingConvention = null;
      this.maitre = false;
      this.selected = null;
      this.parentId = null;
      this.parentNode = null;
      this.value = [];
      this.ioTab = [];
      this.inputTab = [];
      this.selectedInputs = [];
      this.selectedOutputs = [];
      this.selectedSelectedInputs = [];
      this.selectedSelectedOutputs = [];
      this.inputSearch = "";
      this.outputSearch = "";
      this.searched = [];
      this.saveInputTab = [];
      this.saveOutputTab = [];
      this.inputsId = null;
      this.outputsId = null;
      this.backupInput = [];
      this.backupOutput = [];
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
    onSave: async function () {
      await DeviceHelper.modifyConventionAndMasterInfos(this.parentId, this.namingConvention, this.maitre);
      await DeviceHelper.addSelectedInputOutput(
        this.parentId,
        this.selectedInputs,
        this.selectedOutputs
      );
      this.dialog = false;
    },
    onSelectInput: async function(items) {
      //this.inputSearch = [];
      
         this.passElementBetweenTables(items, this.inputTab, this.selectedInputs, this.saveInputTab, 0);
         this.inputSearchOnTable();
    },
    onSelectOutput: async function(items) {
       this.passElementBetweenTables(items, this.outputTab, this.selectedOutputs,this.saveOutputTab, 0);
    },
    onSelectinPutSelection(items){
      this.selectedSelectedInputs = items;
    },
    onSelectOutputSelection(items){
      this.selectedSelectedOutputs = items;
    },
    onClickInputUnlink: async function(){
      //const temp = this.selectedSelectedInputs;
      //await this.constructSaveTab(this.saveInputTab);
      const temp = this.selectedSelectedInputs;
      for(var elt in temp){
         this.passElementBetweenTables(temp[elt], this.selectedInputs, this.inputTab, this.saveInputTab, 1);
      }
    },
    onClickOutputUnlink: async function(){
      const temp = this.selectedSelectedOutputs;
      for (var elt in temp){
         this.passElementBetweenTables(temp[elt], this.selectedOutputs, this.outputTab, this.saveOutputTab, 1);
      }
    },
    passElementBetweenTables: function(element, tabIn, tabOut, savedTab, sens){
      // sens = 0 : Available -> Linked (savedTab reduces)
      // sens = 1 : Linked -> Available (savedTab grows)
      // tabIn = await Array.from(new Set(tabIn));
      var index =  tabIn.findIndex((elt)=> (elt == element));
      if(index > -1){
        var iIndex =  tabOut.findIndex((elt)=> (elt) == element);
        if(iIndex > -1){
           tabIn.splice(index,1);
        }
        else{
           tabOut.push(tabIn[index]);
           tabIn.splice(index, 1);
        }
      }
      else{
      }
      index = -1;
      // await this.constructSaveTab(this.backupInput, this.saveInputTab, this.selectedInputs);
    },
    constructSaveTab:  function(backup, savedTab, tabSelected){

      savedTab = backup; 
      for (var elt in tabSelected){
        var index =  savedTab.findIndex((obj) => (obj == tabSelected[elt]));
        if(index > -1){
           savedTab.splice(index, 1);
        }
      }
    },
    inputSearchOnTable:  function() {
      var lowerSearch = this.inputSearch.toString().toLowerCase();
      var tempTab = [];

      for (let elt in this.backupInput) {
        if (
          this.backupInput[elt].title
            .toString()
            .toLowerCase()
            .includes(lowerSearch) ||
          this.backupInput[elt].name
            .toString()
            .toLowerCase()
            .includes(lowerSearch) ||
          this.backupInput[elt].idx
            .toString()
            .toLowerCase()
            .includes(lowerSearch)
        ) {
          tempTab.push(this.backupInput[elt]);
        }
      }
      for (let elt2 in this.selectedInputs){
        var index = tempTab.findIndex((obj) => (obj == this.selectedInputs[elt2]));
        if(index > -1){
           tempTab.splice(index, 1);
        }
      }
      this.inputTab = tempTab;
    },
    onClear: async function(){
      // this.inputTab = this.saveInputTab;
    },
    outputSearchOnTable: async function() {
      var lowerSearch = this.outputSearch.toString().toLowerCase();
      var tempTab = [];

      for (let elt in this.backupOutput) {
        if (
          this.backupOutput[elt].title
            .toString()
            .toLowerCase()
            .includes(lowerSearch) ||
          this.backupOutput[elt].name
            .toString()
            .toLowerCase()
            .includes(lowerSearch) ||
          this.backupOutput[elt].idx
            .toString()
            .toLowerCase()
            .includes(lowerSearch)
        ) {
          tempTab.push(this.backupOutput[elt]);
        }
      }
      for (let elt2 in this.selectedOutputs){
        var index = tempTab.findIndex((obj) => (obj == this.selectedOutputs[elt2]));
        if(index > -1){
          await tempTab.splice(index, 1);
        }
      }
      this.outputTab = tempTab;
    },
  },
};
</script>

<style lang="scss" scoped>
.tableaux {
  display: flex;
  flex-direction: row;
  place-content: baseline space-evenly;
}
.bloc-table {
  display: flex;
  flex-direction: column;
  place-content: center start;
}
.search {
  max-width: 100px;
}
.infos{
  display: flex;
  justify-content: space-around;
  padding-left: 30%;
  padding-right: 35%;
}
.infos-details{
  max-width: 35%;
}
.infos-details2{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.checkbox{
  padding-left: 8px;
}
</style>

