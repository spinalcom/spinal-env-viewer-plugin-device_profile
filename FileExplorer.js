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
    return files;
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
        axios.get(`/sceen/_?u=${server_id}`, { responseEncoding: 'utf8' }).then(
          (data) => {
            xml2js.parseStringPromise(data.data, { mergeAttrs: true, explicitArray: false, preserveWhitespace: true })
              .then(result => {

                new Promise(async resolve => {

                  await DeviceHelper.generateBacNetValues(nodeId, result);
                  await DeviceHelper.generateItem_list(nodeId);
                  await DeviceHelper.generateSupervisionGraph(nodeId);
                  //  await DeviceHelper.generateLampProfile(nodeId, result);

                }).catch(err => console.log(err));

              })

          }).catch(err => console.log(err));
      })
    })
  };

  static readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          var allText = rawFile.responseText;
          alert(allText);
        }
      }
    }
    rawFile.send(null);
  };

  // analyse du fichier BOG

  static async parseBOGFile(xmlFile){

    return new Promise ((resolve, reject) => {

      xml2js.parseStringPromise(xmlFile, { mergeAttrs: true , explicitArray: false})
.then(result => {

    var returnJson = [];
    var returnJson2 = [];
    var name = "";
    var ioName = "";
    var ioType = "";
    var ioIdx = "";
    var ioSuite = "";
    var indexCheckName = -1;

    var ioTemp = "";

    for(var elt in result.bajaObjectGraph.p.p.p[0].p){
        name = result.bajaObjectGraph.p.p.p[0].p[elt].n;
        var links= [];

        if(result.bajaObjectGraph.p.p.p[0].p[elt].p.length != undefined){
            for(var elt2 in result.bajaObjectGraph.p.p.p[0].p[elt].p){
                if(result.bajaObjectGraph.p.p.p[0].p[elt].p[elt2].n == "values"){
                    var strLinks = result.bajaObjectGraph.p.p.p[0].p[elt].p[elt2].v;
                    var strSplit = strLinks.split(";");
                    for(var i in strSplit){
                        if(strSplit[i] != "baja:String" && strSplit[i] != 'iconName' && strSplit[i].includes("$") == false){

                            // récupération du nom de la variable d'entrée / sortie
                            ioName = strSplit[i];

                            // récupération du type et de l'id de la variable d'entrée sortie
                            var ioValueStr = strSplit[parseInt(i)+1];

                            var ioValueSplitted = ioValueStr.split('$3a');
                            
                            if(ioValueSplitted[0] == 'nv' || ioValueSplitted[0] == 'bv' || ioValueSplitted[0] == 'av' || ioValueSplitted[0] == 'mv'){
                                ioType = ioValueSplitted[0];
                                var ioFull = ioValueSplitted;
                                if(ioValueSplitted[1] == parseInt(ioValueSplitted[1])){
                                    ioIdx = ioValueSplitted[1];
                                }
                                else if(ioValueSplitted[1].includes('$3be')){
                                    ioIdx = ioValueSplitted[1].split('$3be')[0];
                                }
                                links.push({
                                    name: ioName,
                                    type: ioType,
                                    idx: ioIdx,
                                    suite: ioSuite
                                });
                            }
                        }
                    }
                }
                else{
                }
            }
        }
        else{
            var usedString = result.bajaObjectGraph.p.p.p[0].p[elt].p.v;
            var usedStringSplitted = usedString.split(';');
            for (var elementinSplitted in usedStringSplitted){
                if(elementinSplitted != usedStringSplitted.length -1){
                    if(usedStringSplitted[parseInt(elementinSplitted)+1].includes("$3a") == true){
                        ioName = usedStringSplitted[elementinSplitted];
                        ioTemp = usedStringSplitted[parseInt(elementinSplitted)+1].split("$3a");
                        if(ioTemp[0] == "nv" || ioTemp[0] == "bv" || ioTemp[0] == "av" || ioTemp[0] == "mv"){
                            ioType = ioTemp[0];
                            ioIdx = ioTemp[1].split('$3be')[0];
                            if(ioTemp.length == 3){
                                ioSuite = ioTemp[2];
                            }
                            else{
                                ioSuite = 0;
                            }
                            links.push({
                                name: ioName,
                                type: ioType,
                                idx: ioIdx,
                                suite: ioSuite
                            });
                        }
                }
                }
            }
        }

        if(links.length != 0){
            returnJson.push({
            name: name,
            links: links
            });
        }
    }

    // analyse de returnJson pour enelver les _Data et fusionner les données

    for (var jsonElement in returnJson){
      var realName = returnJson[jsonElement].name.split("_Data")[0];
      returnJson[jsonElement].name = realName;
      for(var json2Element in returnJson2){
        if(returnJson2[json2Element].name == realName){
          indexCheckName = parseInt(json2Element);
        }
      }
      if(indexCheckName == -1){
        returnJson2.push(returnJson[jsonElement]);
      }
      else{
        if(returnJson2[indexCheckName] == undefined){
          console.log(indexCheckName);
        }
        else{
          for(var linksElement in returnJson[jsonElement].links){
            returnJson2[indexCheckName].links.push(returnJson[jsonElement].links[linksElement]);
          }
        }
      }
      indexCheckName = -1;
    }

    // console.log(returnJson2);
    return resolve(returnJson2);
    
})
.catch(err => console.log(err));


    })
    
  }

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