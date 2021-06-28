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
          <v-card-title class="headline">{{ selected }} Item Supervision</v-card-title>
            <md-tabs>
              <md-tab id="tab-input" md-label="Measure">
                <div class="tableaux">
                  <div class="bloc-table">
                    <md-toolbar :md-elevation="1">
                      <span class="md-title">
                        Linked Measures
                      </span>
                      <v-spacer></v-spacer>
                        <md-button class="md-icon-button md-raised md-accent" flat @click="onClickTrendLogsUnlink">
                          <md-icon>link_off</md-icon>
                        </md-button>

                    </md-toolbar>

                    <md-table
                      v-model="trendLogsTab"
                      md-sort="title"
                      md-sort-order="asc"
                      md-card
                      md-fixed-header
                      @md-selected="onSelectLinkedTrendLog"
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
                      <!-- <md-field md-clearable @md-clear="onClear" class="md-toolbar-section-end"> -->
                      <md-field md-clearable class="md-toolbar-section-end">
                                              <v-spacer></v-spacer>

                        <md-input
                          class="search"
                          placeholder="Search..."
                          v-model="searched"
                          @input="onSearch"
                        />
                      </md-field>
                    </md-toolbar>

                    <md-table
                      v-model="users"
                      md-sort="title"
                      md-sort-order="asc"
                      md-card
                      md-fixed-header
                      @md-selected="onSelectAvailableTrendLog"
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

              <md-tab id="tab-output" md-label="Alarms">
                <div class="tableaux">
                  <div class="bloc-table">
                    <md-toolbar>
                      <span class="md-title">
                        Linked Alarms
                      </span>
                      <v-spacer></v-spacer>
                      <md-button class="md-icon-button md-raised md-accent" flat @click="onClickAlarmsUnlink">
                        <md-icon>link_off</md-icon>
                      </md-button>
                    </md-toolbar>

                    <md-table
                      v-model="alarmsTab"
                      md-sort="title"
                      md-sort-order="asc"
                      md-card
                      md-fixed-header
                      @md-selected="onSelectLinkedAlarm"
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
                          v-model="searched"
                          @input="onSearch"
                        />
                      </md-field>
                    </md-toolbar>

                    <md-table
                      v-model="users"
                      md-sort="title"
                      md-sort-order="asc"
                      md-card
                      md-fixed-header
                      @md-selected="onSelectAlarm"
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

              <md-tab id="tab-commands" md-label="Commands">
                <div class="tableaux">
                  <div class="bloc-table">
                    <md-toolbar :md-elevation="1">
                      <span class="md-title">
                        Linked Commands
                      </span>
                      <v-spacer></v-spacer>
                        <md-button class="md-icon-button md-raised md-accent" flat @click="onClickCommandsUnlink">
                          <md-icon>link_off</md-icon>
                        </md-button>

                    </md-toolbar>

                    <md-table
                      v-model="commandsTab"
                      md-sort="title"
                      md-sort-order="asc"
                      md-card
                      md-fixed-header
                      @md-selected="onSelectLinkedCommand"
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
                      <!-- <md-field md-clearable @md-clear="onClear" class="md-toolbar-section-end"> -->
                      <md-field md-clearable class="md-toolbar-section-end">
                                              <v-spacer></v-spacer>
                        <md-input
                          class="search"
                          placeholder="Search..."
                          v-model="searched"
                          @input="onSearch"
                        />
                      </md-field>
                    </md-toolbar>

                    <md-table
                      v-model="users"
                      md-sort="title"
                      md-sort-order="asc"
                      md-card
                      md-fixed-header
                      @md-selected="onSelectCommand"
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
  name: "DialogItemSupervision",

  data: () => ({
    users: [],
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
    saveInputTab: [],
    saveOutputTab: [],
    inputsId: null,
    outputsId: null,
    backupInput: [],
    backupOutput: [],

    supervisionId: null,
    trendLogsId: null,
    commandsId: null,
    alarmsId: null,
    savedEntries: [],
    trendLogsTab: [],
    commandsTab: [],
    alarmsTab: [],
    searched: [],
    backupTab: [],
    selectedLinkedTrendLogs: [],
    constMeasure: [],
    constAlarms: [],
    constCommands: []
    // globalNotMonitoredMeasuresId: null,
    // globalNotMonitoredAlarmsIdId: null

  }),
  methods: {
    initialize: async function (option) {
      console.log(option);
       this.initializeData();
       console.log(option.selectedNode.id.get());
       console.log("test");
       let realNode = SpinalGraphService.getRealNode(option.selectedNode.id.get());
       console.log("realnode");
       console.log(realNode);

      this.parentId = option.selectedNode.id._data;
      this.selected = option.selectedNode.name.get();

      let superv = await SpinalGraphService.getChildren(this.parentId, "hasSupervisionNode");
      // console.log("supervision node : ");
      console.log(superv);

      
      console.log(this.parentId);
      // let supervisionId = (await SpinalGraphService.getChildren(this.parentId, "hasSupervisionNode"))[0].id.get();
      let supervisionId = superv[0].id.get();
      
      // console.log("supervisionId " +supervisionId);
      this.supervisionId = supervisionId;
      

      // this.supervisionId = (await SpinalGraphService.getChildren(this.parentId, "hasSupervisionNode"))[0].id.get();
      // console.log(this.supervisionId);
      // let trendlogs = await SpinalGraphService.getChildren(this.supervisionId, "hasTrendLogs");
      // console.log(trendlogs);

      // récupération de la liste des inputs / outputs
      this.savedEntries = await DeviceHelper.itemSupervisionInputOutput(
        option.selectedNode.id.get()
      );
      // this.savedEntries = await DeviceHelper.itemSupervisionInputOutput(
      //   this.parentId
      // );
      this.users = this.savedEntries;

      // enlèvement des noeuds trend logs déjà liés à cet item
      this.trendLogsId = (await SpinalGraphService.getChildren(supervisionId, "hasTrendLogs"))[0].id.get();
      // enlèvement des noeuds alarms déjà liés à cet item
      this.alarmsId = (await SpinalGraphService.getChildren(supervisionId, "hasAlarms"))[0].id.get();
      // console.log(this.alarmsId);

      // enlèvement des noeuds commands déjà liés à cet item
      this.commandsId = (await SpinalGraphService.getChildren(supervisionId, "hasCommands"))[0].id.get();
      // console.log(this.commandsId);

      this.constMeasure = await DeviceHelper.getItemSupervisionLinks(this.trendLogsId, "hasMeasure");
      for(let eltMes of this.constMeasure) this.passElementBetweenTables(eltMes, this.users, this.trendLogsTab, 0);

      this.constAlarms = await DeviceHelper.getItemSupervisionLinks(this.alarmsId, "hasAlarm");
      for(let eltAl of this.constAlarms) this.passElementBetweenTables(eltAl, this.users, this.alarmsTab, 0);

      this.constCommands = await DeviceHelper.getItemSupervisionLinks(this.commandsId, "hasCommand");
      for(let eltCom of this.constCommands) this.passElementBetweenTables(eltCom, this.users, this.commandsTab, 0);



      console.log(this.users);
      // await this.arrangeTabs();

      this.backupTab = this.users;
    },
    //a changer
    initializeData: function(){
      this.users = [];
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
      this.supervisionId = null;
      this.trendLogsId = null;
      this.commandsId = null;
      this.alarmsId = null;
      this.savedEntries = [];
      this.trendLogsTab = [];
      this.commandsTab = [];
      this.alarmsTab = [];
      this.searched = [];
      this.backupTab = [];
      this.selectedLinkedTrendLogs = [];
      this.constMeasure = [];
      this.constAlarms = [];
      this.constCommands = [];
      // this.globalNotMonitoredMeasuresId = null;
      // this.globalNotMonitoredAlarmsIdId = null;
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
    compareTabs: function(tabToCompare, tabReference){
      // cette fonction compare deux tableaux pour la sauvegarde : elle ressort un objet json 
      // contenant une liste de liens à effacer et une liste de liens à ajouter. Les autres resteront inchangés
      let returnTab = {
        elementsToAdd : [],
        elementsToDelete : []
      };
      for(let ref of tabReference){
        let indexRef = tabToCompare.findIndex(elt => elt.nodeId == ref.nodeId);
        if(indexRef == -1) returnTab.elementsToDelete.push(ref.nodeId);
      }
      for(let comp of tabToCompare){
        let indexComp = tabReference.findIndex(elt => elt.nodeId == comp.nodeId);
        if(indexComp == -1) returnTab.elementsToAdd.push(comp.nodeId);
      }
      return returnTab;
    },
    // a changer
    onSave: async function () {

      // récupération global Measure & alarms non monitorés pour ajouter liaison
      let itemListNode = await SpinalGraphService.getParents(this.parentId, "hasItem");
      let deviceProfileNode = await SpinalGraphService.getParents(itemListNode[0].id.get(), "hasItemList");
      let globalSupervisionNode = await SpinalGraphService.getChildren(deviceProfileNode[0].id.get(), "hasGlobalSupervision");
      let globalMeasuresNode = await SpinalGraphService.getChildren(globalSupervisionNode[0].id.get(), "hasGlobalMeasures");
      let globalAlarmsNode = await SpinalGraphService.getChildren(globalSupervisionNode[0].id.get(), "hasGlobalAlarms");
      let globalMeasuresIntervalTime = await SpinalGraphService.getChildren(globalMeasuresNode[0].id.get(), "hasIntervalTimeNode");
      let globalAlarmsIntervalTime = await SpinalGraphService.getChildren(globalAlarmsNode[0].id.get(), "hasIntervalTimeNode");
      let indexOfNotMonitoredMesure = globalMeasuresIntervalTime.findIndex(elt => elt.name.get() == "Not Monitored");
      let indexOfNotMonitoredAlarm = globalAlarmsIntervalTime.findIndex(elt => elt.name.get() == "Not Monitored");


      let measures = this.compareTabs(this.trendLogsTab, this.constMeasure);
      let alarms = this.compareTabs(this.alarmsTab, this.constAlarms);
      console.log("this.alarmsTab");
      console.log(this.alarmsTab);
      console.log("const alarm");
      console.log(this.constAlarms);
      console.log("alarms");
      console.log(alarms);
      console.log("this.alarmsId");
      console.log(this.alarmsId)
      let commands = this.compareTabs(this.commandsTab, this.constCommands);
      // elements to Add
      for(let addTL of measures.elementsToAdd){
         await DeviceHelper.generateSupervisionLinks(this.trendLogsId, addTL, "hasMeasure", globalMeasuresIntervalTime[indexOfNotMonitoredMesure].id.get(), "hasIntervalTime");
      }
      console.log("sortie boucle trend log");
      for(let addAl of alarms.elementsToAdd){
        console.log("entrée boucle for alarms to add");
        console.log(addAl);
        // await DeviceHelper.generateSupervisionLinks(this.alarmsId, addAl, "hasAlarm");
         await DeviceHelper.generateSupervisionLinks(this.alarmsId, addAl, "hasAlarm", globalAlarmsIntervalTime[indexOfNotMonitoredAlarm].id.get(), "hasIntervalTime");
      }
      for(let addCom of commands.elementsToAdd){
        // await DeviceHelper.generateSupervisionLinks(this.commandsId, addCom, "hasCommand");
      }
      // elements to Delete
      for(let delTL of measures.elementsToDelete){
        let parentIntervalTime = await SpinalGraphService.getParents(delTL, "hasIntervalTime");
        let parentSupervisionTrendLogs = await SpinalGraphService.getParents(delTL, "hasMeasure");
        if(parentIntervalTime.length != 0){
          await DeviceHelper.clearLinksOneByOne(parentIntervalTime[0].id.get(), delTL, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
        }
        if(parentSupervisionTrendLogs.length != 0){
          await DeviceHelper.clearLinksOneByOne(parentSupervisionTrendLogs[0].id.get(), delTL, "hasMeasure", SPINAL_RELATION_PTR_LST_TYPE);
        }
      }
      for(let delAl of alarms.elementsToDelete){
        let parentIntervalTime = await SpinalGraphService.getParents(delAl, "hasIntervalTime");
        let parentSupervisionAlarms = await SpinalGraphService.getParents(delAl, "hasAlarm");
        if(parentIntervalTime.length != 0){
          await DeviceHelper.clearLinksOneByOne(parentIntervalTime[0].id.get(), delAl, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
        }
        if(parentSupervisionAlarms.length != 0){
          await DeviceHelper.clearLinksOneByOne(parentSupervisionAlarms[0].id.get(), delAl, "hasAlarm", SPINAL_RELATION_PTR_LST_TYPE);
        }
      }
      for(let delCom of commands.elementsToDelete){
        // let parent = await SpinalGraphService.getParents(delCom, "hasIntervalTime");
        // if(parent.length != 0){
        //   await DeviceHelper.clearLinksOneByOne(parent[0].id.get(), delCom, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
        // }
      }
      this.dialog = false;
    },
    onSelectAvailableTrendLog: async function(items){
      this.passElementBetweenTables(items, this.users, this.trendLogsTab, 0);
    },
    onSelectCommand: async function(items){
      this.passElementBetweenTables(items, this.users, this.commandsTab, 0);
    },
    onSelectAlarm: async function(items){
      this.passElementBetweenTables(items, this.users, this.alarmsTab, 0);
    },
    passElementBetweenTables: function(element, tabIn, tabOut, sens){
        // sens = 0 : Available -> Linked (savedTab reduces)
        // sens = 1 : Linked -> Available (savedTab grows)
        if(element != undefined){
          const tempElt = element;
          var index =  tabIn.findIndex((elt)=> (elt == tempElt || elt.nodeId == tempElt.nodeId) );

          if(index > -1){
            var iIndex =  tabOut.findIndex((elt)=> (elt == tempElt || elt.nodeId == tempElt.nodeId));
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
          let backupIndex = this.backupTab.findIndex(elt => (elt == tempElt || elt.nodeId == tempElt.nodeId));
          if(backupIndex > -1 && sens ==0){
            this.backupTab.splice(backupIndex, 1);
          }
          else if(backupIndex <= -1 && sens ==1){
            this.backupTab.push(tempElt);
          }
          index = -1;
          backupIndex = -1;
        }
        
      },
    onSearch: async function(){
      var lowerSearch = this.searched.toString().toLowerCase();
      this.users = this.backupTab.filter((elt) => (elt.title.toString().toLowerCase().includes(lowerSearch)) || (elt.name.toString().toLowerCase().includes(lowerSearch)));
    },
    onSelectLinkedTrendLog: function(items){
      // this.selectedLinkedTrendLogs.push(items);
      this.selectedLinkedTrendLogs = items;
      console.log(this.selectedLinkedTrendLogs);
    },
    onSelectLinkedAlarm: function(items){
      // this.selectedLinkedTrendLogs.push(items);
      this.selectedLinkedAlarms = items;
      console.log(this.selectedLinkedAlarms);
    },
    onSelectLinkedCommand: function(items){
      // this.selectedLinkedTrendLogs.push(items);
      this.selectedLinkedCommands = items;
      console.log(this.selectedLinkedCommands);
    },
    onClickTrendLogsUnlink: function(items){
      console.log("je suis dans la fonction");
       const temp = this.selectedLinkedTrendLogs;
      for (let elt in temp){
         this.passElementBetweenTables(temp[elt], this.trendLogsTab, this.users, 1);
        //  this.selectedLinkedTrendLogs.splice(elt, 1);
      }
      this.selectedLinkedTrendLogs = [];
    },
    onClickAlarmsUnlink: function(items){
      console.log("je suis dans la fonction");
       const temp = this.selectedLinkedAlarms;
      for (let elt in temp){
         this.passElementBetweenTables(temp[elt], this.alarmsTab, this.users, 1);
      }
      this.selectedLinkedAlarms = [];
    },
    onClickCommandsUnlink: function(items){
      console.log("je suis dans la fonction");
       const temp = this.selectedLinkedCommands;
      for (let elt in temp){
         this.passElementBetweenTables(temp[elt], this.commandsTab, this.users, 1);
        //  this.selectedLinkedCommands.splice(elt, 1);
      }
      this.selectedLinkedCommands = [];
    }
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

