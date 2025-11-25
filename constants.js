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

import { SPINAL_RELATION_LST_PTR_TYPE } from "spinal-env-viewer-graph-service";

export const DEVICE_RELATION_NAME = 'hasDevice';
export const DEVICE_RELATION_TYPE = SPINAL_RELATION_LST_PTR_TYPE;
export const DEVICE_PROFILES_TYPE = "deviceProfile";
export const DEVICE_TYPE = "device";
export const PART_RELATION_NAME = 'hasParts';
export const PART_RELATION_TYPE = SPINAL_RELATION_LST_PTR_TYPE;


export const endpointTypes = Object.freeze({
    0: "Analog Input",
    1: "Analog Output",
    2: "Analog Values",
    3: "Binary Input",
    4: "Binary Output",
    5: "Binary Values",
    13: "Multi State Input",
    14: "Multi State Output",
    19: "Multi-State Value",
    55: "Binary Lighting output"
})

export const bacnetGroupInfo = Object.freeze({
    "Analog Input": {
        id: 0,
        nodeType: "analogInputs",
        childType: "analogInput",
        parentRelationName: "hasAnalogInputs",
        childRelationName: "hasAnalogInput"
    },
    "Analog Output": {
        id: 1,
        nodeType: "analogOutputs",
        childType: "analogOutput",
        parentRelationName: "hasAnalogOutputs",
        childRelationName: "hasAnalogOutput"
    },
    "Analog Values": {
        id: 2,
        nodeType: "analogValues",
        childType: "analogValue",
        parentRelationName: "hasAnalogValues",
        childRelationName: "hasAnalogValue"
    },
    "Binary Input": {
        id: 3,
        nodeType: "binaryInputs",
        childType: "binaryInput",
        parentRelationName: "hasBinaryInputs",
        childRelationName: "hasBinaryInput"
    },
    "Binary Output": {
        id: 4,
        nodeType: "binaryOutputs",
        childType: "binaryOutput",
        parentRelationName: "hasBinaryOutputs",
        childRelationName: "hasBinaryOutput"
    },
    "Binary Values": {
        id: 5,
        nodeType: "binaryValues",
        childType: "binaryValue",
        parentRelationName: "hasBinaryValues",
        childRelationName: "hasBinaryValue"
    },
    "Multi State Input": {
        id: 13,
        nodeType: "multiStateInputs",
        childType: "multiStateInput",
        parentRelationName: "hasMultiStateInputs",
        childRelationName: "hasMultiStateInput"
    },
    "Multi State Output": {
        id: 14,
        nodeType: "multiStateOutputs",
        childType: "multiStateOutput",
        parentRelationName: "hasMultiStateOutputs",
        childRelationName: "hasMultiStateOutput"
    },
    "Multi-State Value": {
        id: 19,
        nodeType: "multiStateValues",
        childType: "multiStateValue",
        parentRelationName: "hasMultiStateValues",
        childRelationName: "hasMultiStateValue"
    },
    "Binary Lighting output": {
        id: 55,
        nodeType: "binaryLightingOutputs",
        childType: "binaryLightingOutput",
        parentRelationName: "hasBinaryLightingOutputs",
        childRelationName: "hasBinaryLightingOutput"
    }
});


// export const spinalNodeTypes = Object.freeze({
//     "Analog Input": "analogInput",
//     "Analog Output": "analogOutput",
//     "Analog Values": "analogValues",
//     "Binary Input": "binaryInput",
//     "Binary Output": "binaryOutput",
//     "Binary Values": "binaryValues",
//     "Multi State Input": "multiStateInput",
//     "Multi State Output": "multiStateOutput",
//     "Multi-State Value": "multiStateValue",
//     "Binary Lighting Output": "binaryLightingOutput",
// })

// export const relationNames = Object.freeze({
//     "Analog Input": "hasAnalogInput",
//     "Analog Output": "hasAnalogOutput",
//     "Analog Values": "hasAnalogValues",
//     "Binary Input": "hasBinaryInput",
//     "Binary Output": "hasBinaryOutput",
//     "Binary Values": "hasBinaryValues",
//     "Multi State Input": "hasMultiStateInput",
//     "Multi State Output": "hasMultiStateOutput",
//     "Multi-State Value": "hasMultiStateValue",
//     "Binary Lighting Output": "hasBinaryLightingOutput",
// })


// export const groupNamesToIds = Object.freeze({
//     "Analog Input": 0,
//     "Analog Output": 1,
//     "Analog Values": 2,
//     "Binary Input": 3,
//     "Binary Output": 4,
//     "Binary Values": 5,
//     "Multi State Input": 13,
//     "Multi State Output": 14,
//     "Multi-State Value": 19,
//     "Binary Lighting Output": 55
// });
