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

// /*
//  * Copyright 2020 SpinalCom - www.spinalcom.com
//  * 
//  * This file is part of SpinalCore.
//  * 
//  * Please read all of the following terms and conditions
//  * of the Free Software license Agreement ("Agreement")
//  * carefully.
//  * 
//  * This Agreement is a legally binding contract between
//  * the Licensee (as defined below) and SpinalCom that
//  * sets forth the terms and conditions that govern your
//  * use of the Program. By installing and/or using the
//  * Program, you agree to abide by all the terms and
//  * conditions stated or referenced herein.
//  * 
//  * If you do not agree to abide by these terms and
//  * conditions, do not demonstrate your acceptance and do
//  * not install or use the Program.
//  * You should have received a copy of the license along
//  * with this file. If not, see
//  * <http://resources.spinalcom.com/licenses.pdf>.
//  */


// //////////////////////////////////
// //        export to drive function
// //////////////////////////////////

// async exportToDrive(context) {
//     let driveDirectory = await this.getDriveDirectoryOfForgeFile();
//     // now we will create a related directory of graph
//     let ViewerDirectoryInDrive = await this.getDriveLinkedDirectory(
//       driveDirectory
//     );
//     let name = context.info.name.get();
//     let obj = {};
//     obj[name] = {
//       _info: {
//         relation: Object.keys(context.parents).pop(),
//       },
//     };
//     let path = this.getPathLinkedDirectory() + "/" + context.info.name.get();
//     let depth = 0;
//     let contextDirectory = await this.createDirectory(context);
//     ViewerDirectoryInDrive.add_file(context.info.name.get(),
//       contextDirectory, {
//         model_type: "Directory",
//         icon: "folder",
//         node: new Ptr(context),
//       });
//     this.startRecursiveExport(context, contextDirectory, context);
//   }
  
//   async startRecursiveExport(node, directory, context) {
//     let result = await node.getChildrenInContext(context);
//     for (let i = 0; i < result.length; i++) {
//       const element = result[i];
//       this.newTryRecursiveExport(element, directory, context);
//     }
//   }
//   cutLastElementOfPath(path) {
//     let pathTab = path.split("/");
//     let str = "";
//     for (let i = 1; i < pathTab.length - 1; i++) {
//       const element = pathTab[i];
//       str = str + "/" + element;
//     }
//     return str;
//   }
//   getDriveDirectoryOfForgeFile() {
//     let forgeFilePath = window.spinal.spinalSystem.getPath();
//     let drivePath = this.cutLastElementOfPath(forgeFilePath);
//     return window.spinal.spinalSystem.load(drivePath).then((directory) => {
//       return directory;
//     });
//   }
//   getDriveLinkedDirectory(directory) {
//     let myCheck = false;
//     let myFile = undefined;
//     for (let i = 0; i < directory.length; i++) {
//       const element = directory[i];
//       if (element.name.get() == "ViewerLinkedDirectory") {
//         myCheck = true;
//         myFile = element;
//       }
//     }
//     if (myCheck) {
//       return new Promise((resolve) => {
//         myFile._ptr.load((FileDirectory) => {
//           resolve(FileDirectory);
//         });
//       });
//     } else {
//       // il faut créer le directory
//       let myDirectory = new Directory();
  
//       let myFile = new File("ViewerLinkedDirectory", myDirectory);
//       directory.push(myFile);
//       return Promise.resolve(myDirectory);
//     }
//   }
//   getPathLinkedDirectory() {
//     let forgeFilePath = window.spinal.spinalSystem.getPath();
//     let drivePath = this.cutLastElementOfPath(forgeFilePath);
//     let linkedDirectoryPath = (drivePath =
//       drivePath + "/ViewerLinkedDirectory");
//     return linkedDirectoryPath;
//   }
  
//   loadDir(file) {
//     return new Promise(async (resolve) => {
//       file.load((dir) => {
//         resolve(dir);
//       });
//     });
//   }
//   async getNbChildren(selectedNode) {
//     const fileNode = await selectedNode.getChildren("hasFiles");
//     return fileNode.length;
//   }
//   async createDirectory(selectedNode) {
//     let nbNode = await this.getNbChildren(selectedNode);
//     if (nbNode == 0) {
//       let myDirectory = new Directory();
  
//       let node = await selectedNode.addChild(
//         myDirectory,
//         "hasFiles",
//         SPINAL_RELATION_PTR_LST_TYPE
//       );
//       node.info.name.set("[Files]");
//       node.info.type.set("SpinalFiles");
//       return myDirectory;
//     } else {
//       return this.getDirectory(selectedNode);
//     }
//   }
//   async createFile(directory, node) {
//     let dir = await this.createDirectory(node);
  
//     directory.add_file(node.info.name.get(), dir, {
//       model_type: "Directory",
//       icon: "folder",
//       node: new Ptr(node),
//     });
//     return dir;
//   }
//   async createFileDir(directory, name, childDirNode) {
//     let childDir = await this.getDirectory(childDirNode);
//     directory.add_file(name, childDir, {
//       model_type: "Directory",
//       icon: "folder",
//       node: new Ptr(childDirNode),
//     });
//     return childDir;
//   }
//   async getDirectory(selectedNode) {
//     if (selectedNode != undefined) {
//       const fileNode = await selectedNode.getChildren("hasFiles");
//       if (fileNode.length == 0) {
//         return undefined;
//       } else {
//         let directory = await fileNode[0].getElement();
//         return directory;
//       }
//     }
//   }
  
//   async newTryRecursiveExport(node, directory, context) {
//     let myDir = undefined;
//     for (let i = 0; i < directory.length; i++) {
//       const element = directory[i];
//       if (node.info.name.get() === element.name.get()) {
//         // eslint-disable-next-line no-await-in-loop
//         myDir = await this.loadDir(element);
//         break;
//       }
//     }
//     if (myDir === undefined) {
//       // check if directory exist for node
//       let child = await node.getChildren("hasFiles");
//       if (child.length != 0) {
//         myDir = await this.createFileDir(directory, node.info.name.get(),
//           node);
//       } else {
//         myDir = await this.createFile(directory, node);
//       }
//     }
//     let result = await node.getChildrenInContext(context);
//     let tabProm = [];
//     for (let i = 0; i < result.length; i++) {
//       const element = result[i];
//       tabProm.push(this.newTryRecursiveExport(element, myDir, context));
//     }
//     Promise.all(tabProm);
//   }
//   }