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

import {
  SpinalContext,
  SpinalGraphService,
  SpinalNode
} from "spinal-env-viewer-graph-service";

import {
  PART_RELATION_NAME,
  PART_RELATION_TYPE,
  DEVICE_RELATION_NAME,
  DEVICE_RELATION_TYPE,
  DEVICE_TYPE,
  DEVICE_PROFILES_TYPE
} from "./constants";


class DeviceHelper {
  static initialized = null;
  static context;
  static contextName;
  static type;
  static contextId;


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

  static createDeviceProfile(name, description, autoLoad) {
    return DeviceHelper.initialize().then(() => {
      console.log(DeviceHelper.contextName);

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

  static generateProfile(parentId, nodeName, nodeType, nodeIdx, relationName, relationType) {
    return DeviceHelper.initialize()
      .then(() => {

        const generatedProfileId = SpinalGraphService.createNode({
          nodeName,
          nodeType,
          nodeIdx
        }, undefined);
        var generatedProfileContext =  SpinalGraphService.addChildInContext(parentId, generatedProfileId, DeviceHelper.contextId, 
          relationName, relationType);

          return generatedProfileContext;
      })
  }
}



DeviceHelper.initialized = null;
DeviceHelper.contextName = "deviceProfileContext";
DeviceHelper.type = "deviceProfileContext";

export { DeviceHelper };


