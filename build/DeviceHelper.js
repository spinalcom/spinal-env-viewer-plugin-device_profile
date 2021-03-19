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

const bacnet = require('bacstack');

import Axios from "axios";
import AttributeService from 'spinal-env-viewer-plugin-documentation-service';
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

  static async create_Attributes(parentNode, tab, categoryName){

        // console.log(tab);
        // changement ici
        // let parentNode = SpinalGraphService.getRealNode(parentId);
        // SpinalGraphService._addNode(parentNode);
        // fin changement

        let categoryAttributes = await AttributeService.addCategoryAttribute(parentNode, categoryName);
          for (let elt2 in tab){
            if(typeof tab[elt2] != "object"){
              AttributeService.addAttributeByCategory(parentNode, categoryAttributes, elt2, tab[elt2]);
            }
            else{

              await DeviceHelper.create_Attributes(parentNode, tab[elt2], elt2);
              /*let category = await AttributeService.addCategoryAttribute(parentNode, elt2);
              console.log(elt2);
              for (let elt3 in tab[elt2]){
                // console.log(tab[elt2]);
                // console.log(tab[elt2][elt3]);
                AttributeService.addAttributeByCategory(parentNode, category, elt3, tab[elt2][elt3]);
              }*/
            //  return await AttributeService.createAttribute(parentNode, tab[elt2], elt2);
              // tabName.push(elt2);
              // tabVal.push(tab[elt2]);
            }
          }
          // for(let elt3 in tabName){

          // }
          // return tab;


  }
  static async getAttributeByLabelAndCategory(parentId, categoryName, label){
    let parentNode = SpinalGraphService.getRealNode(parentId);
    SpinalGraphService._addNode(parentNode);

    let tab = await AttributeService.getAttributesByCategory(parentNode, categoryName);
    // console.log(tab);
    for (let elt in tab){
      if(tab[elt].label._data == label) return tab[elt].value._data;
    }
    console.log("no label for this category & node");
    return -1;
  }
  static async setAttributeByCategoryAndLabel(parentNode, value, categoryName, label){
    let tab = await AttributeService.getAttributesByCategory(parentNode, categoryName);
    
  }

  static async generateProfile(parentId, nodeName, /*nodeRealName,*/ nodeType, nodeIdx, relationName, relationType) {
    return DeviceHelper.initialize()
      .then(async result => {


        const generatedProfileId = SpinalGraphService.createNode({
          name: nodeName,
          // real_name: nodeRealName,
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
          type: "networkValues"
        }, undefined);
        var generatedProfileNode = await SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId,
          "hasNetworkValues", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in json) {
          // console.log(json[elt].Target);

          // opérateur ternaire utilisé dans generateprofile
          var networkValueNode = await DeviceHelper.generateProfile(generatedProfileId, ( (json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME ) , "networkValue",
            json[elt].IDX, "hasNetworkValue", SPINAL_RELATION_PTR_LST_TYPE);

          // var networkValueNode = await DeviceHelper.generateProfile(generatedProfileId, "NV_" + (parseInt(json[elt].IDX) + 1) , ( (json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME ), "networkValue",
          //   json[elt].IDX, "hasNetworkValue", SPINAL_RELATION_PTR_LST_TYPE);

          //   await DeviceHelper.create_Attributes(networkValueNode, {
          //   generic_name: "NV_" + (parseInt(json[elt].IDX) + 1),
          //   name: ( (json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME ),
          //   idx: json[elt].IDX,
          //   type: "networkValue"
          // }, "default");
          // console.log(json[elt]);
          DeviceHelper.create_Attributes(networkValueNode, json[elt], "default");
          // await DeviceHelper.create_Attributes(networkValueNode, json[elt].Target, "Target");
          

          // for (let test in json[elt]) console.log(json[elt].test);

          // networkValueNode.AttributeService.removeAttributesByLabel("default", "Target");
          

          // console.log(attributeNode);

          // networkValueNode.add_attr({
          //   generic_name: "NV_" + (parseInt(json[elt].IDX) + 1),
          //   name: json[elt].NAME,
          //   idx: json[elt].IDX,
          //   type: "networkValue"
          // });
          // console.log(networkValueNode);
        }



      }).catch(err => console.log(err));
  }

  static async generateBinaryValue(parentId, json) {
    return DeviceHelper.initialize()
      .then(async result => {

        const generatedProfileId = SpinalGraphService.createNode({
          name: "Binary Values",
          type: "binaryValues"
        }, undefined);
        var generatedProfileNode = await SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId,
          "hasBinaryValues", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in json) {
          var binaryValueNode = await DeviceHelper.generateProfile(generatedProfileId, ( (json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME ), "binaryValue",
            json[elt].IDX, "hasBinaryValue", SPINAL_RELATION_PTR_LST_TYPE);

            DeviceHelper.create_Attributes(binaryValueNode, json[elt], "default");


            // await DeviceHelper.create_Attributes(binaryValueNode, {
            //   generic_name: "BV_" + (parseInt(json[elt].IDX) + 1),
            //   name: ( (json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME ),
            //   idx: json[elt].IDX,
            //   type: "binaryValue"
            // }, "default");

          // binaryValueNode.add_attr({
          //   generic_name: "BV_" + (parseInt(json[elt].IDX) + 1),
          //   name: json[elt].NAME,
          //   idx: json[elt].IDX,
          //   type: "binaryValue"
          // });
          // console.log(binaryValueNode);
        }
      }).catch(err => console.log(err));
  }

  static async generateAnalogValue(parentId, json) {
    return DeviceHelper.initialize()
      .then(async result => {

        const generatedProfileId = SpinalGraphService.createNode({
          name: "Analog Values",
          type: "analogValues"
        }, undefined);
        var generatedProfileNode = await SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId,
          "hasAnalogValues", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in json) {
          var analogValueNode = await DeviceHelper.generateProfile(generatedProfileId, ( (json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME ), "analogValue",
            json[elt].IDX, "hasAnalogValue", SPINAL_RELATION_PTR_LST_TYPE);

          DeviceHelper.create_Attributes(analogValueNode, json[elt], "default");


            // await DeviceHelper.create_Attributes(analogValueNode, {
            //   generic_name: "AV_" + (parseInt(json[elt].IDX) + 1),
            //   name: ( (json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME ),
            //   idx: json[elt].IDX,
            //   type: "analogValue"
            // }, "default");

          // analogValueNode.add_attr({
          //   generic_name: "AV_" + (parseInt(json[elt].IDX) + 1),
          //   name: json[elt].NAME,
          //   idx: json[elt].IDX,
          //   type: "analogValue"
          // });

          // console.log(analogValueNode);
        }
      }).catch(err => console.log(err));
  }

  static async generateMSValue(parentId, json) {
    return DeviceHelper.initialize()
      .then(async result => {

        const generatedProfileId = SpinalGraphService.createNode({
          name: "Multi-State Value",
          type: "multiStateValues"
        }, undefined);
        var generatedProfileNode = await SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId,
          "hasMultiStateValues", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in json) {
          var MSValueNode = await DeviceHelper.generateProfile(generatedProfileId, ( (json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME ), "multiStateValue",
            json[elt].IDX, "hasMultiStateValue", SPINAL_RELATION_PTR_LST_TYPE);
          
          DeviceHelper.create_Attributes(MSValueNode, json[elt], "default");

            // await DeviceHelper.create_Attributes(MSValueNode, {
            //   generic_name: "MSV_" + (parseInt(json[elt].IDX) + 1),
            //   name: ( (json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME ),
            //   idx: json[elt].IDX,
            //   type: "multiStateValue"
            // }, "default");

          // MSValueNode.add_attr({
          //   generic_name: "MSV_" + (parseInt(json[elt].IDX) + 1),
          //   name: json[elt].NAME,
          //   idx: json[elt].IDX,
          //   type: "multiStateValue"
          // });

          // console.log(MSValueNode);
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

    const blobDataToExport = new Blob([JSON.stringify(item_list)], { type: ".json" });
    console.log("blob");
    console.log(blobDataToExport);

    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blobDataToExport);
    link.download = "item_list.json";
    link.click();
    link.remove()
    



  }

  static async exportJSONItemList(nodeId){

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

    const blobDataToExport = new Blob([JSON.stringify(item_list)], { type: ".json" });

    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blobDataToExport);
    link.download = "item_list.json";
    link.click();
    link.remove()
    



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
    // console.log(node);
    var children = await node.childrenIds;
    
    for (var elt in children) {
      var childNode = await SpinalGraphService.getNodeAsync(children[elt]);
      if(childNode.type._data == "item"){
        let maitreInfos = await DeviceHelper.getAttributeByLabelAndCategory(children[elt], "default", "maitre");
        let namingConventionInfos = await DeviceHelper.getAttributeByLabelAndCategory(children[elt], "default", "namingConvention");
        //changement ici
        tab2.push({
                name: childNode.name._data,
                // maitre: childNode.maitre._data,
                maitre: maitreInfos,
                itemType: childNode.itemType._data,
                // namingConvention: childNode.namingConvention._data,
                namingConvention: namingConventionInfos,
                nodeId: children[elt]
              });
      }
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
        let itemNode = await SpinalGraphService.addChildInContext(parentId, generatedItemId, DeviceHelper.contextId,
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
          let outputsNode = await SpinalGraphService.addChildInContext(generatedItemId, outputNodeId, DeviceHelper.contextId, "hasOutputs", SPINAL_RELATION_PTR_LST_TYPE);
          // Shared Attributes that say the linked bacnetValues are monitored
          // await DeviceHelper.create_Attributes(outputsNode, { monitoring : true}, "Monitoring");
          // add item attributes

          DeviceHelper.create_Attributes(itemNode, { maitre: isMaitre, namingConvention: namingConvention}, "default");
          // create returned object
        var returnedObject = {
          name: nodeName,
          maitre: isMaitre,
          itemType: itemType,
          namingConvention: namingConvention,
          nodeId: generatedItemId
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
    // console.log(inputTab);
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
    // let tab = await AttributeService.getAttributesByCategory(selectedNode, "default");
    // console.log("tab : ", tab);
    // for (let elt in tab){

    // }

    
    let maitreInfos = await DeviceHelper.getAttributeByLabelAndCategory(selectedNode.id._data, "default", "maitre");
    let namingConventionInfos = await DeviceHelper.getAttributeByLabelAndCategory(selectedNode.id._data, "default", "namingConvention");

    let attributeNode = await SpinalGraphService.getChildren(selectedNode.id._data, "hasCategoryAttributes");
    console.log(attributeNode);

    return {
      namingConvention: namingConventionInfos,
      maitre: maitreInfos
    };

    // if(selectedNode.info == undefined){
    //   return {
    //     namingConvention: selectedNode.namingConvention._data,
    //     maitre: selectedNode.maitre._data
    //   };
    // }
    // else{
    //   return {
    //     namingConvention: selectedNode.info.namingConvention._data,
    //     maitre: selectedNode.info.maitre._data
    //   };
    // }
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
    console.log(childIds);

    for (var elt in childIds) {
      var valueNode = await SpinalGraphService.getNodeAsync(childIds[elt]);
      console.log(valueNode);
      var title = "undefined";
      switch (valueNode.type._data) {
        case 'networkValues':
          tempTab = tab.NetworkValue;
          title = "NV_";
          break;
        case 'analogValues':
          tempTab = tab.AnalogValue;
          title = "AV_";
          break;
        case 'binaryValues':
          tempTab = tab.BinaryValue;
          title = "BV_";
          break;
        case 'multiStateValues':
          tempTab = tab.MultiStateValue;
          title = "MSV_";
          break;
        default:
          console.log("default");
          console.log(valueNode.type._data);
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
    console.log(tab);

    return tab;
  }

  static async modifyConventionAndMasterInfos(parentId,namingConvention, master){

    var node = SpinalGraphService.getRealNode(parentId);
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
    let realNode = SpinalGraphService.getRealNode(parentId);
    SpinalGraphService._addNode(realNode);
  
    if( realNode.hasRelation(relationName, relationType)){ 
      const children = await realNode.getChildren(relationName);
      for(var elt in children){
        let realChildNode = children[elt];
        await realNode.removeChild(realChildNode, relationName, relationType);
      }
        await realNode.removeRelation(relationName, relationType);
    }      
  }

  static async generateTempTab(parentId, tab) {
    return DeviceHelper.initialize()
      .then(async result => {

        // add item node
        const generatedNodeId = SpinalGraphService.createNode({
          tab: tab,
          type: "tempTab",
        }, undefined);
        await SpinalGraphService.addChildInContext(parentId, generatedNodeId, DeviceHelper.contextId,
          "hasTempTab", SPINAL_RELATION_PTR_LST_TYPE);

      })
  }

  static async generateItemFromBOG(parentId, tab){
    return DeviceHelper.initialize()
      .then(async result => {
        let returnedTab = [];
        // console.log(tab);

    // get bacnetValues node
    let item_listNode = (await SpinalGraphService.getParents(parentId, "hasItemList"))[0];
    let bacnetValuesNode = (await SpinalGraphService.getChildren(item_listNode.id._data, "hasBacnetValues"))[0];
    let networkValuesNode = (await SpinalGraphService.getChildren(bacnetValuesNode.id._data, "hasNetworkValues"))[0];
    let analogValuesNode = (await SpinalGraphService.getChildren(bacnetValuesNode.id._data, "hasAnalogValues"))[0];
    let binaryValuesNode = (await SpinalGraphService.getChildren(bacnetValuesNode.id._data, "hasBinaryValues"))[0];
    let multiStateValuesNode = (await SpinalGraphService.getChildren(bacnetValuesNode.id._data, "hasMultiStateValues"))[0];

    let lengthOfTab = tab.length;
    let parentNode = SpinalGraphService.getRealNode(parentId);
    // console.log(parentNode);

    for (let elt = 0; elt < lengthOfTab ; elt++){
      let linksLength = tab[elt].links.length;
      let tabLinks = tab[elt].links;

      let item_name = tab[elt].name._data;
      let item_type;
      let prefix = item_name.split('_')[0];
      if(prefix == "FC"){
        item_type = "Fan Coil";
      }
      else if(prefix == "L"){
        item_type = "Lamp";
      }
      else if(prefix == "B"){
        item_type = "Blind";
      }
      else if(prefix == "WC"){
        item_type = "Windows Contact";
      }
      else if(prefix == "Device"){
        item_type = "Device";
      }
      else if(prefix == "RC"){
        item_type = "Remote Controller";
      }
      else if(prefix == "L"){
        item_type = "Lamp";
      }
      else{
        item_type = "inconnu";
      }
      
      // choix du type d'item

      // tant que l'on ne sait pas ce qu'est CG => exception à la génération
      if(prefix != "CG" && item_type != "inconnu"){

      // add item node
      const itemId = SpinalGraphService.createNode({
        name: item_name,
         maitre: false,
        itemType: item_type,
        namingConvention: item_name,
        type: "item",
      }, undefined);
      const nodeCreated = await SpinalGraphService.addChildInContext(parentId, itemId, DeviceHelper.contextId,
        "hasItem", SPINAL_RELATION_PTR_LST_TYPE);

        // add item attributes
      
        DeviceHelper.create_Attributes(nodeCreated, { maitre: false, namingConvention: item_name}, "default");

        returnedTab.push({
          name: item_name,
          maitre: false,
          itemType: item_type,
          namingConvention: item_name,
          nodeId: itemId
        });

        // add inputs node
        const inputsId = SpinalGraphService.createNode({
          name: "Inputs",
          type: "input"
        }, undefined)
        let inputsNode = await SpinalGraphService.addChildInContext(itemId, inputsId, DeviceHelper.contextId, "hasInputs", SPINAL_RELATION_PTR_LST_TYPE);
        // Shared Attribute to say that the linked bacnetVlaues are Monitored
        // await DeviceHelper.create_Attributes(inputsNode, { monitoring : true}, "Monitoring");

        // add outputs node
        const outputsId = SpinalGraphService.createNode({
          name: "Outputs",
          type: "output"
        }, undefined)
        let outputsNode = await SpinalGraphService.addChildInContext(itemId, outputsId, DeviceHelper.contextId, "hasOutputs", SPINAL_RELATION_PTR_LST_TYPE);
        // Shared Attribute to say that the linked bacnetVlaues are Monitored
        // await DeviceHelper.create_Attributes(outputsNode, { monitoring : true}, "Monitoring");
        
        // generate links
        for (let linkElt = 0 ; linkElt < linksLength; linkElt++){
          
            //input nv link
          if(tabLinks[linkElt].type._data == "nv"){
            let idsToLink = networkValuesNode.childrenIds;
            let suiteAdded = parseInt(tabLinks[linkElt].suite._data);
            for (let id in idsToLink){
              let nodeToCheck = await SpinalGraphService.getNodeAsync(idsToLink[id]);
              if(suiteAdded == 0){
                if(parseInt(nodeToCheck.IDX._data) + 1 == tabLinks[linkElt].idx._data){
                  await SpinalGraphService.addChildInContext(inputsId, idsToLink[id], DeviceHelper.contextId, "hasInput", SPINAL_RELATION_PTR_LST_TYPE);
                  // monitoring
                  // let nodeMonitored = SpinalGraphService.getRealNode(idsToLink[id]);
                  // await DeviceHelper.create_Attributes(nodeMonitored, { monitoring : true}, "Monitoring");
                }
              }
              else{
                if(((parseInt(nodeToCheck.IDX._data) + 1) >= tabLinks[linkElt].idx._data) && ((parseInt(nodeToCheck.IDX._data) + 1) < parseInt(tabLinks[linkElt].idx._data) + suiteAdded)){
                  await SpinalGraphService.addChildInContext(inputsId, idsToLink[id], DeviceHelper.contextId, "hasInput", SPINAL_RELATION_PTR_LST_TYPE);
                  // monitoring
                  // let nodeMonitored = SpinalGraphService.getRealNode(idsToLink[id]);
                  // await DeviceHelper.create_Attributes(nodeMonitored, { monitoring : true}, "Monitoring");
                }
              }
            }
          }
          // output av link
          else if(tab[elt].links[linkElt].type == "av"){
            let idsToLink = analogValuesNode.childrenIds;
            let suiteAdded = parseInt(tabLinks[linkElt].suite._data);
            for (let id in idsToLink){
              let nodeToCheck = await SpinalGraphService.getNodeAsync(idsToLink[id]);
              if(suiteAdded == 0){
                if(parseInt(nodeToCheck.IDX._data) + 1 == tabLinks[linkElt].idx._data){
                  await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                }
              }
              else{
                if(((parseInt(nodeToCheck.IDX._data) + 1) >= tabLinks[linkElt].idx._data) && ((parseInt(nodeToCheck.IDX._data) + 1) < parseInt(tabLinks[linkElt].idx._data) + suiteAdded)){
                  await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                }
              }
            }
          }
          // output bv link
          else if(tab[elt].links[linkElt].type == "bv"){
            let idsToLink = binaryValuesNode.childrenIds;
            let suiteAdded = parseInt(tabLinks[linkElt].suite._data);
            for (let id in idsToLink){
              let nodeToCheck = await SpinalGraphService.getNodeAsync(idsToLink[id]);
              if(suiteAdded == 0){
                if(parseInt(nodeToCheck.IDX._data) + 1 == tabLinks[linkElt].idx._data){
                  await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                }
              }
              else{
                if(((parseInt(nodeToCheck.IDX._data) + 1) >= tabLinks[linkElt].idx._data) && ((parseInt(nodeToCheck.IDX._data) + 1) < parseInt(tabLinks[linkElt].idx._data) + suiteAdded)){
                  await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                }
              }
            }
          }
          // output mv link
          else if(tab[elt].links[linkElt].type == "mv"){
            let idsToLink = multiStateValuesNode.childrenIds;
            let suiteAdded = parseInt(tabLinks[linkElt].suite._data);
            for (let id in idsToLink){
              let nodeToCheck = await SpinalGraphService.getNodeAsync(idsToLink[id]);
              if(suiteAdded == 0){
                if(parseInt(nodeToCheck.IDX._data) + 1 == tabLinks[linkElt].idx._data){
                  await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                }
              }
              else{
                if(((parseInt(nodeToCheck.IDX._data) + 1) >= tabLinks[linkElt].idx._data) && ((parseInt(nodeToCheck.IDX._data) + 1) < parseInt(tabLinks[linkElt].idx._data) + suiteAdded)){
                  await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                }
              }
            }
          }
          else{
            console.log("error link");
          }

          }
          
        }

    }
    
      return returnedTab;
  })

  }

  static async clearItems(parentId){
    let realNode = SpinalGraphService.getRealNode(parentId);
    SpinalGraphService._addNode(realNode);

    if(realNode.hasRelation("hasItem", SPINAL_RELATION_PTR_LST_TYPE)){
      let itemNodes = await realNode.getChildren("hasItem");
      // console.log(itemNodes);
      for(let item in itemNodes){
        // console.log(itemNodes[item]);
        if(itemNodes[item].hasRelation("hasInputs", SPINAL_RELATION_PTR_LST_TYPE)){
          let inputsNode = (await itemNodes[item].getChildren("hasInputs"))[0];
          SpinalGraphService._addNode(inputsNode);

          if(inputsNode.hasRelation("hasInput", SPINAL_RELATION_PTR_LST_TYPE)){
            await DeviceHelper.clearLinks(inputsNode.info.id.get(), "hasInput", SPINAL_RELATION_PTR_LST_TYPE);
            await DeviceHelper.clearLinks(itemNodes[item].info.id.get(), "hasInputs", SPINAL_RELATION_PTR_LST_TYPE);
          }
          else{
            await DeviceHelper.clearLinks(itemNodes[item].info.id.get(), "hasInputs", SPINAL_RELATION_PTR_LST_TYPE);
          }

        }
        if(itemNodes[item].hasRelation("hasOutputs", SPINAL_RELATION_PTR_LST_TYPE)){
          let outputsNode = (await itemNodes[item].getChildren("hasOutputs"))[0];
          SpinalGraphService._addNode(outputsNode);
          // console.log(outputsNode);
          // console.log(outputsNode.hasRelation("hasOutput", SPINAL_RELATION_PTR_LST_TYPE));
          // console.log(itemNodes[item].info.id.get());

          if(outputsNode.hasRelation("hasOutput", SPINAL_RELATION_PTR_LST_TYPE)){
            await DeviceHelper.clearLinks(outputsNode.info.id.get(), "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
            await DeviceHelper.clearLinks(itemNodes[item].info.id.get(), "hasOutputs", SPINAL_RELATION_PTR_LST_TYPE);
          }
          else{
            await DeviceHelper.clearLinks(itemNodes[item].info.id.get(), "hasOutputs", SPINAL_RELATION_PTR_LST_TYPE);
          }

        }
      }
      await DeviceHelper.clearLinks(realNode.info.id.get(), "hasItem", SPINAL_RELATION_PTR_LST_TYPE);

    }


  }

  ////////////////////////// SCAN DU RESEAU IP
  /////////////////////////////////////////////

  static async scanNetwork(){



// Initialize BACStack
const client = new bacnet({adpuTimeout: 6000});

// Discover Devices
client.on('iAm', (device) => {
  console.log('address: ', device.address);
  console.log('deviceId: ', device.deviceId);
  console.log('maxAdpu: ', device.maxAdpu);
  console.log('segmentation: ', device.segmentation);
  console.log('vendorId: ', device.vendorId);
});
client.whoIs();

// Read Device Object
const requestArray = [{
  objectId: {type: 8, instance: 4194303},
  properties: [{id: 8}]
}];
client.readPropertyMultiple('192.168.1.43', requestArray, (err, value) => {
  console.log('value: ', value);
});

  }

  /////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////// MONITORING CONFIGURATION /////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////

  static async generateMonitoringGraph(parentId){
    return DeviceHelper.initialize()
      .then(async result => {
        // add Monitoring node : child of device
        const monitoringNodeId = SpinalGraphService.createNode({
          name: "Monitoring",
          type: "deviceMonitoring"
        }, undefined);
        // let monitoringNode = await SpinalGraphService.addChildInContext(parentId, monitoringNodeId, DeviceHelper.contextId, "hasMonitoringNode", SPINAL_RELATION_PTR_LST_TYPE);
        await SpinalGraphService.addChildInContext(parentId, monitoringNodeId, DeviceHelper.contextId, "hasMonitoringNode", SPINAL_RELATION_PTR_LST_TYPE);

        ///////// add basic Interval Times

        // add COV IntervalTime
        const intervalTimeCOVNodeId = SpinalGraphService.createNode({
          name: "COV",
          type: "deviceMonitoringIntervalTime"
        }, undefined);
        let intervalTimeCOVNode = await SpinalGraphService.addChildInContext(monitoringNodeId, intervalTimeCOVNodeId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
        await DeviceHelper.create_Attributes(intervalTimeCOVNode, { Monitoring: true, IntervalTime: "COV" }, "Monitoring");

        // add 5s IntervalTime
        const intervalTime5000NodeId = SpinalGraphService.createNode({
          name: "5s",
          type: "deviceMonitoringIntervalTime"
        }, undefined);
        let intervalTime5000Node = await SpinalGraphService.addChildInContext(monitoringNodeId, intervalTime5000NodeId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
        await DeviceHelper.create_Attributes(intervalTime5000Node, { Monitoring: true, IntervalTime: 5000 }, "Monitoring");


      })
      .catch(err => console.log(err));
  }

  static async getLinkedOutputBacnetValues_FromMonitoringNodeId(parentId){
    let itemsIdTab = await this.getItemsId_FromMonitoringNodeId(parentId);
    let AVBVMSV_Idstab = await this.getListOutputByItem(itemsIdTab);
    let serializedTab = await this.getSerializedTabByItem(AVBVMSV_Idstab);
    // console.log(AVBVMSV_Idstab);

    return serializedTab;

  }
  static async getLinkedOutputBacnetValues_FromItemId(parentId){
    let tab = [];
    tab[0] = parentId;
    let AVBVMSV_Idstab = await this.getListOutputByItem(tab);
    let serializedTab = await this.getSerializedTabByItem(AVBVMSV_Idstab);
    // console.log(AVBVMSV_Idstab);

    return serializedTab;
  }

  static async getItemsId_FromMonitoringNodeId(parentId){
    let tab = [];
    let deviceProfileNode = (await SpinalGraphService.getParents(parentId, "hasMonitoringNode"))[0];
    let itemListNode = (await SpinalGraphService.getChildren(deviceProfileNode.id.get(), "hasItemList"))[0];
    let itemsNode = (await SpinalGraphService.getChildren(itemListNode.id.get(), "hasItem"));
    for (let elt in itemsNode){
      tab.push(itemsNode[elt].id.get());
    }
    return tab;
  }

  static async getListOutputByItem(tab){
    let AVBVMSV_Idstab = [];

    for(let elt in tab){
      let realNode = SpinalGraphService.getRealNode(tab[elt]);
      // console.log(realNode.info.name.get());
      let outputsNode = (await SpinalGraphService.getChildren(tab[elt], "hasOutputs"))[0];
      let outputBacnetValuesNode = await SpinalGraphService.getChildren(outputsNode.id.get(), "hasOutput");
      if(outputBacnetValuesNode.length !=0){
        let outputTab = []
        for(let value in outputBacnetValuesNode){
          outputTab.push(outputBacnetValuesNode[value].id.get());
        }
        AVBVMSV_Idstab.push({
          item_name: realNode.info.name.get(),
          outputs : outputTab
        });
      }
      
    }
    return AVBVMSV_Idstab;

  }

  static async getSerializedTabByItem(tab){
    let serializedTab = [];
    for (let elt in tab){
      let outputsId = tab[elt].outputs;
      for(let id in outputsId){
        let intervalTime = "null";
        // console.log(outputsId[id]);
        let realNode = SpinalGraphService.getRealNode(outputsId[id]);
        let intervalTimeNodes = (await SpinalGraphService.getParents(outputsId[id], "hasIntervalTime"));
        console.log(intervalTimeNodes);
        if(intervalTimeNodes.length != 0 ){
          let intervalTimeNode = intervalTimeNodes[0];
          intervalTime = await this.getAttributeByLabelAndCategory(intervalTimeNode.id._data, "Monitoring", "IntervalTime");
        }
        // let tab2 = await AttributeService.getAllAttributes(realNode);
        let name = await this.getAttributeByLabelAndCategory(outputsId[id], "default", "NAME");
        // console.log(name);
        let idx = await this.getAttributeByLabelAndCategory(outputsId[id], "default", "IDX");
        // console.log(idx);
        let type = realNode.info.type.get();
        let title = "undefined_";
        // console.log(type);
        switch(type){
          case "analogValue":
            title = "AV_";
            break;
          case "binaryValue":
            title = "BV_";
            break;
          case "multiStateValue":
            title = "MSV_";
            break;
        }
        let generic_name = title + (parseInt(idx) + 1);
        // console.log(generic_name);

        serializedTab.push({
          generic_name: generic_name,
          name: name,
          item_name: tab[elt].item_name,
          nodeId: realNode.info.id.get(),
          intervalTime: intervalTime
        });
        // (parseInt(json[elt].IDX) + 1),
      }
      // console.log(outputsId);
    }
    return serializedTab;
  }

  static async getIntervalTimeList(parentId){
    let returnTab = [];
    let intervalTimeNodeTab = await SpinalGraphService.getChildren(parentId, "hasIntervalTimeNode");
    for(let elt in intervalTimeNodeTab){
      let intervalTime = await this.getAttributeByLabelAndCategory(intervalTimeNodeTab[elt].id.get(), "Monitoring", "IntervalTime");
      console.log(intervalTime);
      returnTab.push({value: intervalTime, nodeId: intervalTimeNodeTab[elt].id.get()});
    }
    return returnTab;


  }

  static async addIntervalTimeNode(monitoringNodeId, newIntervalTime){
    return DeviceHelper.initialize()
      .then(async result => {

        const newIntervalTimeNodeId = SpinalGraphService.createNode({
          name: newIntervalTime,
          type: "deviceMonitoringIntervalTime"
        }, undefined);
        let newIntervalTimeNode = await SpinalGraphService.addChildInContext(monitoringNodeId, newIntervalTimeNodeId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
        await DeviceHelper.create_Attributes(newIntervalTimeNode, { Monitoring: true, IntervalTime: parseInt(newIntervalTime) }, "Monitoring");

        let returnTab = {value: parseInt(newIntervalTime), nodeId: newIntervalTimeNodeId}
        return returnTab;

      })
      .catch(err => console.log(err));
  }

  static async clearMonitoringLinks(intervalTimeList){
    for(let elt in intervalTimeList){
      await DeviceHelper.clearLinks(intervalTimeList[elt].nodeId, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
    }
  }

  static async generateMonitoringLinks(tab, intervalTimeList){
    await DeviceHelper.clearMonitoringLinks(intervalTimeList);
    return DeviceHelper.initialize().then(() => {
      // console.log(tab, intervalTimeList);
      for(let elt in tab){
        for(let elt2 in intervalTimeList){
          if(tab[elt].intervalTime == intervalTimeList[elt2].value){
            SpinalGraphService.addChildInContext(intervalTimeList[elt2].nodeId, tab[elt].nodeId, DeviceHelper.contextId, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
            // console.log("ok", intervalTimeList[elt2].value);
          }
        }
      }
    })
    .catch(err => console.log(err));
}
  

}

// return DeviceHelper.initialize()
//       .then(async result => {})
//       .catch(err => console.log(err));





_defineProperty(DeviceHelper, "initialized", null);

_defineProperty(DeviceHelper, "context", void 0);

_defineProperty(DeviceHelper, "contextName", void 0);

_defineProperty(DeviceHelper, "type", void 0);

_defineProperty(DeviceHelper, "contextId", void 0);

DeviceHelper.initialized = null;
DeviceHelper.contextName = "deviceProfileContext";
DeviceHelper.type = "deviceProfileContext";

export { DeviceHelper };