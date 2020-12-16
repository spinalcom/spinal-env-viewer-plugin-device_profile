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
  SPINAL_RELATION_PTR_LST_TYPE
} from "spinal-env-viewer-graph-service";

import { MESSAGE_TYPES } from "spinal-models-documentation";


import { Directory, Path, File } from "spinal-core-connectorjs_type";
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { DeviceHelper } from "./build/DeviceHelper";
import { SpinalNode } from 'spinal-model-graph';
import { fstat } from "fs";

const xml2js = require('xml2js');
const axios = require('axios');




export class FileExplorer {

  static async getDirectory(selectedNode) {
    if (selectedNode != undefined) {
      const fileNode = await selectedNode.getChildren("hasFiles");
      if (fileNode.length == 0) {
        return undefined;
      } else {
        let directory = await fileNode[0].getElement();
        return (directory);
      }
    }
  }

  static async getNbChildren(selectedNode) {
    const fileNode = await selectedNode.getChildren("hasFiles");
    return fileNode.length;
  }

  static async createDirectory(selectedNode) {
    let nbNode = await this.getNbChildren(selectedNode);
    if (nbNode == 0) {
      let myDirectory = new Directory();
      let node = await selectedNode.addChild(
        myDirectory,
        'hasFiles',
        SPINAL_RELATION_PTR_LST_TYPE
      );
      node.info.name.set("[Files]");
      node.info.type.set("SpinalFiles");
      return myDirectory;
    } else {
      return this.getDirectory(selectedNode);
    }
  }

  static _getFileType(file) {
    const imagesExtension = [
      "JPG",
      "PNG",
      "GIF",
      "WEBP",
      "TIFF",
      "PSD",
      "RAW",
      "BMP",
      "HEIF",
      "INDD",
      "JPEG 2000",
      "SVG",
      "XML",
      "JSON"
    ];
    const extension = /[^.]+$/.exec(file.name)[0];

    return imagesExtension.indexOf(extension.toUpperCase()) !== -1
      ? MESSAGE_TYPES.image
      : MESSAGE_TYPES.file;
  }

  static addFileUpload(directory, uploadFileList) {
    const files = [];

    for (let i = 0; i < uploadFileList.length; i++) {
      const element = uploadFileList[i];
      let filePath = new Path(element);
      let myFile = new File(element.name, filePath, undefined);

      directory.push(myFile);
      files.push(myFile);
    }

    return files
  }

  static async downloadFile(file, index) {
    if (file._info.model_type.get() != "Directory") {
      file._ptr.load(path => {
        if (file._info.model_type.get() == "HttpPath") {
          const element = document.createElement("a");
          const _path =
            path.host.get() +
            "/file/" +
            encodeURIComponent(path.httpRootPath.get()) +
            "/" +
            encodeURIComponent(path.httpPath.get());
          element.setAttribute("href", _path);
          element.setAttribute("download", file.name.get());
          element.style.display = "none";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        } else {
          var element = document.createElement("a");
          element.setAttribute("href", "/sceen/_?u=" + path._server_id);
          element.setAttribute("download", file.name);
          element.click();
        }
      });
    } else {
      // check recursive directory & create a ZIP
    }
  }
  
  static async getXmlContent(xmlFile, nodeId) {
    return new Promise(async (resolve, reject) => {
      xmlFile._ptr.load(path => {
        const server_id = path._server_id;
        axios.get(`http://localhost:7778/sceen/_?u=${server_id}`, { responseEncoding: 'utf8' }).then(
          (data) => {
            xml2js.parseStringPromise(data.data, { mergeAttrs: true, explicitArray: false, preserveWhitespace: true })
              .then(result => {

                new Promise( async resolve => {
                  
                  await DeviceHelper.generateBacNetValues(nodeId, result);
                  await DeviceHelper.generateItem_list(nodeId);
                  //  await DeviceHelper.generateLampProfile(nodeId, result);
                  
                }).catch(err => console.log(err));

              })

              }).catch(err => console.log(err));
          })
      })
    };
  
}


/* 
const deviceId = SpinalGraphService.createNode( {
          name,
          type: DEVICE_TYPE
        }, undefined );
        
        var deviceContext =  SpinalGraphService
          .addChildInContext( parentId, deviceId, DeviceHelper.contextId,
          PART_RELATION_NAME, PART_RELATION_TYPE );

*/