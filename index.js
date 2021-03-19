/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */



import Vue from "vue";
import Vuetify from 'vuetify';
import 'spinal-env-viewer-plugin-forge';
import { SpinalMountExtention } from "spinal-env-viewer-panel-manager-service";
import { SpinalForgeExtention } from "spinal-env-viewer-panel-manager-service_spinalforgeextention";
import { spinalContextMenuService } from "spinal-env-viewer-context-menu-service";

// vue files
import DialogAddDevices from "./vue/addDevices.vue";
import DialogAddDeviceProfiles from "./vue/addDeviceProfiles.vue";
import DialogItemList from "./vue/itemList.vue";
import DialogItemDetail from "./vue/ItemDetail.vue";
import DialogMonitoring from "./vue/monitoring.vue"
import DialogMonitoringDetails from "./vue/monitoringDetails.vue"

// button files
import { ButtonAddDeviceProfileContext } from "./buttons/ButtonAddDeviceProfileContext";
import { ButtonAddDeviceProfiles } from "./buttons/ButtonAddDeviceProfiles";
import { ButtonAddDevices } from "./buttons/ButtonAddDevices";
import { ButtonDisplayXMLFile } from "./buttons/ButtonDisplayXMLFile";
import { ButtonGenerateDeviceGraph } from "./buttons/ButtonGenerateDeviceGraph";
import { ButtonItemList } from "./buttons/ButtonItemList";
import { ButtonItemDetail } from "./buttons/ButtonItemDetail";
import { ButtonSaveProfileAsJson } from "./buttons/ButtonSaveProfileAsJson";
import { ButtonMonitoringConfiguration } from "./buttons/ButtonMonitoringConfiguration"



Vue.use( Vuetify );

                            /* ******* */
                            /* BUTTONS */
                            /* ******* */


spinalContextMenuService.registerApp("GraphManagerTopBar", new ButtonAddDeviceProfileContext(), [7]);
spinalContextMenuService.registerApp("GraphManagerSideBar", new ButtonAddDeviceProfiles(), [7]);
spinalContextMenuService.registerApp("GraphManagerSideBar", new ButtonAddDevices(), [7]);
spinalContextMenuService.registerApp("GraphManagerSideBar", new ButtonDisplayXMLFile(), [7]);
spinalContextMenuService.registerApp("GraphManagerSideBar", new ButtonGenerateDeviceGraph(), [7]);
spinalContextMenuService.registerApp("GraphManagerSideBar", new ButtonItemList(), [7]);
spinalContextMenuService.registerApp("GraphManagerSideBar", new ButtonItemDetail(), [7]);
spinalContextMenuService.registerApp("GraphManagerSideBar", new ButtonSaveProfileAsJson(), [7]);
spinalContextMenuService.registerApp("GraphManagerSideBar", new ButtonMonitoringConfiguration(), [7]);




                          /* ********** */
                          /* EXTENSIONS */
                          /* ********** */


SpinalMountExtention.mount( {
  // name registered.
  name: "DialogAddDeviceProfiles",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend( DialogAddDeviceProfiles ),
  // where to  append the Compoment
  parentContainer: document.body
}
);

SpinalMountExtention.mount( {
  // name registered.
  name: "DialogAddDevices",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend( DialogAddDevices ),
  // where to  append the Compoment
  parentContainer: document.body
} );

SpinalMountExtention.mount( {
  // name registered.
  name: "DialogItemList",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend( DialogItemList ),
  // where to  append the Compoment
  parentContainer: document.body
} );

SpinalMountExtention.mount( {
  // name registered.
  name: "DialogItemDetail",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend( DialogItemDetail ),
  // where to  append the Compoment
  parentContainer: document.body
} );

SpinalMountExtention.mount( {
  // name registered.
  name: "DialogMonitoring",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend( DialogMonitoring ),
  // where to  append the Compoment
  parentContainer: document.body
} );

SpinalMountExtention.mount( {
  // name registered.
  name: "DialogMonitoringDetails",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend( DialogMonitoringDetails ),
  // where to  append the Compoment
  parentContainer: document.body
} );


