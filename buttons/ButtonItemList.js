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

const {
  spinalPanelManagerService
} = require("spinal-env-viewer-panel-manager-service");


export class ButtonItemList extends SpinalContextApp {
    constructor() {
      super("Item list", "Item list test description", {
        icon: "table_chart",
        icon_type: "in",
        backgroundColor: "#0000FF",
        fontColor: "#FFFFFF"
      });
      this.action = this.openPanel.bind( this );
    }
  
    isShown(option) {
       if (option.selectedNode.type.get() === 'itemList') return Promise.resolve(true);
       else return Promise.resolve(-1);
    }
    openPanel(option) {
      spinalPanelManagerService.openPanel( "DialogItemList", option);
    }
  }