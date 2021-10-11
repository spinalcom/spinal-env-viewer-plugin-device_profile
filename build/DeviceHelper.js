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

// const bacnet = require('bacstack');
const { FileSystem } = require('spinal-core-connectorjs_type');

import Axios from "axios";
import AttributeService from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalContext, SpinalGraphService, SpinalNode, SPINAL_RELATION_LST_PTR_TYPE, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
import { PART_RELATION_NAME, PART_RELATION_TYPE, DEVICE_RELATION_NAME, DEVICE_RELATION_TYPE, DEVICE_TYPE, DEVICE_PROFILES_TYPE } from "../constants";
import {spinalEventEmitter} from "spinal-env-viewer-plugin-event-emitter";



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

  static async create_Attributes(parentNode, tab, categoryName) {

    let categoryAttributes = await AttributeService.addCategoryAttribute(parentNode, categoryName);
    for (let elt2 in tab) {
      if (typeof tab[elt2] != "object") {
        AttributeService.addAttributeByCategory(parentNode, categoryAttributes, elt2, tab[elt2]);
      }
      else {

        await DeviceHelper.create_Attributes(parentNode, tab[elt2], elt2);

      }
    }
  }

  static async getAttributeByLabelAndCategory(parentId, categoryName, label) {

    let parentNode = SpinalGraphService.getRealNode(parentId);
    SpinalGraphService._addNode(parentNode);

    let tab = await AttributeService.getAttributesByCategory(parentNode, categoryName);
    for (let elt in tab) {
      if (tab[elt].label._data == label) return tab[elt].value._data;
    }
    console.log("no label for this category & node");
    return -1;
  }

  static async setAttributeByCategoryAndLabel(parentNode, value, categoryName, label) {
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

          // opérateur ternaire utilisé dans generateprofile
          var networkValueNode = await DeviceHelper.generateProfile(generatedProfileId, ((json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME), "networkValue",
            json[elt].IDX, "hasNetworkValue", SPINAL_RELATION_PTR_LST_TYPE);

          DeviceHelper.create_Attributes(networkValueNode, json[elt], "default");
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
          var binaryValueNode = await DeviceHelper.generateProfile(generatedProfileId, ((json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME), "binaryValue",
            json[elt].IDX, "hasBinaryValue", SPINAL_RELATION_PTR_LST_TYPE);

          DeviceHelper.create_Attributes(binaryValueNode, json[elt], "default");
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
          var analogValueNode = await DeviceHelper.generateProfile(generatedProfileId, ((json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME), "analogValue",
            json[elt].IDX, "hasAnalogValue", SPINAL_RELATION_PTR_LST_TYPE);

          DeviceHelper.create_Attributes(analogValueNode, json[elt], "default");

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
          var MSValueNode = await DeviceHelper.generateProfile(generatedProfileId, ((json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME), "multiStateValue",
            json[elt].IDX, "hasMultiStateValue", SPINAL_RELATION_PTR_LST_TYPE);

          DeviceHelper.create_Attributes(MSValueNode, json[elt], "default");
        }
      }).catch(err => console.log(err));
  }

  static async generateABMSInputOutputs(parentId, json){
    // Obligation d'utiliser plusieurs variables car le fichier xml de distech n'est pas rangé en "Analog/Binary/MS input/output mais par entrée/sorties logiques"
    let hardwareInput = json.Root.BacnetIPHardwareInputResource;
    let hardwareOutput = json.Root.BacnetIPHardwareOutputResource;
    let lightOutput = json.Root.BacnetIPLightOutputResource;
    let sunblindOutput = json.Root.BacnetIPSunblindOutputObjectResource;
    let smartSenseObject = json.Root.SmartSenseObjectResource;
    let lightAndSunblindInput = json.Root.BacnetIPLightAndSunblindModuleInputResource;
    let number =0;

    return this.initialize()
      .then(async result => {

        const generatedAnalogInputsId = SpinalGraphService.createNode({
          name: "Analog Input",
          type: "analogInputs"
        }, undefined);
        await SpinalGraphService.addChildInContext(parentId, generatedAnalogInputsId, this.contextId,
          "hasAnalogInputs", SPINAL_RELATION_PTR_LST_TYPE);

        const generatedBinaryInputsId = SpinalGraphService.createNode({
          name: "Binary Input",
          type: "binaryInputs"
        }, undefined);
        await SpinalGraphService.addChildInContext(parentId, generatedBinaryInputsId, this.contextId,
          "hasBinaryInputs", SPINAL_RELATION_PTR_LST_TYPE);

        const generatedAnalogOutputsId = SpinalGraphService.createNode({
          name: "Analog Output",
          type: "analogOutputs"
        }, undefined);
        await SpinalGraphService.addChildInContext(parentId, generatedAnalogOutputsId, this.contextId,
          "hasAnalogOutputs", SPINAL_RELATION_PTR_LST_TYPE);
        
        const generatedMultiStateInputsId = SpinalGraphService.createNode({
          name: "Multi State Input",
          type: "multiStateInputs"
        }, undefined);
        await SpinalGraphService.addChildInContext(parentId, generatedMultiStateInputsId, this.contextId,
          "hasMultiStateInputs", SPINAL_RELATION_PTR_LST_TYPE);

          // Parcours de la list des Hardware Inputs
        for(let hi in hardwareInput){
          // check sur le Maximum pour savoir si analog ou binary Input
          let type = (hardwareInput[hi].Maximum == "1" ? "binaryInput" : "analogInput");
          let nameOfBacnet = hardwareInput[hi].NAME == undefined ? "undefined Name" : hardwareInput[hi].NAME;
          const generatedHardwareInputId = SpinalGraphService.createNode({
            name: nameOfBacnet,
            type: type
          }, undefined);

          if(type == "analogInput"){
            let node = await SpinalGraphService.addChildInContext(generatedAnalogInputsId, generatedHardwareInputId, this.contextId,
              "hasAnalogInput", SPINAL_RELATION_PTR_LST_TYPE);
            await this.create_Attributes(node, hardwareInput[hi], "default");
          }
          else if(type == "binaryInput"){
            let node = await SpinalGraphService.addChildInContext(generatedBinaryInputsId, generatedHardwareInputId, this.contextId,
              "hasBinaryInput", SPINAL_RELATION_PTR_LST_TYPE);
             await this.create_Attributes(node, hardwareInput[hi], "default");
          }
          else{
            console.log("undefined type of BacnetValue");
          }

        }

        // Parcours de la liste des Hardware Outputs
        for(let ho in hardwareOutput){
          if(hardwareOutput[ho].NAME != undefined){
            const generatedHardwareOutputId = SpinalGraphService.createNode({
              name: hardwareOutput[ho].NAME,
              type: "analogOutput"
            }, undefined);
            let node = await SpinalGraphService.addChildInContext(generatedAnalogOutputsId, generatedHardwareOutputId, this.contextId,
              "hasAnalogOutput", SPINAL_RELATION_PTR_LST_TYPE);
            await this.create_Attributes(node, hardwareOutput[ho], "default");
          }
        }

        // Parcours de la iste des LightOutputs
        for(let li in lightOutput){
          if(lightOutput[li].NAME != undefined){
            const generatedLightOutputId = SpinalGraphService.createNode({
              name: lightOutput[li].NAME,
              type: "analogOutput"
            }, undefined);
            let node = await SpinalGraphService.addChildInContext(generatedAnalogOutputsId, generatedLightOutputId, this.contextId,
              "hasAnalogOutput", SPINAL_RELATION_PTR_LST_TYPE);
            await this.create_Attributes(node, lightOutput[li], "default");
          }
        }

        // Parcours de la liste des Sunblind Outputs
        for(let so in sunblindOutput){
          if(sunblindOutput[so].NAME != undefined){
            const generatedSunblindOutputId = SpinalGraphService.createNode({
              name: sunblindOutput[so].NAME,
              type: "analogOutput"
            }, undefined);
            let node = await SpinalGraphService.addChildInContext(generatedAnalogOutputsId, generatedSunblindOutputId, this.contextId,
              "hasAnalogOutput", SPINAL_RELATION_PTR_LST_TYPE);
            await this.create_Attributes(node, sunblindOutput[so], "default");
          }
        }

        // Parcours de la liste des smartSenseObject
        for(let sso in smartSenseObject){
          // on se base sur la valeur de InputType pour déterminer le type de BacnetValue
          let type = (smartSenseObject[sso].InputType == "3" ? "binaryInput" : "analogInput");
          if(smartSenseObject[sso].NAME != undefined){
            let nameOfBacnet = smartSenseObject[sso].NAME;
            const generatedSmartSenseObjectId = SpinalGraphService.createNode({
              name: nameOfBacnet,
              type: type
            }, undefined);

            if(type == "analogInput"){
              let node = await SpinalGraphService.addChildInContext(generatedAnalogInputsId, generatedSmartSenseObjectId, this.contextId,
                "hasAnalogInput", SPINAL_RELATION_PTR_LST_TYPE);
              await this.create_Attributes(node, smartSenseObject[sso], "default");
            }
            else if(type == "binaryInput"){
              let node = await SpinalGraphService.addChildInContext(generatedBinaryInputsId, generatedSmartSenseObjectId, this.contextId,
                "hasBinaryInput", SPINAL_RELATION_PTR_LST_TYPE);
              await this.create_Attributes(node, smartSenseObject[sso], "default");
            }
            else{
              console.log("undefined type of BacnetValue");
            }
            console.log(smartSenseObject[sso].NAME);
            console.log(type);
          }
        }

        // parcours de la liste des Light And Sunblinds Inputs
        for(let sbi in lightAndSunblindInput){

          if(lightAndSunblindInput[sbi].NAME != undefined){
            const generatedLightAndSunblindInputId = SpinalGraphService.createNode({
              name: lightAndSunblindInput[sbi].NAME,
              type: "multiStateinput"
            }, undefined);
            let node = await SpinalGraphService.addChildInContext(generatedMultiStateInputsId, generatedLightAndSunblindInputId, this.contextId,
              "hasMultiStateInput", SPINAL_RELATION_PTR_LST_TYPE);
            await this.create_Attributes(node, lightAndSunblindInput[sbi], "default");
          }

          console.log(lightAndSunblindInput[sbi].NAME, "multiStateInput");
          
        }

      }).catch(err => console.log(err));
  }

  static async generateABMSInputOutputs(parentId, json){
    // Obligation d'utiliser plusieurs variables car le fichier xml de distech n'est pas rangé en "Analog/Binary/MS input/output mais par entrée/sorties logiques"
    let hardwareInput = json.Root.BacnetIPHardwareInputResource;
    let hardwareOutput = json.Root.BacnetIPHardwareOutputResource;
    let lightOutput = json.Root.BacnetIPLightOutputResource;
    let sunblindOutput = json.Root.BacnetIPSunblindOutputObjectResource;
    let smartSenseObject = json.Root.SmartSenseObjectResource;
    let lightAndSunblindInput = json.Root.BacnetIPLightAndSunblindModuleInputResource;
    let number =0;

    return this.initialize()
      .then(async result => {

        const generatedAnalogInputsId = SpinalGraphService.createNode({
          name: "Analog Input",
          type: "analogInputs"
        }, undefined);
        await SpinalGraphService.addChildInContext(parentId, generatedAnalogInputsId, this.contextId,
          "hasAnalogInputs", SPINAL_RELATION_PTR_LST_TYPE);

        const generatedBinaryInputsId = SpinalGraphService.createNode({
          name: "Binary Input",
          type: "binaryInputs"
        }, undefined);
        await SpinalGraphService.addChildInContext(parentId, generatedBinaryInputsId, this.contextId,
          "hasBinaryInputs", SPINAL_RELATION_PTR_LST_TYPE);

        const generatedAnalogOutputsId = SpinalGraphService.createNode({
          name: "Analog Output",
          type: "analogOutputs"
        }, undefined);
        await SpinalGraphService.addChildInContext(parentId, generatedAnalogOutputsId, this.contextId,
          "hasAnalogOutputs", SPINAL_RELATION_PTR_LST_TYPE);
        
        const generatedMultiStateInputsId = SpinalGraphService.createNode({
          name: "Multi State Input",
          type: "multiStateInputs"
        }, undefined);
        await SpinalGraphService.addChildInContext(parentId, generatedMultiStateInputsId, this.contextId,
          "hasMultiStateInputs", SPINAL_RELATION_PTR_LST_TYPE);

          // Parcours de la list des Hardware Inputs
        for(let hi in hardwareInput){
          // check sur le Maximum pour savoir si analog ou binary Input
          let type = (hardwareInput[hi].Maximum == "1" ? "binaryInput" : "analogInput");
          let nameOfBacnet = hardwareInput[hi].NAME == undefined ? "undefined Name" : hardwareInput[hi].NAME;
          const generatedHardwareInputId = SpinalGraphService.createNode({
            name: nameOfBacnet,
            type: type
          }, undefined);

          if(type == "analogInput"){
            let node = await SpinalGraphService.addChildInContext(generatedAnalogInputsId, generatedHardwareInputId, this.contextId,
              "hasAnalogInput", SPINAL_RELATION_PTR_LST_TYPE);
            await this.create_Attributes(node, hardwareInput[hi], "default");
          }
          else if(type == "binaryInput"){
            let node = await SpinalGraphService.addChildInContext(generatedBinaryInputsId, generatedHardwareInputId, this.contextId,
              "hasBinaryInput", SPINAL_RELATION_PTR_LST_TYPE);
             await this.create_Attributes(node, hardwareInput[hi], "default");
          }
          else{
            console.log("undefined type of BacnetValue");
          }
          // console.log(hardwareInput[hi].NAME);
          // console.log(type);
        }

        // Parcours de la liste des Hardware Outputs
        for(let ho in hardwareOutput){
          if(hardwareOutput[ho].NAME != undefined){
            const generatedHardwareOutputId = SpinalGraphService.createNode({
              name: hardwareOutput[ho].NAME,
              type: "analogOutput"
            }, undefined);
            let node = await SpinalGraphService.addChildInContext(generatedAnalogOutputsId, generatedHardwareOutputId, this.contextId,
              "hasAnalogOutput", SPINAL_RELATION_PTR_LST_TYPE);
            await this.create_Attributes(node, hardwareOutput[ho], "default");
          }
        }

        // Parcours de la iste des LightOutputs
        for(let li in lightOutput){
          if(lightOutput[li].NAME != undefined){
            const generatedLightOutputId = SpinalGraphService.createNode({
              name: lightOutput[li].NAME,
              type: "analogOutput"
            }, undefined);
            let node = await SpinalGraphService.addChildInContext(generatedAnalogOutputsId, generatedLightOutputId, this.contextId,
              "hasAnalogOutput", SPINAL_RELATION_PTR_LST_TYPE);
            await this.create_Attributes(node, lightOutput[li], "default");
          }
        }

        // Parcours de la liste des Sunblind Outputs
        for(let so in sunblindOutput){
          if(sunblindOutput[so].NAME != undefined){
            const generatedSunblindOutputId = SpinalGraphService.createNode({
              name: sunblindOutput[so].NAME,
              type: "analogOutput"
            }, undefined);
            let node = await SpinalGraphService.addChildInContext(generatedAnalogOutputsId, generatedSunblindOutputId, this.contextId,
              "hasAnalogOutput", SPINAL_RELATION_PTR_LST_TYPE);
            await this.create_Attributes(node, sunblindOutput[so], "default");
          }
        }

        // Parcours de la liste des smartSenseObject
        for(let sso in smartSenseObject){
          // on se base sur la valeur de InputType pour déterminer le type de BacnetValue
          let type = (smartSenseObject[sso].InputType == "3" ? "binaryInput" : "analogInput");
          if(smartSenseObject[sso].NAME != undefined){
            let nameOfBacnet = smartSenseObject[sso].NAME;
            const generatedSmartSenseObjectId = SpinalGraphService.createNode({
              name: nameOfBacnet,
              type: type
            }, undefined);

            if(type == "analogInput"){
              let node = await SpinalGraphService.addChildInContext(generatedAnalogInputsId, generatedSmartSenseObjectId, this.contextId,
                "hasAnalogInput", SPINAL_RELATION_PTR_LST_TYPE);
              await this.create_Attributes(node, smartSenseObject[sso], "default");
            }
            else if(type == "binaryInput"){
              let node = await SpinalGraphService.addChildInContext(generatedBinaryInputsId, generatedSmartSenseObjectId, this.contextId,
                "hasBinaryInput", SPINAL_RELATION_PTR_LST_TYPE);
              await this.create_Attributes(node, smartSenseObject[sso], "default");
            }
            else{
              console.log("undefined type of BacnetValue");
            }
            console.log(smartSenseObject[sso].NAME);
            console.log(type);
          }
        }

        // parcours de la liste des Light And Sunblinds Inputs
        for(let sbi in lightAndSunblindInput){
          // if(lightAndSunblindInput[sbi].NAME != undefined){
          //   console.log(lightAndSunblindInput[sbi].NAME);
          //   let type = "multiStateInput";
          //   console.log(type);
          // }

          if(lightAndSunblindInput[sbi].NAME != undefined){
            const generatedLightAndSunblindInputId = SpinalGraphService.createNode({
              name: lightAndSunblindInput[sbi].NAME,
              type: "multiStateinput"
            }, undefined);
            let node = await SpinalGraphService.addChildInContext(generatedMultiStateInputsId, generatedLightAndSunblindInputId, this.contextId,
              "hasMultiStateInput", SPINAL_RELATION_PTR_LST_TYPE);
            await this.create_Attributes(node, lightAndSunblindInput[sbi], "default");
          }

          console.log(lightAndSunblindInput[sbi].NAME, "multiStateInput");
          
        }








        // const generatedProfileId = SpinalGraphService.createNode({
        //   name: "Multi-State Value",
        //   type: "multiStateValues"
        // }, undefined);
        // var generatedProfileNode = await SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId,
        //   "hasMultiStateValues", SPINAL_RELATION_PTR_LST_TYPE);

        // for (var elt in json) {
        //   var MSValueNode = await DeviceHelper.generateProfile(generatedProfileId, ((json[elt].NAME == undefined) ? "Unnamed" : json[elt].NAME), "multiStateValue",
        //     json[elt].IDX, "hasMultiStateValue", SPINAL_RELATION_PTR_LST_TYPE);

        //   DeviceHelper.create_Attributes(MSValueNode, json[elt], "default");
        // }
      }).catch(err => console.log(err));
    
    for(let n in lightAndSunblindInput){
      console.log(lightAndSunblindInput[n].NAME);
      number++;
    }
    console.log(number);
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
          await this.generateABMSInputOutputs(bacnetId, json);
        }).catch(err => console.log(err));

    }
    else {
      console.log("Création des BacnetValues déjà effectuée");
    }


  }



  // static async generateBacNetValuesFromDiscovery(deviceId, parentNodeId, parentContextId){
  //   // Get all children of the selected device on the panel
  //   const childModelTab = await SpinalGraphService.getChildren(deviceId,"hasBmsEndpointGroup");

  //   // Get all children nodes
  //   const childNodeTab = [];
  //   const childNodeTabId = [];
  //   // for (let i =0; i<childModelTab.length; i++){
  //   //   childNodeTab[i]= SpinalGraphService.getRealNode(childModelTab[i].id.get());
  //   // }
  //   for (let childModel of childModelTab){
  //     childNodeTab.push(SpinalGraphService.getRealNode(childModel.id.get()));
  //   }
  //   for (var childNode of childNodeTab){
  //     childNodeTabId.push(childNode.info.id.get());
  //   }

  //   // Get the parent node
  //   const parentNode = SpinalGraphService.getRealNode(parentNodeId);
    
  //   // generate bacnet values if there isn't
  //   const children = await parentNode.getChildren("hasBacnetValues");
  //   if (children.length == 0) {

  //     return DeviceHelper.initialize().then(async result => {

  //         const generatedBacnetValuesId = SpinalGraphService.createNode({
  //           name: "BacnetValues",
  //           type: "bacnetValues"
  //         }, undefined);

  //         const generatedBacnetValuesnode = await SpinalGraphService.addChildInContext(parentNodeId, generatedBacnetValuesId, parentContextId,
  //           "hasBacnetValues", SPINAL_RELATION_PTR_LST_TYPE);
          
  //         //const profilContext = SpinalGraphService.getContextWithType('deviceProfileContext');
  //         //console.log(profilContext)
          
  //         // for (let i =0; i<childNodeTab.length; i++){
  //         //   childNodeTabId[i]= childNodeTab[i].info.id.get();
  //         //   await SpinalGraphService.addChildInContext(generatedBacnetValuesnode.info.id.get(), childNodeTabId[i], parentContextId,
  //         //   childNodeTab[i].info.typeNetwork.get(), SPINAL_RELATION_PTR_LST_TYPE);
            
  //         //   //await childNodeTab[i].forEachInContext(profilContext[0], (_n) => _n.addContextId(generatedBacnetValuesnode.info.id.get()));
  //         // }

  //         for (let childNodeId of childNodeTabId){
  //           await SpinalGraphService.addChildInContext(generatedBacnetValuesnode.info.id.get(), childNodeId, parentContextId,
  //           childNode.info.typeNetwork.get(), SPINAL_RELATION_PTR_LST_TYPE);
  //         }
  //           //console.log(childNodeTabId);
          
  //       }).catch(err => console.log(err));

  //   }
  //   else {
  //     console.log("Création des BacnetValues déjà effectuée");
  //   }


  // }

  static async generateBacNetValuesFromDiscovery(deviceId, parentNodeId, parentContextId){
    // Get node 1 
    const selectedDeviceNode = SpinalGraphService.getRealNode(deviceId);

    // Get context 1
    const context1 = SpinalGraphService.getContextWithType('Network');

    // Get context 2
    const context2 = SpinalGraphService.getContextWithType('deviceProfileContext');

    // Get the parent node
    const parentNode = SpinalGraphService.getRealNode(parentNodeId);
    
    // generate bacnet values if there isn't
    const children = await parentNode.getChildren("hasBacnetValues");
    if (children.length == 0) {
      return DeviceHelper.initialize().then(async result => {

          const generatedBacnetValuesId = SpinalGraphService.createNode({
            name: "BacnetValues",
            type: "bacnetValues"
          }, undefined);
          // Get node 2
          const generatedBacnetValuesnode = await SpinalGraphService.addChildInContext(parentNodeId, generatedBacnetValuesId, parentContextId,
            "hasBacnetValues", SPINAL_RELATION_PTR_LST_TYPE);

          await DeviceHelper.getBacnetValues(context1[0], context2[0], selectedDeviceNode, generatedBacnetValuesnode);
          
        }).catch(err => console.log(err));

    }
    else {
      console.log("Création des BacnetValues déjà effectuée");
    }
  }

  
  static async getBacnetValues(context1,context2,node1,node2) {
    const childrenToAdd = await node1.getChildrenInContext(context1);
  
    const prom = [];
    for (const child of childrenToAdd) {
      const childNodeConfig = DeviceHelper.setChildNodeConfiguration(child.info.typeNetwork.get(),child.info.type.get());
      const n = new SpinalNode(childNodeConfig[2], childNodeConfig[1]);
      prom.push(node2.addChildInContext(n, childNodeConfig[0], 'PtrLst', context2));
      prom.push(DeviceHelper.linkChildren(n, child, context1, context2, childNodeConfig[3]));
    }
    return Promise.all(prom);
  }
  
  static async linkChildren(n, child, context1, context2, rel2) {
    const prom = [];
    const childrenToAdd = await child.getChildrenInContext(context1);
    for (const grandChild of childrenToAdd) {
      const grandChildType = grandChild.info.typeNetwork.get().replace(/(_\w)/g, function(m){return m[1].toUpperCase()}); 
      const grandChildNode = new SpinalNode(grandChild.info.name.get(), grandChildType);

      prom.push(n.addChildInContext(grandChildNode, rel2, 'PtrLst', context2));
      
      //prom.push(DeviceHelper.getAttributeFromNode(grandChild));
      //console.log(DeviceHelper.getAttributeByLabelAndCategory(grandChild));
      let attributeObj = {
        IDX : grandChild.info.idNetwork.get() - 1,
        NAME : grandChild.info.name.get(),
        type : grandChildType,
        typeId : grandChild.info.typeId.get()
      };
      const keys = Object.keys(attributeObj);
      prom.push(AttributeService.addCategoryAttribute(grandChildNode, "default"));
      keys.forEach ( key =>{
        prom.push(AttributeService.addAttributeByCategoryName(grandChildNode, "default", key, attributeObj[key]));
      });
    }
    return prom;
  }


  static setChildNodeConfiguration(bacnetType, nodeType){
    let combine = bacnetType+"-"+nodeType;
    let relationName = '';
    let typeName = '';
    let name = '';
    let grandChildRelation = ''
    let resTab = [];
    switch(combine){
      case "analog_value-BmsEndpointGroup":
        relationName = "hasAnalogValues";
        typeName = 'analogValues';
        name = 'Analog Values';
        grandChildRelation = 'hasAnalogValue';
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
      case "analog_input-BmsEndpointGroup":
        relationName = 'hasAnalogInputs';
        typeName = 'analogInputs';
        name = 'Analog Input';
        grandChildRelation = 'hasAnalogInput';
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
      case "analog_output-BmsEndpointGroup":
        relationName = "hasAnalogOutputs";
        typeName = 'analogOutputs';
        name = 'Analog Output';
        grandChildRelation = 'hasAnalogOutput';
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
      case "multi_state_output-BmsEndpointGroup":
        relationName = "hasMultiStateOutputs";
        typeName = 'multiStateOutputs';
        name = 'Multi State Output';
        grandChildRelation = 'hasMultiStateOutput';
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
      case "multi_state_input-BmsEndpointGroup":
        relationName = "hasMultiStateInputs";
        typeName = 'multiStateInputs';
        name = 'Multi State Input';
        grandChildRelation = 'hasMultiStateInput';
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
      case "multi_state_value-BmsEndpointGroup":
        relationName = "hasMultiStateValues";
        typeName = 'multiStateValues';
        name = 'Multi-State Value';
        grandChildRelation = 'hasMultiStateValue';
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
      case "binary_value-BmsEndpointGroup":
        relationName = "hasBinaryValues";
        typeName = 'binaryValues';
        name = 'Binary Values';
        grandChildRelation = 'hasBinaryValue';
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
      case "binary_output-BmsEndpointGroup":
        relationName = "hasBinaryOutputs";
        typeName = 'binaryOutputs';
        name = 'Binary Output';
        grandChildRelation = 'hasBinaryOutput';
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
      case "binary_input-BmsEndpointGroup":
        relationName = "hasBinaryInputs";
        typeName = 'binaryInputs';
        name = 'Binary Input';
        grandChildRelation = 'hasBinaryInput';
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
      case "network_value-BmsEndpointGroup":
        relationName = "hasNetworkValues";
        typeName = 'networkValues';
        name = 'Network Values';
        grandChildRelation = 'hasNetworkValue';
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
      default:
        relationName = bacnetType;
        typeName = nodeType;
        resTab.push(relationName,typeName,name,grandChildRelation);
        break;
    }
    return resTab;
  }

  // static async getAttributeFromNode(node){
  //   let attributeObj = {
  //     IDX : node.info.idNetwork.get() - 1,
  //     name : node.info.name.get(),
  //     type : node.info.typeNetwork.get().replace(/(_\w)/g, function(m){return m[1].toUpperCase()}),
  //     typeId : node.info.typeId.get()
  //   };
  //   const keys = Object.keys(attributeObj);
  //   let prom = [];
  //   prom.push(AttributeService.addCategoryAttribute(node, "default"));
  //   keys.forEach ( key =>{
  //     prom.push(AttributeService.addAttributeByCategoryName(node, "default", key, attributeObj[key]));
  //   });
  //   return prom;
  // }

  //////////////////////////////////////////////////
  ///////////      ITEM LIST FONCTIONS /////////////
  //////////////////////////////////////////////////

  static async saveProfileAsJson(nodeId) {

    var item_list = [];

    const node = SpinalGraphService.getRealNode(nodeId);
    const itemsId = node.getChildrenIds();

    for (var it in itemsId) {
      const item = await SpinalGraphService.getNodeAsync(itemsId[it]);
      const maitre = await this.getAttributeByLabelAndCategory(itemsID[it], "default", "maitre");
      const namingConvention = await this.getAttributeByLabelAndCategory(itemsID[it], "default", "namingConvention");
      // console.log(item);
      item_list.push({
        name: item.name._data,
        type: item.itemType._data,
        maitre: maitre,
        namingConvention: namingConvention,
        inputs: [],
        outputs: []
      });

      const inputsNodeId = (await SpinalGraphService.getChildren(item.id, "hasInputs"))[0].childrenIds;
      for (var ids in inputsNodeId) {
        const input = await SpinalGraphService.getNodeAsync(inputsNodeId[ids]);
        const IDX = await this.getAttributeByLabelAndCategory(inputsNodeId[ids], "default", "IDX");
        item_list[it].inputs.push({
          name: input.name._data,
          IDX: IDX,
          type: input.type._data
        });
      }


      const outputsNodeId = (await SpinalGraphService.getChildren(item.id, "hasOutputs"))[0].childrenIds;
      for (var idss in outputsNodeId) {
        const output = await SpinalGraphService.getNodeAsync(outputsNodeId[idss]);
        const IDX = await this.getAttributeByLabelAndCategory(outputsNodeId[idss], "default", "IDX");
        item_list[it].outputs.push({
          name: output.name._data,
          IDX: IDX,
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

  static async exportJSONItemList(nodeId) {

    var item_list = [];

    const node = SpinalGraphService.getRealNode(nodeId);
    const itemsId = node.getChildrenIds();

    for (var it in itemsId) {
      const item = await SpinalGraphService.getNodeAsync(itemsId[it]);
      const namingConvention = await this.getAttributeByLabelAndCategory(itemsId[it], "default", "namingConvention");
      const maitre = await this.getAttributeByLabelAndCategory(itemsId[it], "default", "maitre");
      item_list.push({
        name: item.name._data,
        type: item.itemType._data,
        maitre: maitre,
        namingConvention: namingConvention,
        inputs: [],
        outputs: []
      });

      const inputsNodeId = (await SpinalGraphService.getChildren(item.id, "hasInputs"))[0].childrenIds;
      for (var ids in inputsNodeId) {
        const input = await SpinalGraphService.getNodeAsync(inputsNodeId[ids]);
        const IDX = await this.getAttributeByLabelAndCategory(inputsNodeId[ids], "default", "IDX")
        item_list[it].inputs.push({
          name: input.name._data,
          IDX: IDX,
          type: input.type._data
        });
      }


      const outputsNodeId = (await SpinalGraphService.getChildren(item.id, "hasOutputs"))[0].childrenIds;
      for (var idss in outputsNodeId) {
        const output = await SpinalGraphService.getNodeAsync(outputsNodeId[idss]);
        const IDX = await this.getAttributeByLabelAndCategory(outputsNodeId[idss], "default", "IDX")
        item_list[it].outputs.push({
          name: output.name._data,
          IDX: IDX,
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
    if (children.length == 0) {

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
    else {
      console.log("Création d'Item_list déjà effectuée");
    }


  }

  static async listItemInTab(node) {
    var tab2 = [];
    // console.log(node);
    var children = await node.childrenIds;

    for (var elt in children) {
      var childNode = await SpinalGraphService.getNodeAsync(children[elt]);
      if (childNode.type._data == "item") {
        let maitreInfos = await DeviceHelper.getAttributeByLabelAndCategory(children[elt], "default", "maitre");
        let namingConventionInfos = await DeviceHelper.getAttributeByLabelAndCategory(children[elt], "default", "namingConvention");
        tab2.push({
          name: childNode.name._data,
          maitre: maitreInfos,
          itemType: childNode.itemType._data,
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
        
        // add Supervision Node
        const supervisionId = SpinalGraphService.createNode({
          name: "Supervision",
          type: "itemSupervision"
        }, undefined);
        let supervisionNode = await SpinalGraphService.addChildInContext(generatedItemId, supervisionId, DeviceHelper.contextId, "hasSupervisionNode", SPINAL_RELATION_PTR_LST_TYPE);
        // add measures / Alarm / Command children nodes to supervision Node
        const measuresId = SpinalGraphService.createNode({
          name: "Measures",
          type: "measures"
        }, undefined);
        await SpinalGraphService.addChildInContext(supervisionId, measuresId, DeviceHelper.contextId, "hasMeasures", SPINAL_RELATION_PTR_LST_TYPE);
        
        const alarmsId = SpinalGraphService.createNode({
          name: "Alarms",
          type: "alarms"
        }, undefined);
        await SpinalGraphService.addChildInContext(supervisionId, alarmsId, DeviceHelper.contextId, "hasAlarms", SPINAL_RELATION_PTR_LST_TYPE);

        const commandsId = SpinalGraphService.createNode({
          name: "Commands",
          type: "commands"
        }, undefined);
        await SpinalGraphService.addChildInContext(supervisionId, commandsId, DeviceHelper.contextId, "hasCommands", SPINAL_RELATION_PTR_LST_TYPE);
        
        // add item attributes

        DeviceHelper.create_Attributes(itemNode, { maitre: isMaitre, namingConvention: namingConvention }, "default");
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

    // networks values
    for (var elt in childrenNetworkValuesIds) {
      var networkValueNode = await SpinalGraphService.getNodeAsync(childrenNetworkValuesIds[elt]);
      const strIDX = await this.getAttributeByLabelAndCategory(childrenNetworkValuesIds[elt], "default", "IDX");
      var idx = parseInt(strIDX);
      var name = networkValueNode.name._data;
      var title = "NV_" + (idx + 1);
      inputTab.push({
        title: title,
        name: name,
        idx: idx
      });
    }

    //Analog Input
    var childrenAnalogInputs = await SpinalGraphService.getChildren(child[0].id, "hasAnalogInputs");
    var childrenAnalogInputsIds = childrenAnalogInputs[0].childrenIds;
    for (let ai in childrenAnalogInputsIds) {
      var analogInputNode = await SpinalGraphService.getNodeAsync(childrenAnalogInputsIds[ai]);
      const strIDX = await this.getAttributeByLabelAndCategory(childrenAnalogInputsIds[ai], "default", "IDX");
      var idx = parseInt(strIDX);
      var name = analogInputNode.name._data;
      var title = "AI_" + (idx + 1);
      inputTab.push({
        title: title,
        name: name,
        idx: idx
      });
    }

    // Binary Input
    var childrenBinaryInputs = await SpinalGraphService.getChildren(child[0].id, "hasBinaryInputs");
    var childrenBinaryInputsIds = childrenBinaryInputs[0].childrenIds;
    for (let bi in childrenBinaryInputsIds) {
      var binaryInputNode = await SpinalGraphService.getNodeAsync(childrenBinaryInputsIds[bi]);
      const strIDX = await this.getAttributeByLabelAndCategory(childrenBinaryInputsIds[bi], "default", "IDX");
      var idx = parseInt(strIDX);
      var name = binaryInputNode.name._data;
      var title = "BI_" + (idx + 1);
      inputTab.push({
        title: title,
        name: name,
        idx: idx
      });
    }

    // Multi State Input

    var childrenMultiStateInputs = await SpinalGraphService.getChildren(child[0].id, "hasMultiStateInputs");
    var childrenMultiStateInputsIds = childrenMultiStateInputs[0].childrenIds;
    for (let msi in childrenMultiStateInputsIds) {
      var multiStateInputNode = await SpinalGraphService.getNodeAsync(childrenMultiStateInputsIds[msi]);
      const strIDX = await this.getAttributeByLabelAndCategory(childrenMultiStateInputsIds[msi], "default", "IDX");
      var idx = parseInt(strIDX);
      var name = multiStateInputNode.name._data;
      var title = "MSI_" + (idx + 1);
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
      const strIDX = await this.getAttributeByLabelAndCategory(childrenAnalogValuesIds[elt], "default", "IDX");
      var idx = parseInt(strIDX);
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
      const strIDX = await this.getAttributeByLabelAndCategory(childrenBinaryValuesIds[elt], "default", "IDX");
      var idx = parseInt(strIDX);
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
      const strIDX = await this.getAttributeByLabelAndCategory(childrenMSValuesIds[elt], "default", "IDX");
      var idx = parseInt(strIDX);
      var name = MSValueNode.name._data;
      var title = "MSV_" + (idx + 1);
      outputTab.push({
        title: title,
        name: name,
        idx: idx
      });
    }

    // Analog Output
    var childrenAnalogOutputs = await SpinalGraphService.getChildren(child[0].id, "hasAnalogOutputs");
    var childrenAnalogOutputsIds = childrenAnalogOutputs[0].childrenIds;
    for (let ao in childrenAnalogOutputsIds) {
      var analogOutputNode = await SpinalGraphService.getNodeAsync(childrenAnalogOutputsIds[ao]);
      const strIDX = await this.getAttributeByLabelAndCategory(childrenAnalogOutputsIds[ao], "default", "IDX");
      var idx = parseInt(strIDX);
      var name = analogOutputNode.name._data;
      var title = "BI_" + (idx + 1);
      inputTab.push({
        title: title,
        name: name,
        idx: idx
      });
    }

    return outputTab;
  }

  static async itemDetailInfos(selectedNode) {

    let maitreInfos = await DeviceHelper.getAttributeByLabelAndCategory(selectedNode.id._data, "default", "maitre");
    let namingConventionInfos = await DeviceHelper.getAttributeByLabelAndCategory(selectedNode.id._data, "default", "namingConvention");

    return {
      namingConvention: namingConventionInfos,
      maitre: maitreInfos
    };
  }

  static async itemDetailInputOutput(selectedNode) {

    var tab = new Object();
    var idx = "";
    tab.NetworkValue = [];
    tab.AnalogValue = [];
    tab.BinaryValue = [];
    tab.MultiStateValue = [];
    tab.AnalogInput = [];
    tab.BinaryInput = [];
    tab.MultiStateInput = [];
    tab.AnalogOutput = [];
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
        case 'analogInputs':
          tempTab = tab.AnalogInput;
          title = "AI_";
          break;
        case 'analogOutputs':
          tempTab = tab.AnalogOutput;
          title = "AO_";
          break;
          case 'binaryInputs':
            tempTab = tab.BinaryInput;
            title = "BI_";
            break;
          case 'multiStateInputs':
            tempTab = tab.MultiStateInput;
            title = "MSI_";
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
        if (finalNode.name != undefined) {
          const strIDX = await this.getAttributeByLabelAndCategory(valueNodeIds[elt2], "default", "IDX");
          idx = parseInt(strIDX);
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

  //A changer pour prendre en compte les attributs
  static async modifyConventionAndMasterInfos(parentId, namingConvention, master) {

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
        const outputNodeId = outputNode[0].id._data;

        await DeviceHelper.clearLinks(outputNodeId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);

        for (var elt in selectedOutputTab) {
          await SpinalGraphService.addChildInContext(outputNodeId, selectedOutputTab[elt].nodeId, DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
        }

      })
      .catch(err => console.log(err));
  }

  static async clearLinks(parentId, relationName, relationType) {
    let realNode = SpinalGraphService.getRealNode(parentId);
    SpinalGraphService._addNode(realNode);

    if (realNode.hasRelation(relationName, relationType)) {
      const children = await realNode.getChildren(relationName);
      for (var elt in children) {
        let realChildNode = children[elt];
        await realNode.removeChild(realChildNode, relationName, relationType);
      }
      await realNode.removeRelation(relationName, relationType);
    }
  }

  static async clearLinksOneByOne(parentId, childId, relationName, relationType){
    let realParentNode = SpinalGraphService.getRealNode(parentId);
    let realChildNode = SpinalGraphService.getRealNode(childId);
    if(realParentNode.hasRelation(relationName, relationType)){
      const children = await realParentNode.getChildren(relationName);
      for(let elt in children){
        console.log(children[elt]);
        if(children[elt].info.id.get() == childId){
          await realParentNode.removeChild(realChildNode, relationName, relationType);
        }
      }
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

  static async generateItemFromBOG(parentId, tab) {
    return DeviceHelper.initialize()
      .then(async result => {
        let returnedTab = [];

        // get bacnetValues node
        let item_listNode = (await SpinalGraphService.getParents(parentId, "hasItemList"))[0];
        let bacnetValuesNode = (await SpinalGraphService.getChildren(item_listNode.id._data, "hasBacnetValues"))[0];
        let networkValuesNode = (await SpinalGraphService.getChildren(bacnetValuesNode.id._data, "hasNetworkValues"))[0];
        let analogValuesNode = (await SpinalGraphService.getChildren(bacnetValuesNode.id._data, "hasAnalogValues"))[0];
        let binaryValuesNode = (await SpinalGraphService.getChildren(bacnetValuesNode.id._data, "hasBinaryValues"))[0];
        let multiStateValuesNode = (await SpinalGraphService.getChildren(bacnetValuesNode.id._data, "hasMultiStateValues"))[0];

        let lengthOfTab = tab.length;
        let parentNode = SpinalGraphService.getRealNode(parentId);

        for (let elt = 0; elt < lengthOfTab; elt++) {
          let linksLength = tab[elt].links.length;
          let tabLinks = tab[elt].links;

          let item_name = tab[elt].name._data;
          let item_type;
          let prefix = item_name.split('_')[0];
          if (prefix == "FC") {
            item_type = "Fan Coil";
          }
          else if (prefix == "L") {
            item_type = "Lamp";
          }
          else if (prefix == "B") {
            item_type = "Blind";
          }
          else if (prefix == "WC") {
            item_type = "Windows Contact";
          }
          else if (prefix == "Device") {
            item_type = "Device";
          }
          else if (prefix == "RC") {
            item_type = "Remote Controller";
          }
          else if (prefix == "L") {
            item_type = "Lamp";
          }
          else {
            item_type = "inconnu";
          }

          // choix du type d'item

          // tant que l'on ne sait pas ce qu'est CG => exception à la génération
          if (prefix != "CG" && item_type != "inconnu") {

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

            DeviceHelper.create_Attributes(nodeCreated, { maitre: false, namingConvention: item_name }, "default");

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

            // add outputs node
            const outputsId = SpinalGraphService.createNode({
              name: "Outputs",
              type: "output"
            }, undefined)
            let outputsNode = await SpinalGraphService.addChildInContext(itemId, outputsId, DeviceHelper.contextId, "hasOutputs", SPINAL_RELATION_PTR_LST_TYPE);

            // add Supervision Node
            const supervisionId = SpinalGraphService.createNode({
              name: "Supervision",
              type: "itemSupervision"
            }, undefined);
            let supervisionNode = await SpinalGraphService.addChildInContext(itemId, supervisionId, DeviceHelper.contextId, "hasSupervisionNode", SPINAL_RELATION_PTR_LST_TYPE);
            // add measures / Alarm / Command children nodes to supervision Node
            const measuresId = SpinalGraphService.createNode({
              name: "Measures",
              type: "measures"
            }, undefined);
            await SpinalGraphService.addChildInContext(supervisionId, measuresId, DeviceHelper.contextId, "hasMeasures", SPINAL_RELATION_PTR_LST_TYPE);
            
            const alarmsId = SpinalGraphService.createNode({
              name: "Alarms",
              type: "alarms"
            }, undefined);
            await SpinalGraphService.addChildInContext(supervisionId, alarmsId, DeviceHelper.contextId, "hasAlarms", SPINAL_RELATION_PTR_LST_TYPE);

            const commandsId = SpinalGraphService.createNode({
              name: "Commands",
              type: "commands"
            }, undefined);
            await SpinalGraphService.addChildInContext(supervisionId, commandsId, DeviceHelper.contextId, "hasCommands", SPINAL_RELATION_PTR_LST_TYPE);
            
            // generate links
            for (let linkElt = 0; linkElt < linksLength; linkElt++) {
              //input nv link
              if (tabLinks[linkElt].type._data == "nv") {
                let idsToLink = networkValuesNode.childrenIds;
                let suiteAdded = parseInt(tabLinks[linkElt].suite._data);
                for (let id in idsToLink) {
                  let nodeToCheck = await SpinalGraphService.getNodeAsync(idsToLink[id]);
                  if (suiteAdded == 0) {
                    if (parseInt(nodeToCheck.IDX._data) + 1 == tabLinks[linkElt].idx._data) {
                      await SpinalGraphService.addChildInContext(inputsId, idsToLink[id], DeviceHelper.contextId, "hasInput", SPINAL_RELATION_PTR_LST_TYPE);
                    }
                  }
                  else {
                    if (((parseInt(nodeToCheck.IDX._data) + 1) >= tabLinks[linkElt].idx._data) && ((parseInt(nodeToCheck.IDX._data) + 1) < parseInt(tabLinks[linkElt].idx._data) + suiteAdded)) {
                      await SpinalGraphService.addChildInContext(inputsId, idsToLink[id], DeviceHelper.contextId, "hasInput", SPINAL_RELATION_PTR_LST_TYPE);
                    }
                  }
                }
              }
              // output av link
              else if (tab[elt].links[linkElt].type == "av") {
                let idsToLink = analogValuesNode.childrenIds;
                let suiteAdded = parseInt(tabLinks[linkElt].suite._data);
                for (let id in idsToLink) {
                  let nodeToCheck = await SpinalGraphService.getNodeAsync(idsToLink[id]);
                  if (suiteAdded == 0) {
                    if (parseInt(nodeToCheck.IDX._data) + 1 == tabLinks[linkElt].idx._data) {
                      await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                    }
                  }
                  else {
                    if (((parseInt(nodeToCheck.IDX._data) + 1) >= tabLinks[linkElt].idx._data) && ((parseInt(nodeToCheck.IDX._data) + 1) < parseInt(tabLinks[linkElt].idx._data) + suiteAdded)) {
                      await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                    }
                  }
                }
              }
              // output bv link
              else if (tab[elt].links[linkElt].type == "bv") {
                let idsToLink = binaryValuesNode.childrenIds;
                let suiteAdded = parseInt(tabLinks[linkElt].suite._data);
                for (let id in idsToLink) {
                  let nodeToCheck = await SpinalGraphService.getNodeAsync(idsToLink[id]);
                  if (suiteAdded == 0) {
                    if (parseInt(nodeToCheck.IDX._data) + 1 == tabLinks[linkElt].idx._data) {
                      await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                    }
                  }
                  else {
                    if (((parseInt(nodeToCheck.IDX._data) + 1) >= tabLinks[linkElt].idx._data) && ((parseInt(nodeToCheck.IDX._data) + 1) < parseInt(tabLinks[linkElt].idx._data) + suiteAdded)) {
                      await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                    }
                  }
                }
              }
              // output mv link
              else if (tab[elt].links[linkElt].type == "mv") {
                let idsToLink = multiStateValuesNode.childrenIds;
                let suiteAdded = parseInt(tabLinks[linkElt].suite._data);
                for (let id in idsToLink) {
                  let nodeToCheck = await SpinalGraphService.getNodeAsync(idsToLink[id]);
                  if (suiteAdded == 0) {
                    if (parseInt(nodeToCheck.IDX._data) + 1 == tabLinks[linkElt].idx._data) {
                      await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                    }
                  }
                  else {
                    if (((parseInt(nodeToCheck.IDX._data) + 1) >= tabLinks[linkElt].idx._data) && ((parseInt(nodeToCheck.IDX._data) + 1) < parseInt(tabLinks[linkElt].idx._data) + suiteAdded)) {
                      await SpinalGraphService.addChildInContext(outputsId, idsToLink[id], DeviceHelper.contextId, "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
                    }
                  }
                }
              }
              else {
                console.log("error link");
              }
            }
          }
        }
        return returnedTab;
      })

  }

  static async clearItems(parentId) {
    let realNode = SpinalGraphService.getRealNode(parentId);
    SpinalGraphService._addNode(realNode);

    if (realNode.hasRelation("hasItem", SPINAL_RELATION_PTR_LST_TYPE)) {
      let itemNodes = await realNode.getChildren("hasItem");
      // console.log(itemNodes);
      for (let item in itemNodes) {
        // console.log(itemNodes[item]);
        if (itemNodes[item].hasRelation("hasInputs", SPINAL_RELATION_PTR_LST_TYPE)) {
          let inputsNode = (await itemNodes[item].getChildren("hasInputs"))[0];
          SpinalGraphService._addNode(inputsNode);

          if (inputsNode.hasRelation("hasInput", SPINAL_RELATION_PTR_LST_TYPE)) {
            await DeviceHelper.clearLinks(inputsNode.info.id.get(), "hasInput", SPINAL_RELATION_PTR_LST_TYPE);
            await DeviceHelper.clearLinks(itemNodes[item].info.id.get(), "hasInputs", SPINAL_RELATION_PTR_LST_TYPE);
          }
          else {
            await DeviceHelper.clearLinks(itemNodes[item].info.id.get(), "hasInputs", SPINAL_RELATION_PTR_LST_TYPE);
          }

        }
        if (itemNodes[item].hasRelation("hasOutputs", SPINAL_RELATION_PTR_LST_TYPE)) {
          let outputsNode = (await itemNodes[item].getChildren("hasOutputs"))[0];
          SpinalGraphService._addNode(outputsNode);

          if (outputsNode.hasRelation("hasOutput", SPINAL_RELATION_PTR_LST_TYPE)) {
            await DeviceHelper.clearLinks(outputsNode.info.id.get(), "hasOutput", SPINAL_RELATION_PTR_LST_TYPE);
            await DeviceHelper.clearLinks(itemNodes[item].info.id.get(), "hasOutputs", SPINAL_RELATION_PTR_LST_TYPE);
          }
          else {
            await DeviceHelper.clearLinks(itemNodes[item].info.id.get(), "hasOutputs", SPINAL_RELATION_PTR_LST_TYPE);
          }

        }
      }
      await DeviceHelper.clearLinks(realNode.info.id.get(), "hasItem", SPINAL_RELATION_PTR_LST_TYPE);

    }


  }

  /////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////// ITEM SUPERVISION FUNCTIONS ///////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////

  static async itemSupervisionInputOutput(parentId){
    let tab = [];
    // tab.AnalogValue = [];
    // tab.BinaryValue = [];
    // tab.MultiStateValue = [];
    // tab.AnalogInput = [];
    // tab.BinaryInput = [];
    // tab.MultiStateInput = [];
    // tab.AnalogOutput = [];
    // tab.others = [];
    console.log("parentid " + parentId);
    let parent1 = await SpinalGraphService.getParents(parentId, "hasItem");
    let parent2 = await SpinalGraphService.getParents(parent1[0].id.get(), "hasItemList");
    let child = (await SpinalGraphService.getChildren(parent2[0].id.get(), "hasBacnetValues"))[0];

    // get Binary Values
    let allBVsNode = (await SpinalGraphService.getChildren(child.id.get(), "hasBinaryValues"))[0];
    let BVnode = await SpinalGraphService.getChildren(allBVsNode.id.get(), "hasBinaryValue");
    if(BVnode.length !=0){
      let title = "BV_";
      for(let BV of BVnode){
        let nodeId = BV.id.get();
        let idx = await this.getAttributeByLabelAndCategory(nodeId, "default", "IDX");
        let name = await this.getAttributeByLabelAndCategory(nodeId, "default", "NAME");
        tab.push({
          title: title + (parseInt(idx) + 1),
          name: name,
          nodeId: nodeId
        });
      }
      console.log(tab.length);
    }

    // get Analog Values
    let allAVsNode = (await SpinalGraphService.getChildren(child.id.get(), "hasAnalogValues"))[0];
    let AVnode = await SpinalGraphService.getChildren(allAVsNode.id.get(), "hasAnalogValue");
    if(AVnode.length !=0){
      let title = "AV_";
      for(let AV of AVnode){
        let nodeId = AV.id.get();
        let idx = await this.getAttributeByLabelAndCategory(nodeId, "default", "IDX");
        let name = await this.getAttributeByLabelAndCategory(nodeId, "default", "NAME");
        tab.push({
          title: title + (parseInt(idx) + 1),
          name: name,
          nodeId: nodeId
        });
      }
      console.log(tab.length);
    }

    // get Multi State Value
    let allMSVsNode = (await SpinalGraphService.getChildren(child.id.get(), "hasMultiStateValues"))[0];
    let MSVnode = await SpinalGraphService.getChildren(allMSVsNode.id.get(), "hasMultiStateValue");
    if(MSVnode.length !=0){
      let title = "MSV_";
      for(let MSV of MSVnode){
        let nodeId = MSV.id.get();
        let idx = await this.getAttributeByLabelAndCategory(nodeId, "default", "IDX");
        let name = await this.getAttributeByLabelAndCategory(nodeId, "default", "NAME");
        tab.push({
          title: title + (parseInt(idx) + 1),
          name: name,
          nodeId: nodeId
        });
      }
      console.log(tab.length);
    }

    // get Analog Input
    let allAIsNode = (await SpinalGraphService.getChildren(child.id.get(), "hasAnalogInputs"))[0];
    let AInode = await SpinalGraphService.getChildren(allAIsNode.id.get(), "hasAnalogInput");
    if(AInode.length !=0){
      let title = "AI_";
      for(let AI of AInode){
        let nodeId = AI.id.get();
        let idx = await this.getAttributeByLabelAndCategory(nodeId, "default", "IDX");
        let name = await this.getAttributeByLabelAndCategory(nodeId, "default", "NAME");
        tab.push({
          title: title + (parseInt(idx) + 1),
          name: name,
          nodeId: nodeId
        });
      }
      console.log(tab.length);
    }

    // get Binary Inputs
    let allBIsNode = (await SpinalGraphService.getChildren(child.id.get(), "hasBinaryInputs"))[0];
    let BInode = await SpinalGraphService.getChildren(allBIsNode.id.get(), "hasBinaryInput");
    if(BInode.length !=0){
      let title = "BI_";
      for(let BI of BInode){
        let nodeId = BI.id.get();
        let idx = await this.getAttributeByLabelAndCategory(nodeId, "default", "IDX");
        let name = await this.getAttributeByLabelAndCategory(nodeId, "default", "NAME");
        tab.push({
          title: title + (parseInt(idx) + 1),
          name: name,
          nodeId: nodeId
        });
      }
      console.log(tab.length);
    }

    // get Analog Outputs
    let allAOsNode = (await SpinalGraphService.getChildren(child.id.get(), "hasAnalogOutputs"))[0];
    let AOnode = await SpinalGraphService.getChildren(allAOsNode.id.get(), "hasAnalogOutput");
    if(AOnode.length !=0){
      let title = "AO_";
      for(let AO of AOnode){
        let nodeId = AO.id.get();
        let idx = await this.getAttributeByLabelAndCategory(nodeId, "default", "IDX");
        let name = await this.getAttributeByLabelAndCategory(nodeId, "default", "NAME");
        tab.push({
          title: title + (parseInt(idx) + 1),
          name: name,
          nodeId: nodeId
        });
      }
      console.log(tab.length);
    }

    // get Multi State Inputs
    let allMSIsNode = (await SpinalGraphService.getChildren(child.id.get(), "hasMultiStateInputs"))[0];
    let MSInode = await SpinalGraphService.getChildren(allMSIsNode.id.get(), "hasMultiStateInput");
    if(MSInode.length !=0){
      let title = "MSI_";
      for(let MSI of MSInode){
        let nodeId = MSI.id.get();
        let idx = await this.getAttributeByLabelAndCategory(nodeId, "default", "IDX");
        let name = await this.getAttributeByLabelAndCategory(nodeId, "default", "NAME");
        tab.push({
          title: title + (parseInt(idx) + 1),
          name: name,
          nodeId: nodeId
        });
      }
      console.log(tab.length);
    }

    // console.log(tab);
    // console.log(child);


    return tab;
  }

  static async generateSupervisionLinks(parentId, childId, relationName, globalNodeId, relationToGlobalNodeId){
    console.log(parentId, childId, relationName, globalNodeId, relationToGlobalNodeId);
    await this.initialize();
    await SpinalGraphService.addChildInContext(parentId, childId, this.contextId, relationName, SPINAL_RELATION_PTR_LST_TYPE);
    await SpinalGraphService.addChildInContext(globalNodeId, childId, this.contextId, relationToGlobalNodeId, SPINAL_RELATION_PTR_LST_TYPE)
  }

  static async getItemSupervisionLinks(parentId, relationName){
    let tab = [];
    let bacnetsLinked = await SpinalGraphService.getChildren(parentId, relationName);
    if(bacnetsLinked.length != 0){
      for(let bac of bacnetsLinked){
        let title = "undefined";
        let nodeId = bac.id.get();
        let idx = await this.getAttributeByLabelAndCategory(nodeId, "default", "IDX");
        let name = await this.getAttributeByLabelAndCategory(nodeId, "default", "NAME");
        // let nb = parseInt(bac.IDX.get()) + 1;
        switch(bac.type.get()){
          case "networkValue":
            title = "NV_";
            break;
          case "analogValue":
            title = "AV_";
            break;
          case "analogInput":
            title = "AI_";
            break;
          case "analogOutput":
            title = "AO_";
            break;
          case "binaryValue":
            title = "BV_";
            break;
          case "binaryInput":
            title = "BI_";
            break;
          case "multiStateValue":
            title = "MSV_";
            break;
          case "multiStateinput":
            title = "MSI_";
            break;
          default:
            break;
        }
        tab.push({
          title: title + (parseInt(idx) + 1),
          name: name,
          nodeId: nodeId
        });
        console.log(bac);
      }
    }
    console.log(tab);
    return tab;
  }
  /////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////// MONITORING CONFIGURATION /////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////

  static async generateSupervisionGraph(parentId) {
    const parentNode = await SpinalGraphService.getRealNode(parentId);
    const children = await parentNode.getChildren("hasGlobalSupervision");
    
    if (children.length == 0) {
      return DeviceHelper.initialize()
        .then(async result => {
          // add Monitoring node : child of device
          const supervisionNodeId = SpinalGraphService.createNode({
            name: "Supervision",
            type: "globalDeviceSupervision"
          }, undefined);
          await SpinalGraphService.addChildInContext(parentId, supervisionNodeId, DeviceHelper.contextId, "hasGlobalSupervision", SPINAL_RELATION_PTR_LST_TYPE);

          // add global Measure / Alarms / Commands node
          const globalMeasureId = SpinalGraphService.createNode({
            name: "Measures",
            type: "deviceGlobalMeasures"
          }, undefined);
          await SpinalGraphService.addChildInContext(supervisionNodeId, globalMeasureId, DeviceHelper.contextId, "hasGlobalMeasures", SPINAL_RELATION_PTR_LST_TYPE);
          const globalAlarmsId = SpinalGraphService.createNode({
            name: "Alarms",
            type: "deviceGlobalAlarms"
          }, undefined);
          await SpinalGraphService.addChildInContext(supervisionNodeId, globalAlarmsId, DeviceHelper.contextId, "hasGlobalAlarms", SPINAL_RELATION_PTR_LST_TYPE);
          
          const globalCommandId = SpinalGraphService.createNode({
            name: "Commands",
            type: "deviceGlobalCommands"
          }, undefined);
          await SpinalGraphService.addChildInContext(supervisionNodeId, globalCommandId, DeviceHelper.contextId, "hasGlobalCommands", SPINAL_RELATION_PTR_LST_TYPE);

          // add basic interval Time

          // basic Intervals for Measures : Not monitored, 5000 ms and COV
          const intervalTimeNotMonitoredMeasureId = SpinalGraphService.createNode({
            name: "Not Monitored",
            type: "supervisionIntervalTime"
          }, undefined);
          let intervalTimeNotMonitoredMeasureNode = await SpinalGraphService.addChildInContext(globalMeasureId, intervalTimeNotMonitoredMeasureId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
          await this.create_Attributes(intervalTimeNotMonitoredMeasureNode, {Monitoring : false, IntervalTime: 0}, "Supervision");
          const intervalTimeCOVMeasureId = SpinalGraphService.createNode({
              name: "COV",
              type: "supervisionIntervalTime"
          }, undefined);
          let intervalTimeCOVMeasureNode = await SpinalGraphService.addChildInContext(globalMeasureId, intervalTimeCOVMeasureId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
          await this.create_Attributes(intervalTimeCOVMeasureNode, {Monitoring : true, IntervalTime: "COV"}, "Supervision");
          
          const intervalTime5sMeasureId = SpinalGraphService.createNode({
            name: "5000",
            type: "supervisionIntervalTime"
          }, undefined);
          let intervalTime5sMeasureNode = await SpinalGraphService.addChildInContext(globalMeasureId, intervalTime5sMeasureId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
          await this.create_Attributes(intervalTime5sMeasureNode, {Monitoring : true, IntervalTime: 5000}, "Supervision");
          
          
          
          // basic intervals for alarms : not monitored, 5000 ms and COV
          const intervalTimeNotMonitoredAlarmsId = SpinalGraphService.createNode({
            name: "Not Monitored",
            type: "supervisionIntervalTime"
          }, undefined);
          let intervalTimeNotMonitoredAlarmsNode = await SpinalGraphService.addChildInContext(globalAlarmsId, intervalTimeNotMonitoredAlarmsId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
          await this.create_Attributes(intervalTimeNotMonitoredAlarmsNode, {Monitoring : false, IntervalTime: 0}, "Supervision");
          
          const intervalTimeCOVAlarmsId = SpinalGraphService.createNode({
            name: "COV",
            type: "supervisionIntervalTime"
          }, undefined);
          let intervalTimeCOVAlarmsNode = await SpinalGraphService.addChildInContext(globalAlarmsId, intervalTimeCOVAlarmsId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
          await this.create_Attributes(intervalTimeCOVAlarmsNode, {Monitoring : true, IntervalTime: "COV"}, "Supervision");        
          
          const intervalTime5sAlarmsId = SpinalGraphService.createNode({
            name: "5000",
            type: "supervisionIntervalTime"
          }, undefined);
          let intervalTime5sAlarmsNode = await SpinalGraphService.addChildInContext(globalAlarmsId, intervalTime5sAlarmsId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
          await this.create_Attributes(intervalTime5sAlarmsNode, {Monitoring : true, IntervalTime: 5000}, "Supervision");
                  






          ///////// add basic Interval Times
          // // add COV IntervalTime
          // const intervalTimeCOVNodeId = SpinalGraphService.createNode({
          //   name: "COV",
          //   type: "deviceMonitoringIntervalTime"
          // }, undefined);
          // let intervalTimeCOVNode = await SpinalGraphService.addChildInContext(monitoringNodeId, intervalTimeCOVNodeId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
          // await DeviceHelper.create_Attributes(intervalTimeCOVNode, { Monitoring: true, IntervalTime: "COV" }, "Monitoring");

          // // add 5s IntervalTime
          // const intervalTime5000NodeId = SpinalGraphService.createNode({
          //   name: "5s",
          //   type: "deviceMonitoringIntervalTime"
          // }, undefined);
          // let intervalTime5000Node = await SpinalGraphService.addChildInContext(monitoringNodeId, intervalTime5000NodeId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
          // await DeviceHelper.create_Attributes(intervalTime5000Node, { Monitoring: true, IntervalTime: 5000 }, "Monitoring");


        })
        .catch(err => console.log(err));
      }
      else {console.log("Création de supervision déjà effectuée");}
  }

  static async getLinkedOutputBacnetValues_FromMonitoringNodeId(parentId) {
    let itemsIdTab = await this.getItemsId_FromMonitoringNodeId(parentId);
    let AVBVMSV_Idstab = await this.getListOutputByItem(itemsIdTab);
    let serializedTab = await this.getSerializedTabByItem(AVBVMSV_Idstab);

    return serializedTab;

  }
  static async getLinkedOutputBacnetValues_FromItemId(parentId) {
    let tab = [];
    tab[0] = parentId;
    let AVBVMSV_Idstab = await this.getListOutputByItem(tab);
    let serializedTab = await this.getSerializedTabByItem(AVBVMSV_Idstab);

    return serializedTab;
  }

  static async getItemsId_FromMonitoringNodeId(parentId) {
    let tab = [];
    let deviceProfileNode = (await SpinalGraphService.getParents(parentId, "hasMonitoringNode"))[0];
    let itemListNode = (await SpinalGraphService.getChildren(deviceProfileNode.id.get(), "hasItemList"))[0];
    let itemsNode = (await SpinalGraphService.getChildren(itemListNode.id.get(), "hasItem"));
    for (let elt in itemsNode) {
      tab.push(itemsNode[elt].id.get());
    }
    return tab;
  }

  static async getListOutputByItem(tab) {
    let AVBVMSV_Idstab = [];

    for (let elt in tab) {
      let realNode = SpinalGraphService.getRealNode(tab[elt]);
      let outputsNode = (await SpinalGraphService.getChildren(tab[elt], "hasOutputs"))[0];
      let outputBacnetValuesNode = await SpinalGraphService.getChildren(outputsNode.id.get(), "hasOutput");
      if (outputBacnetValuesNode.length != 0) {
        let outputTab = []
        for (let value in outputBacnetValuesNode) {
          outputTab.push(outputBacnetValuesNode[value].id.get());
        }
        AVBVMSV_Idstab.push({
          item_name: realNode.info.name.get(),
          outputs: outputTab
        });
      }

    }
    return AVBVMSV_Idstab;

  }

  static async getSerializedTabByItem(tab) {
    return DeviceHelper.initialize().then(async result => {

      let serializedTab = [];
      for (let elt in tab) {
        let outputsId = tab[elt].outputs;
        for (let id in outputsId) {
          let intervalTime = "null";
          let realNode = SpinalGraphService.getRealNode(outputsId[id]);
          let intervalTimeNodes = (await SpinalGraphService.getParents(outputsId[id], "hasIntervalTime"));
          if (intervalTimeNodes.length != 0) {
            let intervalTimeNode = intervalTimeNodes[0];
            console.log(intervalTimeNode);
            intervalTime = await this.getAttributeByLabelAndCategory(intervalTimeNode.id.get(), "Monitoring", "IntervalTime");
          }
          let name = await this.getAttributeByLabelAndCategory(outputsId[id], "default", "NAME");
          let idx = await this.getAttributeByLabelAndCategory(outputsId[id], "default", "IDX");
          let type = realNode.info.type.get();
          let title = "undefined_";
          switch (type) {
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
          serializedTab.push({
            generic_name: generic_name,
            name: name,
            item_name: tab[elt].item_name,
            nodeId: realNode.info.id.get(),
            intervalTime: intervalTime
          });
        }
      }
      return serializedTab;

    }).catch(err => console.log(err));

  }

  // static async getIntervalTimeList(parentId) {
  //   let returnTab = [];
  //   let intervalTimeNodeTab = await SpinalGraphService.getChildren(parentId, "hasIntervalTimeNode");
  //   for (let elt in intervalTimeNodeTab) {
  //     let intervalTime = await this.getAttributeByLabelAndCategory(intervalTimeNodeTab[elt].id.get(), "Monitoring", "IntervalTime");
  //     console.log(intervalTime);
  //     returnTab.push({ value: intervalTime, nodeId: intervalTimeNodeTab[elt].id.get() });
  //   }
  //   return returnTab;
  // }

  // static async addIntervalTimeNode(monitoringNodeId, newIntervalTime) {
  //   return DeviceHelper.initialize()
  //     .then(async result => {

  //       const newIntervalTimeNodeId = SpinalGraphService.createNode({
  //         name: newIntervalTime,
  //         type: "deviceMonitoringIntervalTime"
  //       }, undefined);
  //       let newIntervalTimeNode = await SpinalGraphService.addChildInContext(monitoringNodeId, newIntervalTimeNodeId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
  //       await DeviceHelper.create_Attributes(newIntervalTimeNode, { Monitoring: true, IntervalTime: parseInt(newIntervalTime) }, "Monitoring");

  //       let returnTab = { value: parseInt(newIntervalTime), nodeId: newIntervalTimeNodeId }
  //       return returnTab;

  //     })
  //     .catch(err => console.log(err));
  // }

  static async clearMonitoringLinks(intervalTimeList) {
    for (let elt in intervalTimeList) {
      await DeviceHelper.clearLinks(intervalTimeList[elt].nodeId, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
    }
  }

  // static async generateMonitoringLinks(tab, intervalTimeList, savedTab) {
  //   return DeviceHelper.initialize().then(async result => {
  //     for (let elt in tab) {
  //       if(tab[elt].intervalTime != savedTab[elt].intervalTime){
  //         if(tab[elt].intervalTime == null || tab[elt].intervalTime == "null"){
  //           //clear
  //           let parent = await SpinalGraphService.getParents(tab[elt].nodeId, "hasIntervalTime");  
  //           if(parent.length !=0){
  //             await this.clearLinksOneByOne(parent[0].id.get(), tab[elt].nodeId, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
  //             spinalEventEmitter.emit("deviceProfileContext-ChangeMonitoring", {
  //               parentId: null,
  //               childId: tab[elt].nodeId,
  //               relationName: null,
  //               tag: "CLEARED"
  //             });
  //           }
            
  //         }
  //         else{
  //           for (let elt2 in intervalTimeList) {
  //             if (tab[elt].intervalTime == intervalTimeList[elt2].value) {
  //               let parent = await SpinalGraphService.getParents(tab[elt].nodeId, "hasIntervalTime");
  //               console.log(parent);
  //               if(parent.length !=0){
  //                 await this.clearLinksOneByOne(parent[0].id.get(), tab[elt].nodeId, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
  //               }
  //               await SpinalGraphService.addChildInContext(intervalTimeList[elt2].nodeId, tab[elt].nodeId, DeviceHelper.contextId, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
  //               spinalEventEmitter.emit("deviceProfileContext-ChangeMonitoring", {
  //                 parentId: intervalTimeList[elt2].nodeId,
  //                 childId: tab[elt].nodeId,
  //                 relationName: "hasIntervalTime",
  //                 tag: "MODIFIED"
  //               });
  //             }
  //           }
  //         }
  //       }
        
  //     }
  //   })
  //     .catch(err => console.log(err));
  // }

  static async clearEndpointsMonitoringConfiguration(tab){
    for (let elt in tab){
      if(tab[elt].intervalTime != ""){
        tab[elt].intervalTime = "";
        let parent = await SpinalGraphService.getParents(tab[elt].nodeId, "hasIntervalTime");
        if(parent.length !=0 ){
          await this.clearLinks(parent[0].id.get(), "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
      }
    }
      }
    return tab;
  }

  ////////////////////////////////////////////////////////////////
  /////////////////////// GLOBAL SUPERVISION ////////////////////
  ////////////////////////////////////////////////////////////////

  static defineTitle(type){
    let title = "undefined_";
          switch (type) {
            case "networkValue":
            title = "NV_";
            break;
          case "analogValue":
            title = "AV_";
            break;
          case "analogInput":
            title = "AI_";
            break;
          case "analogOutput":
            title = "AO_";
            break;
          case "binaryValue":
            title = "BV_";
            break;
          case "binaryInput":
            title = "BI_";
            break;
          case "multiStateValue":
            title = "MSV_";
            break;
          case "multiStateinput":
            title = "MSI_";
            break;
          default:
            title = "undefined_type_";
            break;
          }
    return title;
  }

  static async getGlobalSupervisionConfiguration(parentId){
    let returnTab = {
      measures : [],
      alarms : [],
      commands: []
    };
    let globalMeasuresNode = await SpinalGraphService.getChildren(parentId, "hasGlobalMeasures");
    let globalAlarmsNode = await SpinalGraphService.getChildren(parentId, "hasGlobalAlarms");
    let globalCommandsNode = await SpinalGraphService.getChildren(parentId, "hasGlobalCommands");
    let tempTab = [globalMeasuresNode[0].id.get(), globalAlarmsNode[0].id.get(), globalCommandsNode[0].id.get()];

    for(let glob of tempTab){
      if(glob == globalCommandsNode[0].id.get()){
        let bacnetValues = await SpinalGraphService.getChildren(glob, "hasGlobalCommand");
        for(let bac of bacnetValues){
          let name = await this.getAttributeByLabelAndCategory(bac.id.get(), "default", "NAME");
          let title = this.defineTitle(bac.type.get());
          let idx = await this.getAttributeByLabelAndCategory(bac.id.get(), "default", "IDX");
          let idxx = parseInt(idx)+1;
          let commandsNode = await SpinalGraphService.getParents(bac.id.get(), "hasCommand");
          let supervisionNode = await SpinalGraphService.getParents(commandsNode[0].id.get(), "hasCommands");
          let itemNode = await SpinalGraphService.getParents(supervisionNode[0].id.get(), "hasSupervisionNode");
          returnTab.commands.push({
            name: name,
            generic_name: title + idxx,
            item_name: itemNode[0].name.get(),
            nodeId: bac.id.get()
          });
        }
      }
      else{
        let intervalTimeNodes = await SpinalGraphService.getChildren(glob, "hasIntervalTimeNode");
        for(let iT of intervalTimeNodes){
          let intervalTime = await this.getAttributeByLabelAndCategory(iT.id.get(), "Supervision", "IntervalTime");
          let bacnetValues = await SpinalGraphService.getChildren(iT.id.get(), "hasIntervalTime");
          for(let bac of bacnetValues){
            let name = await this.getAttributeByLabelAndCategory(bac.id.get(), "default", "NAME");
            let title = this.defineTitle(bac.type.get());
            let idx = await this.getAttributeByLabelAndCategory(bac.id.get(), "default", "IDX");
            let idxx = parseInt(idx)+1;

            if(glob == globalMeasuresNode[0].id.get() ){
              let measuresNode = await SpinalGraphService.getParents(bac.id.get(), "hasMeasure");
              let supervisionNode = await SpinalGraphService.getParents(measuresNode[0].id.get(), "hasMeasures");
              let itemNode = await SpinalGraphService.getParents(supervisionNode[0].id.get(), "hasSupervisionNode");
              returnTab.measures.push({
                name: name,
                generic_name: title + idxx,
                item_name: itemNode[0].name.get(),
                intervalTime: intervalTime,
                nodeId: bac.id.get()
              });
            }
            else if (glob == globalAlarmsNode[0].id.get()){
              let alarmsNode = await SpinalGraphService.getParents(bac.id.get(), "hasAlarm");
              let supervisionNode = await SpinalGraphService.getParents(alarmsNode[0].id.get(), "hasAlarms");
              let itemNode = await SpinalGraphService.getParents(supervisionNode[0].id.get(), "hasSupervisionNode");
              returnTab.alarms.push({
                name: name,
                generic_name: title + idxx,
                item_name: itemNode[0].name.get(),
                intervalTime: intervalTime,
                nodeId: bac.id.get()
              });
            }        
          }
        }
      }
      
    }
    console.log(returnTab);
    return returnTab;
  }

  static async getIntervalTimeList(parentId) {
    let returnTab = {
      alarms: [],
      measures: []
    };
    let globalMeasuresNode = await SpinalGraphService.getChildren(parentId, "hasGlobalMeasures");
    let globalAlarmsNode = await SpinalGraphService.getChildren(parentId, "hasGlobalAlarms");
    let globTab = [globalMeasuresNode[0].id.get(), globalAlarmsNode[0].id.get()];
    for(let glob of globTab){
      let intervalTimeNodeList = await SpinalGraphService.getChildren(glob, "hasIntervalTimeNode");
      for (let iT of intervalTimeNodeList){
        let intervalTime = await this.getAttributeByLabelAndCategory(iT.id.get(), "Supervision", "IntervalTime");
        if(glob == globalMeasuresNode[0].id.get()){
          returnTab.measures.push({ value: intervalTime, nodeId: iT.id.get()});
        }
        else if(glob == globalAlarmsNode[0].id.get()){
          returnTab.alarms.push({ value: intervalTime, nodeId: iT.id.get()});
        }
      }
    }
    console.log(returnTab);
    return returnTab;
    // let intervalTimeNodeTab = await SpinalGraphService.getChildren(parentId, "hasIntervalTimeNode");
    // for (let elt in intervalTimeNodeTab) {
    //   let intervalTime = await this.getAttributeByLabelAndCategory(intervalTimeNodeTab[elt].id.get(), "Monitoring", "IntervalTime");
    //   console.log(intervalTime);
    //   returnTab.push({ value: intervalTime, nodeId: intervalTimeNodeTab[elt].id.get() });
    // }
    // return returnTab;
  }

  static async addIntervalTimeNode(/*intervalTimeList,*/ newIntervalTime, idOfGlobal) {
    return DeviceHelper.initialize()
      .then(async result => {

        const newIntervalTimeNodeId = SpinalGraphService.createNode({
          name: newIntervalTime,
          type: "supervisionIntervalTime"
        }, undefined);
        let newIntervalTimeNode = await SpinalGraphService.addChildInContext(idOfGlobal, newIntervalTimeNodeId, DeviceHelper.contextId, "hasIntervalTimeNode", SPINAL_RELATION_PTR_LST_TYPE);
        await DeviceHelper.create_Attributes(newIntervalTimeNode, { Monitoring: true, IntervalTime: parseInt(newIntervalTime) }, "Supervision");

        let returnTab = { value: parseInt(newIntervalTime), nodeId: newIntervalTimeNodeId }
        return returnTab;

      })
      .catch(err => console.log(err));
  }

  static async generateGlobalSupervisionLinks(tab, intervalTimeList, savedTab) {
    return DeviceHelper.initialize().then(async result => {
      for (let elt in tab) {
        if(tab[elt].intervalTime != savedTab[elt].intervalTime){
            for (let elt2 in intervalTimeList) {
              if (tab[elt].intervalTime == intervalTimeList[elt2].value) {
                let parent = await SpinalGraphService.getParents(tab[elt].nodeId, "hasIntervalTime");
                console.log(parent);
                if(parent.length !=0){
                  await this.clearLinksOneByOne(parent[0].id.get(), tab[elt].nodeId, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
                }
                await SpinalGraphService.addChildInContext(intervalTimeList[elt2].nodeId, tab[elt].nodeId, DeviceHelper.contextId, "hasIntervalTime", SPINAL_RELATION_PTR_LST_TYPE);
                spinalEventEmitter.emit("deviceProfileContext-ChangeSupervision", {
                  parentId: intervalTimeList[elt2].nodeId,
                  childId: tab[elt].nodeId,
                  relationName: "hasIntervalTime",
                  tag: "MODIFIED"
                });
              }
            }
          }
        }
    })
      .catch(err => console.log(err));
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