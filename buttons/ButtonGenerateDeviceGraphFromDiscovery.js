/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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

import { SpinalContextApp}  from "spinal-env-viewer-context-menu-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { DeviceHelper } from "../build/DeviceHelper";
import { FileExplorer } from "../FileExplorer";

const {
  spinalPanelManagerService
  // ,SpinalMountExtention
} = require("spinal-env-viewer-panel-manager-service");

//const xml2js = require('xml2js');
//const fs = require('fs');


export class ButtonGenerateDeviceGraphFromDiscovery extends SpinalContextApp {
    constructor() {
      super("Generate Device Graph From Discovery", "Generate Device Graph From Discovery test description", {
        icon: "cached",
        icon_type: "in",
        backgroundColor: "#0000FF",
        fontColor: "#FFFFFF"
      });
      //this.action = this.findBmsDevices.bind( this );
    }
  
    isShown(option) {
      let relationName = SpinalGraphService.getRelationNames(option.selectedNode.id.get());
       if (option.selectedNode.type.get() === 'device' && relationName[0] !== 'hasFiles') 
       return Promise.resolve(true);
       else return Promise.resolve(-1);
    }

    action(option) {
      let contextId = option.context.id.get();
      let nodeId = option.selectedNode.id.get();
      spinalPanelManagerService.openPanel( "DialogGetFromDiscovery", {contextId , nodeId});
    
    }
      
      //console.log(option.selectedNode.type.get());
      //console.log(SpinalGraphService.getRealNode(option.selectedNode.id.get()));
      //console.log(SpinalGraphService.getRelationNames(option.selectedNode.id.get()));
      //console.log(SpinalGraphService.getContextWithType('Network'));
      
    async findBmsDevices(){
      let ctx = SpinalGraphService.getContextWithType('Network');
      let startID= ctx[0].info.id.get();

      let child = await SpinalGraphService.findInContext(startID,ctx[0].info.id.get(),elt => elt.info.type.get()== 'BmsDevice');
      console.log(child.name._data);
    }

    

  }
