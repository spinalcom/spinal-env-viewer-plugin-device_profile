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
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { SpinalContext, SpinalGraphService, SpinalNode, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
import { PART_RELATION_NAME, PART_RELATION_TYPE, DEVICE_RELATION_NAME, DEVICE_RELATION_TYPE, DEVICE_TYPE, DEVICE_PROFILES_TYPE } from "../constants";

class DeviceHelper {

  static initialize() {
    if (DeviceHelper.initialized !== null) {
      return DeviceHelper.initialized;
    }

    DeviceHelper.initialized = new Promise((resolve, reject) => {

      DeviceHelper.context = SpinalGraphService.getContext(DeviceHelper.contextName);
      if (typeof DeviceHelper.context === "undefined") {
        SpinalGraphService.addContext(DeviceHelper.contextName, DeviceHelper.type).then(context => {
          DeviceHelper.context = context;
          DeviceHelper.contextId = context.info.id.get();

          console.log(DeviceHelper);
          console.log(DeviceHelper.contextId);
          resolve(true);
        }).catch(reject);
      }
      else {
        DeviceHelper.contextId = DeviceHelper.context.info.id.get();
        console.log(DeviceHelper.contextId);
        resolve(true);
      }
    });
    return DeviceHelper.initialized;
  }

  static createDeviceProfile(name) {
    return DeviceHelper.initialize().then(() => {
      const deviceProfileId = SpinalGraphService.createNode({
        name,
        type: DEVICE_PROFILES_TYPE
      }, undefined);
      return SpinalGraphService.addChildInContext(DeviceHelper.contextId,
        deviceProfileId, DeviceHelper.contextId, DEVICE_RELATION_NAME, DEVICE_RELATION_TYPE);
    });
  }

  static createDevice(parentId, name) {
    return DeviceHelper.initialize()
      .then(() => {
        const deviceId = SpinalGraphService.createNode({
          name,
          type: DEVICE_TYPE
        }, undefined);

        var deviceContext = SpinalGraphService
          .addChildInContext(parentId, deviceId, DeviceHelper.contextId,
            PART_RELATION_NAME, PART_RELATION_TYPE);

        return deviceContext;

      })
  }

  static async generateProfile(parentId, nodeName, nodeType, nodeIdx, relationName, relationType) {
    return DeviceHelper.initialize()
      .then(async result => {

        const generatedProfileId = SpinalGraphService.createNode({
          name: nodeName,
          type: nodeType,
          IDX: nodeIdx
        }, undefined);
        var generatedProfileNode = await SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId,
          relationName, relationType);

        return generatedProfileNode;
      })
  }

  static async generateNetworkValue(parentId, json) {
    return DeviceHelper.initialize()
      .then(async result => {

        const generatedProfileId = SpinalGraphService.createNode({
          name: "Network Values",
          type: "networkValue"
        }, undefined);
        var generatedProfileNode = await SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId,
          "hasNetworkValues", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in json) {
          var networkValueNode = await DeviceHelper.generateProfile(generatedProfileId, json[elt].NAME, "networkValue",
            json[elt].IDX, "hasNetworkValue", SPINAL_RELATION_PTR_LST_TYPE);

          networkValueNode.add_attr({
            generic_name: "NV_" + (parseInt(json[elt].IDX) + 1),
            name: json[elt].NAME,
            idx: json[elt].IDX,
            type: "networkValue"
          });
          console.log(networkValueNode);
        }



      }).catch(err => console.log(err));
  }

  static async generateBinaryValue(parentId, json) {
    return DeviceHelper.initialize()
      .then(async result => {

        const generatedProfileId = SpinalGraphService.createNode({
          name: "Binary Values",
          type: "binaryValue"
        }, undefined);
        var generatedProfileNode = await SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId,
          "hasBinaryValues", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in json) {
          var binaryValueNode = await DeviceHelper.generateProfile(generatedProfileId, json[elt].NAME, "binaryValue",
            json[elt].IDX, "hasBinaryValue", SPINAL_RELATION_PTR_LST_TYPE);

          binaryValueNode.add_attr({
            generic_name: "BV_" + (parseInt(json[elt].IDX) + 1),
            name: json[elt].NAME,
            idx: json[elt].IDX,
            type: "binaryValue"
          });
          console.log(binaryValueNode);
        }
      }).catch(err => console.log(err));
  }

  static async generateAnalogValue(parentId, json) {
    return DeviceHelper.initialize()
      .then(async result => {

        const generatedProfileId = SpinalGraphService.createNode({
          name: "Analog Values",
          type: "analogValue"
        }, undefined);
        var generatedProfileNode = await SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId,
          "hasAnalogValues", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in json) {
          var analogValueNode = await DeviceHelper.generateProfile(generatedProfileId, json[elt].NAME, "analogValue",
            json[elt].IDX, "hasAnalogValue", SPINAL_RELATION_PTR_LST_TYPE);

          analogValueNode.add_attr({
            generic_name: "AV_" + (parseInt(json[elt].IDX) + 1),
            name: json[elt].NAME,
            idx: json[elt].IDX,
            type: "analogValue"
          });

          console.log(analogValueNode);
        }
      }).catch(err => console.log(err));
  }

  static async generateMSValue(parentId, json) {
    return DeviceHelper.initialize()
      .then(async result => {

        const generatedProfileId = SpinalGraphService.createNode({
          name: "Multi-State Value",
          type: "multiStateValue"
        }, undefined);
        var generatedProfileNode = await SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId,
          "hasMultiStateValues", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in json) {
          var MSValueNode = await DeviceHelper.generateProfile(generatedProfileId, json[elt].NAME, "multiStateValue",
            json[elt].IDX, "hasMultiStateValue", SPINAL_RELATION_PTR_LST_TYPE);

          MSValueNode.add_attr({
            generic_name: "MSV_" + (parseInt(json[elt].IDX) + 1),
            name: json[elt].NAME,
            idx: json[elt].IDX,
            type: "multiStateValue"
          });

          console.log(MSValueNode);
        }
      }).catch(err => console.log(err));
  }

  static async generateBacNetValues(parentId, json) {

    const parentNode = await SpinalGraphService.getRealNode(parentId);
    const children = await parentNode.getChildren("hasBacnetValues");
    console.log(children);
    if (children.length == 0) {

      const object_BacnetIPNetworkValueResource = json.Root.BacnetIPNetworkValueResource;
      const object_BacnetIPBinaryValueResource = json.Root.BacnetIPBinaryValueResource;
      const object_BacnetIPAnalogValueResource = json.Root.BacnetIPAnalogValueResource;
      const object_BacnetIPMultiStateValueResource = json.Root.BacnetIPMultiStateValueResource;

      return DeviceHelper.initialize()
        .then(async result => {

          const generatedBacnetValuesId = SpinalGraphService.createNode({
            name: "BacnetValues",
            type: "bacnetValues"
          }, undefined);
          var generatedBacnetValuesnode = await SpinalGraphService.addChildInContext(parentId, generatedBacnetValuesId, DeviceHelper.contextId,
            "hasBacnetValues", SPINAL_RELATION_PTR_LST_TYPE);

          const bacnetId = generatedBacnetValuesnode.info.id;
          await DeviceHelper.generateNetworkValue(bacnetId, object_BacnetIPNetworkValueResource);
          await DeviceHelper.generateBinaryValue(bacnetId, object_BacnetIPBinaryValueResource);
          await DeviceHelper.generateAnalogValue(bacnetId, object_BacnetIPAnalogValueResource);
          await DeviceHelper.generateMSValue(bacnetId, object_BacnetIPMultiStateValueResource);
        }).catch(err => console.log(err));

    }
    else{
      console.log("Création des BacnetValues déjà effectuée");
    }


  }

  // static async generateLampProfile(parentId, json) {

  //   const tabNetwork = ["50", "51", "52", "53", "54", "55", "56", "57", "20"];
  //   const tabAVNetwork = ["65", "66", "67", "68", "69", "70", "71", "72", "88"];
  //   const tabAVModeAuto = ["92", "93", "94", "95", "96", "97"];
  //   const tabBV = ["30", "50", "51", "52", "53", "54", "55", "56", "57"];

  //   const jsonNV = json.Root.BacnetIPNetworkValueResource;
  //   const jsonAV = json.Root.BacnetIPAnalogValueResource;
  //   const jsonBV = json.Root.BacnetIPBinaryValueResource;

  //   return DeviceHelper.initialize()
  //     .then(async result => {

  //       // 1: Génération du profil de lampe
  //       const LampId = SpinalGraphService.createNode({
  //         name: "Lamp Profile",
  //         type: "lampProfile"
  //       }, undefined);
  //       var LampNode = await SpinalGraphService.addChildInContext(parentId, LampId, DeviceHelper.contextId,
  //         "hasLampProfile", SPINAL_RELATION_PTR_LST_TYPE);

  //       // 1a : génération des NV
  //       const generatedNetworkValueId = SpinalGraphService.createNode({
  //         name: "Network Values",
  //         type: "networValue"
  //       }, undefined);
  //       var generatedNetworkValueNode = await SpinalGraphService.addChildInContext(LampId, generatedNetworkValueId, DeviceHelper.contextId,
  //         "hasNetworkValues", SPINAL_RELATION_PTR_LST_TYPE);

  //       for (var elt in jsonNV) {
  //         if (tabNetwork.includes(jsonNV[elt].IDX)) {
  //           var NVNode = await DeviceHelper.generateProfile(generatedNetworkValueId, jsonNV[elt].NAME, "networkValue",
  //             jsonNV[elt].IDX, "hasNetworkValue", SPINAL_RELATION_PTR_LST_TYPE);

  //           for (var AVNVelt in jsonAV) {
  //             if (jsonAV[AVNVelt].IDX == jsonNV[elt].Target.ObjectInstance - 1) {
  //               var AVNVNode = await DeviceHelper.generateProfile(NVNode.info.id, jsonAV[AVNVelt].NAME, "analogValue",
  //                 jsonAV[AVNVelt].IDX, "hasAnalogValue", SPINAL_RELATION_PTR_LST_TYPE);
  //             }
  //           }
  //           console.log(NVNode);
  //         }
  //       }

  //       // 1b: Génération des AV du mode automatique

  //       const modeAutomatiqueId = SpinalGraphService.createNode({
  //         name: "Mode Automatique",
  //         type: "mode"
  //       }, undefined);
  //       var modeAutomatiqueNode = await SpinalGraphService.addChildInContext(LampId, modeAutomatiqueId, DeviceHelper.contextId,
  //         "hasModeAutomatique", SPINAL_RELATION_PTR_LST_TYPE);

  //       for (var AVelt in jsonAV) {
  //         if (tabAVModeAuto.includes(jsonAV[AVelt].IDX)) {
  //           var AVNode = await DeviceHelper.generateProfile(modeAutomatiqueId, jsonAV[AVelt].NAME, "analogValue",
  //             jsonAV[AVelt].IDX, "hasAnalogValue", SPINAL_RELATION_PTR_LST_TYPE);
  //           console.log(AVNode);


  //         }
  //       }

  //       // 1c: Génération des Binary Value restantes

  //       const binaryValueId = SpinalGraphService.createNode({
  //         name: "Binary Values",
  //         type: "binaryValues"
  //       }, undefined);
  //       var binaryValueNode = await SpinalGraphService.addChildInContext(LampId, binaryValueId, DeviceHelper.contextId,
  //         "hasBinaryValues", SPINAL_RELATION_PTR_LST_TYPE);

  //       for (var BVelt in jsonBV) {
  //         if (tabBV.includes(jsonBV[BVelt].IDX)) {
  //           var BVNode = await DeviceHelper.generateProfile(binaryValueId, jsonBV[BVelt].NAME, "binaryValue",
  //             jsonBV[BVelt].IDX, "hasBinaryValue", SPINAL_RELATION_PTR_LST_TYPE);
  //           console.log(BVNode);
  //         }
  //       }
  //     }).catch(err => console.log(err));
  // }

  //////////////////////////////////////////////////
  ///////////      ITEM LIST FONCTIONS /////////////
  //////////////////////////////////////////////////

  static async saveProfileAsJson(nodeId){

    var item_list = [];

    const node = SpinalGraphService.getRealNode(nodeId);
    const itemsId = node.getChildrenIds();

    for (var it in itemsId){
      const item = await SpinalGraphService.getNodeAsync(itemsId[it]);
      // console.log(item);
      item_list.push({
        name: item.name._data,
        type: item.itemType._data,
        maitre: item.maitre._data,
        inputs: [],
        outputs: []
      });

      const inputsNodeId = (await SpinalGraphService.getChildren(item.id, "hasInputs"))[0].childrenIds;
      for (var ids in inputsNodeId){
        const input = await SpinalGraphService.getNodeAsync(inputsNodeId[ids]);
        item_list[it].inputs.push({
          name: input.name._data,
          IDX: input.IDX._data,
          type: input.type._data
        });
      }


      const outputsNodeId = (await SpinalGraphService.getChildren(item.id, "hasOutputs"))[0].childrenIds;
      for (var idss in outputsNodeId){
        const output = await SpinalGraphService.getNodeAsync(outputsNodeId[idss]);
        item_list[it].outputs.push({
          name: output.name._data,
          IDX: output.IDX._data,
          type: output.type._data
        });
      }
    }

    console.log("objet javascript");
    console.log(item_list);
    
    console.log("conversion au format JSON");
    console.log(JSON.stringify(item_list));

    const dataToExport = new Blob([JSON.stringify(item_list)], { type: ".json" });
    console.log("blob");
    console.log(dataToExport);



  }

  static async generateItem_list(parentId) {

    const parentNode = await SpinalGraphService.getRealNode(parentId);
    const children = await parentNode.getChildren("hasItemList");
    if (children.length == 0){

      return DeviceHelper.initialize()
      .then(async result => {
        // Génération du noeud Item_list

        const item_listID = SpinalGraphService.createNode({
          name: "Item_list",
          type: "itemList"
        }, undefined);

        var item_listNode = await SpinalGraphService.addChildInContext(parentId, item_listID, DeviceHelper.contextId,
          "hasItemList", SPINAL_RELATION_PTR_LST_TYPE);
        return item_listNode;

      })
      .catch(err => console.log(err));
    }
    else{
      console.log("Création d'Item_list déjà effectuée");
    }

    
  }

  static async listItemInTab(node) {
    var tab2 = [];
    var children = await node.childrenIds;
    
    for (var elt in children) {
      var childNode = await SpinalGraphService.getNodeAsync(children[elt]);
      tab2.push({
        name: childNode.name._data,
        maitre: childNode.maitre._data,
        itemType: childNode.itemType._data,
        namingConvention: childNode.namingConvention._data,
        nodeId: children[elt]
      });
    }
    return tab2;
  }

  static async generateItem(parentId, nodeName, isMaitre, itemType, namingConvention, relationName) {
    return DeviceHelper.initialize()
      .then(async result => {

        // add item node
        const generatedItemId = SpinalGraphService.createNode({
          name: nodeName,
          maitre: isMaitre,
          itemType: itemType,
          namingConvention: namingConvention,
          type: "item",
        }, undefined);
        await SpinalGraphService.addChildInContext(parentId, generatedItemId, DeviceHelper.contextId,
          relationName, SPINAL_RELATION_PTR_LST_TYPE);

          // add inputs node
          var inputNodeId = SpinalGraphService.createNode({
            name: "Inputs",
            type: "input"
          }, undefined)
          await SpinalGraphService.addChildInContext(generatedItemId, inputNodeId, DeviceHelper.contextId, "hasInputs", SPINAL_RELATION_PTR_LST_TYPE);

          // add outputs node
          var outputNodeId = SpinalGraphService.createNode({
            name: "Outputs",
            type: "output"
          }, undefined)
          await SpinalGraphService.addChildInContext(generatedItemId, outputNodeId, DeviceHelper.contextId, "hasOutputs", SPINAL_RELATION_PTR_LST_TYPE);

          // create returned object
        var returnedObject = {
          name: nodeName,
          maitre: isMaitre,
          itemType: itemType,
          namingConvention: namingConvention,
          nodeId: generatedItemId
          // details: "test"
        };

        return returnedObject;
      })
  }

  static async itemDetailInput(selectedNode) {

    var inputTab = [];
    var parent1 = await SpinalGraphService.getParents(selectedNode.id, "hasItem");
    var nodeParent1 = await SpinalGraphService.getNodeAsync(parent1[0].id._data);
    var parent2 = await SpinalGraphService.getParents(nodeParent1.id, "hasItemList");
    var nodeParent2 = await SpinalGraphService.getNodeAsync(parent2[0].id._data);
    var child = await SpinalGraphService.getChildren(nodeParent2.id, "hasBacnetValues");
    var childrenNetworkValues = await SpinalGraphService.getChildren(child[0].id, "hasNetworkValues");
    var childrenNetworkValuesIds = childrenNetworkValues[0].childrenIds;

    for (var elt in childrenNetworkValuesIds) {
      var networkValueNode = await SpinalGraphService.getNodeAsync(childrenNetworkValuesIds[elt]);
      var idx = parseInt(networkValueNode.IDX._data);
      var name = networkValueNode.name._data;
      var title = "NV_" + (idx + 1);
      inputTab.push({
        title: title,
        name: name,
        idx: idx
      });
    }
    return inputTab;

  }

  static async itemDetailOutput(selectedNode) {
    var outputTab = [];
    var parent1 = await SpinalGraphService.getParents(selectedNode.id, "hasItem");
    var nodeParent1 = await SpinalGraphService.getNodeAsync(parent1[0].id._data);
    var parent2 = await SpinalGraphService.getParents(nodeParent1.id, "hasItemList");
    var nodeParent2 = await SpinalGraphService.getNodeAsync(parent2[0].id._data);
    var child = await SpinalGraphService.getChildren(nodeParent2.id, "hasBacnetValues");

    // Analog Values
    var childrenAnalogValues = await SpinalGraphService.getChildren(child[0].id, "hasAnalogValues");
    var childrenAnalogValuesIds = childrenAnalogValues[0].childrenIds;
    for (var elt in childrenAnalogValuesIds) {
      var analogValueNode = await SpinalGraphService.getNodeAsync(childrenAnalogValuesIds[elt]);
      var idx = parseInt(analogValueNode.IDX._data);
      var name = analogValueNode.name._data;
      var title = "AV_" + (idx + 1);
      outputTab.push({
        title: title,
        name: name,
        idx: idx
      });
    }

    // Binary Value
    var childrenBinaryValues = await SpinalGraphService.getChildren(child[0].id, "hasBinaryValues");
    var childrenBinaryValuesIds = childrenBinaryValues[0].childrenIds;
    for (var elt in childrenBinaryValuesIds) {
      var binaryValueNode = await SpinalGraphService.getNodeAsync(childrenBinaryValuesIds[elt]);
      var idx = parseInt(binaryValueNode.IDX._data);
      var name = binaryValueNode.name._data;
      var title = "BV_" + (idx + 1);
      outputTab.push({
        title: title,
        name: name,
        idx: idx
      });
    }

    // Multi-State Value
    var childrenMSValues = await SpinalGraphService.getChildren(child[0].id, "hasMultiStateValues");
    var childrenMSValuesIds = childrenMSValues[0].childrenIds;
    for (var elt in childrenMSValuesIds) {
      var MSValueNode = await SpinalGraphService.getNodeAsync(childrenMSValuesIds[elt]);
      var idx = parseInt(MSValueNode.IDX._data);
      var name = MSValueNode.name._data;
      var title = "MSV_" + (idx + 1);
      outputTab.push({
        title: title,
        name: name,
        idx: idx
      });
    }

    return outputTab;
  }

  static async itemDetailInfos(selectedNode) {
    console.log(selectedNode);
    if(selectedNode.info == undefined){
      console.log({
        namingConvention: selectedNode.namingConvention._data,
        maitre: selectedNode.maitre._data
      });
      return {
        namingConvention: selectedNode.namingConvention._data,
        maitre: selectedNode.maitre._data
      };
    }
    else{
      console.log({
        namingConvention: selectedNode.info.namingConvention._data,
        maitre: selectedNode.info.maitre._data
      });
      return {
        namingConvention: selectedNode.info.namingConvention._data,
        maitre: selectedNode.info.maitre._data
      };
    }
  }

  static async itemDetailInputOutput(selectedNode) {

    var tab = new Object();
    var idx = "";
    tab.NetworkValue = [];
    tab.AnalogValue = [];
    tab.BinaryValue = [];
    tab.MultiStateValue = [];
    tab.others = [];
    var tempTab = tab;
    var parent1 = await SpinalGraphService.getParents(selectedNode.id, "hasItem");
    var nodeParent1 = await SpinalGraphService.getNodeAsync(parent1[0].id._data);
    var parent2 = await SpinalGraphService.getParents(nodeParent1.id, "hasItemList");
    var nodeParent2 = await SpinalGraphService.getNodeAsync(parent2[0].id._data);
    var child = await SpinalGraphService.getChildren(nodeParent2.id, "hasBacnetValues");
    var childIds = child[0].childrenIds;

    for (var elt in childIds) {
      var valueNode = await SpinalGraphService.getNodeAsync(childIds[elt]);
      var title = "undefined";
      switch (valueNode.type._data) {
        case 'networkValue':
          tempTab = tab.NetworkValue;
          title = "NV_";
          break;
        case 'analogValue':
          tempTab = tab.AnalogValue;
          title = "AV_";
          break;
        case 'binaryValue':
          tempTab = tab.BinaryValue;
          title = "BV_";
          break;
        case 'multiStateValue':
          tempTab = tab.MultiStateValue;
          title = "MSV_";
          break;
        default:
          tempTab = tab.others;
          title = "undefined_";
          break;
      }
      var valueNodeIds = valueNode.childrenIds;
      for (var elt2 in valueNodeIds) {
        var finalNode = await SpinalGraphService.getNodeAsync(valueNodeIds[elt2]);
        if(finalNode.name != undefined){
          idx = parseInt(finalNode.IDX._data);
          tempTab.push({
            title: title + (idx + 1),
            name: finalNode.name._data,
            idx: idx,
            nodeId: valueNodeIds[elt2]
        });
        }
        
      }
    }

    return tab;
  }

  static async modifyConventionAndMasterInfos(parentId,namingConvention, master){

    var node = await SpinalGraphService.getRealNode(parentId);
    node.info.namingConvention.set(namingConvention);
    node.info.maitre.set(master);
  }

  static async addSelectedInputOutput(parentId, selectedInputTab, selectedOutputTab) {
    return DeviceHelper.initialize()
      .then(async result => {



        var inputNode = await SpinalGraphService.getChildren(parentId, "hasInputs");
        const inputNodeId = inputNode[0].id._data;

        await DeviceHelper.clearLinks(inputNodeId, "hasInput", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in selectedInputTab) {
          await SpinalGraphService.addChildInContext(inputNodeId, selectedInputTab[elt].nodeId, DeviceHelper.contextId, "hasInput", SPINAL_RELATION_PTR_LST_TYPE);
        }

        var outputNode = await SpinalGraphService.getChildren(parentId, "hasOutputs");
        const outputNodeId= outputNode[0].id._data;

        await DeviceHelper.clearLinks(outputNodeId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in selectedOutputTab) {
          await SpinalGraphService.addChildInContext(outputNodeId, selectedOutputTab[elt].nodeId, DeviceHelper.contextId, "hasOutput",SPINAL_RELATION_PTR_LST_TYPE);
        }

      })
      .catch(err => console.log(err));
  }

  static async clearLinks(parentId, relationName, relationType){

     var realNode = SpinalGraphService.getRealNode(parentId);
  
    if( realNode.hasRelation(relationName, relationType)){ 
      const children = await realNode.getChildren(relationName);
      for(var elt in children){
        var realChildNode = SpinalGraphService.getRealNode(children[elt].info.id._data);
        await realNode.removeChild(realChildNode, relationName, relationType);
      }
        await realNode.removeRelation(relationName, relationType);
    }      
  }

}







_defineProperty(DeviceHelper, "initialized", null);

_defineProperty(DeviceHelper, "context", void 0);

_defineProperty(DeviceHelper, "contextName", void 0);

_defineProperty(DeviceHelper, "type", void 0);

_defineProperty(DeviceHelper, "contextId", void 0);

DeviceHelper.initialized = null;
DeviceHelper.contextName = "deviceProfileContext";
DeviceHelper.type = "deviceProfileContext";

export { DeviceHelper };