import { SpinalContextApp } from "spinal-env-viewer-context-menu-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");


export class ButtonUpdateProfileGenerated extends SpinalContextApp {
    constructor() {
        super("Update Profile Generated", "Update Profile Generated description",
            {
                icon: "update",
                icon_type: "in",
                backgroundColor: "#0000FF",
                fontColor: "#FFFFFF"
            })
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
        spinalPanelManagerService.openPanel("DialogGetFromDiscovery", {
            contextId,
            nodeId,
            callback: (nodeId, contextId, deviceSelected, networkSelected, contextSelected) => {
                spinalPanelManagerService.openPanel("DialogUpdateDeviceProfile", {
                    contextId,
                    nodeId,
                    deviceSelected,
                    networkSelected,
                    contextSelected
                });
            }
        });
    }
}

console.log("load ButtonUpdateProfileGenerated");