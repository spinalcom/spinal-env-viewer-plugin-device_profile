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
                    <v-card-title class="headline">Add Device Profile
                    </v-card-title>
                    <v-card-text>
                        <v-text-field
                                placeholder="Name"
                                @change="onNameChange"
                        />
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="red darken-1"
                               flat
                               @click="onCancel">Annuler
                        </v-btn>

                        <v-btn color="green darken-1"
                               flat
                               @click="onSave">Valider
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
    </v-app>
</template>

<script>
 import { SpinalNode } from 'spinal-model-graph';
 import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
 import { SPINAL_RELATION_LST_PTR_TYPE } from "spinal-env-viewer-graph-service";

 import { DeviceHelper } from "../build/DeviceHelper";


  export default {
    name: "DialogAddDeviceProfiles",

    data: function () {
      return {
        name: "",
        description: "",
        dialog: false,
      }
    },
    methods: {
      initialize: function ( option ) {
      },
      onNameChange: function ( value ) {
        this.name = value;
      },
      onSave: function () {
        this.addDeviceProfiles(this.name)
          .then( () => {
             this.dialog = false;
           } );
      },
      addDeviceProfiles: function(name){

        return new Promise( resolve => {
          DeviceHelper.createDeviceProfile( name)
          .then( resolve )
        } )
        //  const graph = SpinalGraphService.getGraph();
        //  const context = SpinalGraphService.getContextWithType("deviceProfileContext")[0];
        //  const node = new SpinalNode(name, "deviceProfileNode");
        //  await graph.addChildInContext(context.info.id.get(), node, context.info.id.get(), SPINAL_RELATION_LST_PTR_TYPE);
      },
      onCancel: function () {
        this.dialog = false;
      },
      opened: function ( option ) {
        this.initialize( option );
        this.dialog = true;
      },
      removed: function () {

      },
      closeDialog( closeResult ) {

      }
  }
  }
</script>

<style scoped>

</style>
