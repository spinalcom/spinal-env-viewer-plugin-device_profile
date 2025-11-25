<template>
    <md-dialog :md-active.sync="showDialog" @md-closed="closeDialog(false)">
        <md-dialog-title class="dialogTitle">Update bacnetValues from discovery</md-dialog-title>

        <md-dialog-content class="mdDialogContainer">

            <div class="content" v-if="state === STATES.selection">

                <selectItemsComponent title="select endpoint to create in profile" :endpoints="endpointsToCreate" />
                <selectItemsComponent title="select endpoint to remove from profile" :endpoints="endpointsToRemove" />

                <!-- <div class="section">
                    <div class="title" title="Endpoint to create in profile">
                        select endpoint to create in profile
                    </div>
                    <div class="listContent">
                        <md-list class="md-double-line">
                            <md-list-item v-for="(endpoint, index) in endpointsToCreate" :key="index">
                                <md-checkbox v-model="toCreate" :value="endpoint.id" />
                                <div class="md-list-item-text">
                                    <span>{{ endpoint.name }}</span>
                                    <span>
                                        type : {{ getEndpointType(endpoint.typeId) }} - id : {{ endpoint.idNetwork }}
                                    </span>
                                </div>
                            </md-list-item>
                        </md-list>
                    </div>
                </div>

                <div class="section">
                    <div class="title" title="Endpoint to remove from profile">
                        select endpoint to remove from profile
                    </div>
                    <div class="listContent">
                        <md-list class="md-double-line">
                            <md-list-item v-for="(endpoint, index) in endpointsToRemove" :key="index">
                                <md-checkbox v-model="toRemove" :value="endpoint.id" />
                                <div class="md-list-item-text">
                                    <span>{{ endpoint.name }}</span>
                                    <span>
                                        type : {{ getEndpointType(endpoint.typeId) }}
                                        -
                                        id: {{ endpoint.idNetwork }}
                                    </span>
                                </div>

                            </md-list-item>
                        </md-list>
                    </div>
                </div> -->
            </div>

            <md-progress-spinner v-else-if="state === STATES.loading" md-mode="indeterminate"></md-progress-spinner>



        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-primary" @click="closeDialog(false)">Close</md-button>
            <md-button class="md-primary" @click="UpdateProfile">Update profile</md-button>

        </md-dialog-actions>

    </md-dialog>

</template>

<script>
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import serviceDocumentation from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalBmsEndpoint } from 'spinal-model-bmsnetwork';
// import { endpointTypes } from '../constants';
import selectItemsComponent from './selectItemsComponent.vue';
import * as lodash from 'lodash';
import { endpointTypes, relationNames, spinalNodeTypes, bacnetGroupInfo } from '../constants';

export default {
    name: "UpdateDeviceProfile",
    props: ["onFinised"],
    components: {
        selectItemsComponent
    },
    data() {
        this.STATES = {
            selection: "selection",
            loading: "loading",
            error: "error",
            success: "success",
        };
        return {
            showDialog: true,
            nodeId: null,
            contextId: null,
            deviceSelected: null,
            networkSelected: null,
            contextSelected: null,
            state: this.STATES.selection,
            endpointsToCreate: [],
            endpointsToRemove: [],
            toCreate: [],
            toRemove: [],

            bacnetValueNode: null, // node that contain all bacnet values in profile
            nodeTypesNodes: [], // bacnet value type nodes in profile (analog Value, binary Value, ...)
        }
    },
    methods: {

        async opened(option) {
            this.state = this.STATES.loading;

            this.nodeId = option.nodeId;
            this.contextId = option.contextId;

            this.deviceSelected = option.deviceSelected;
            this.networkSelected = option.networkSelected;
            this.contextSelected = option.contextSelected;

            const actualEndpoints = await this._getAllEndpointInBmsDevice(this.deviceSelected, this.contextSelected);
            const actualsProfileItems = await this._getAllItemsInDeviceProfile(this.nodeId, this.contextId);
            const { endpointsToCreate, endpointsToRemove } = await this._getDifferences(actualEndpoints, actualsProfileItems);

            this.endpointsToCreate = endpointsToCreate;
            this.endpointsToRemove = endpointsToRemove;

            this.state = this.STATES.selection;
        },



        removed: async function (save) {
            if (save) {

            }

            this.showDialog = false;

        },

        closeDialog(closeResult) {
            if (typeof this.onFinised === "function") {
                this.onFinised(closeResult);
            }

        },

        UpdateProfile: function () {
            this.state = this.STATES.loading;

            const toCreate = this.endpointsToCreate.filter(endpoint => endpoint.checked);
            const toRemove = this.endpointsToRemove.filter(endpoint => endpoint.checked);

            console.log("toCreate", toCreate);
            console.log("toRemove", toRemove);

            const promises = [this.createItemsInProfile(this.nodeId, this.contextId, toCreate), this.removeItemsFromProfile(this.nodeId, this.contextId, toRemove)];
            return Promise.all(promises).then((result) => {
                this.state = this.STATES.success;
            }).catch((err) => {
                console.error(err);
                this.state = this.STATES.error;
            });;
        },

        // getEndpointType: function (typeId) {
        //     const type = endpointTypes[typeId];
        //     return type || "Unknown";
        // },

        createItemsInProfile: async function (nodeId, contextId, toCreate) {
            if (!this.bacnetValueNode) this.bacnetValueNode = await this._createBacnetValuesNode(nodeId, contextId);

            const obj = lodash.groupBy(toCreate, "typeId");
            const promises = [];
            for (const key in obj) {
                const typeName = endpointTypes[key];
                promises.push(this._createItemInProfileTypeNode(typeName, obj[key], contextId));
            }

            return Promise.all(promises);
        },

        removeItemsFromProfile: function (nodeId, contextId, toRemove) {
            if (!this.bacnetValueNode) return Promise.resolve([]);
            const obj = lodash.groupBy(toRemove, "typeId");
            const promises = [];
            for (const key in obj) {
                const typeName = endpointTypes[key];
                const typeNode = this.nodeTypesNodes.find(node => node.name.get() === typeName);
                if (typeNode) {
                    promises.push(this._removeItemsFromTypeNode(typeNode, obj[key]));
                }
            }

            return Promise.all(promises);
        },

        _createItemInProfileTypeNode: async function (typeName, endpoints, contextId) {
            let typeNode = this.nodeTypesNodes.find(node => node.name.get() === typeName);
            if (!typeNode) typeNode = await this._createTypeNodeInBacnetValuesNode(typeName, contextId);

            const promises = endpoints.map(endpoint => this._createEndpointItem(endpoint, typeNode, contextId));

            return Promise.all(promises);
        },

        _createEndpointItem: function (endpoint, typeNode, contextId) {
            const groupInfo = bacnetGroupInfo[typeNode.name.get()];
            const endpointId = SpinalGraphService.createNode({ name: endpoint.name, type: groupInfo.childType });
            return SpinalGraphService.addChildInContext(typeNode.id.get(), endpointId, contextId, groupInfo.childRelationName, SPINAL_RELATION_PTR_LST_TYPE)
                .then((result) => {
                    return this._addAttributesToNode(endpointId, endpoint, groupInfo.childType);
                })
        },

        _removeItemsFromTypeNode: function (typeNode, items) {
            const promises = items.map(item => SpinalGraphService.removeFromGraph(item.id));
            return Promise.all(promises);
        },

        _createTypeNodeInBacnetValuesNode: async function (typeName, contextId) {
            if (!this.bacnetValueNode) this.bacnetValueNode = await this._createBacnetValuesNode(this.nodeId, contextId);

            const groupInfo = bacnetGroupInfo[typeName];

            if (!groupInfo) throw new Error(`Cannot create type node for type name : ${typeName}`);

            const typeNodeId = SpinalGraphService.createNode({ name: typeName, type: groupInfo.nodeType });

            return SpinalGraphService.addChildInContext(this.bacnetValueNode.id.get(), typeNodeId, contextId, groupInfo.parentRelationName, SPINAL_RELATION_PTR_LST_TYPE)
                .then(() => {
                    const typeNode = SpinalGraphService.getInfo(typeNodeId);
                    this.nodeTypesNodes.push(typeNode);
                    return typeNode;
                })

        },


        _createBacnetValuesNode: function (parentId, contextId) {
            const bacnetNodeId = SpinalGraphService.createNode({ name: "BacnetValues", type: "bacnetValues" });


            return SpinalGraphService.addChildInContext(parentId, bacnetNodeId, contextId, "hasBacnetValues", SPINAL_RELATION_PTR_LST_TYPE)
                .then(() => {
                    return SpinalGraphService.getInfo(bacnetNodeId);
                })
        },

        _getDifferences: async function (actualEndpoints, actualsProfileItems) {
            const endpointsToCreate = {};
            const endpointsToRemove = Object.assign({}, actualsProfileItems);

            for (const key in actualEndpoints) {
                if (!actualsProfileItems[key]) endpointsToCreate[key] = actualEndpoints[key];

                else delete endpointsToRemove[key];
            }

            return { endpointsToCreate: Object.values(endpointsToCreate), endpointsToRemove: Object.values(endpointsToRemove) }
        },


        _getAllItemsInDeviceProfile: async function (profileId, contextId) {
            const profileItems = await this._getProfileItems(profileId, contextId);
            return this._convertProfileItemsToObj(profileItems);
        },

        _getAllEndpointInBmsDevice: async function (deviceId, contextId) {
            const endpoints = {};

            return SpinalGraphService.findInContext(deviceId, contextId, (node) => {
                if (node.getType().get() === SpinalBmsEndpoint.nodeTypeName) {
                    SpinalGraphService._addNode(node);
                    const typeId = node.info.typeId.get();
                    const networkId = node.info.idNetwork.get();
                    const key = `${typeId}_${networkId}`;
                    endpoints[key] = node.info.get();
                    return true;
                }

                return false;
            }).then(() => {
                return endpoints;
            })
        },

        _getBacnetValuesNode: async function (profileId) {
            const bacnetValuesNodes = await SpinalGraphService.getChildren(profileId, ["hasBacnetValues"]);
            return bacnetValuesNodes[0];
        },

        _getBacnetValuesTypesNode: function (bacnetValuesNodeId, contextId) {
            return SpinalGraphService.getChildrenInContext(bacnetValuesNodeId, contextId);
        },

        _getProfileItems: async function (profileId, contextId) {
            let bacnetValueNode = await this._getBacnetValuesNode(profileId);
            if (!bacnetValueNode) return [];

            this.bacnetValueNode = bacnetValueNode; // store bacnet value node for later use

            const typesNodes = await this._getBacnetValuesTypesNode(bacnetValueNode.id.get(), contextId);

            this.nodeTypesNodes = typesNodes; // store bacnet value type nodes for later use

            const promises = typesNodes.map(typeNode => SpinalGraphService.getChildrenInContext(typeNode.id.get(), contextId));

            return Promise.allSettled(promises).then((result) => {
                const items = [];
                for (const res of result) {
                    if (res.status === "fulfilled") items.push(...res.value.map(node => node.get()));
                }

                return items;
            })

        },

        _convertProfileItemsToObj: async function (profileItems) {
            const profileItemsObj = {};
            const promises = profileItems.map(item => this._getItemAttributes(item));

            return Promise.allSettled(promises).then((results) => {
                for (let i = 0; i < results.length; i++) {
                    const res = results[i];
                    const profileItem = profileItems[i];

                    if (res.status === "fulfilled") {
                        const typeId = res.value["typeId"];
                        const idNetwork = parseInt(res.value["IDX"]) + 1; // IDX is 0 based in profile do we need +1

                        const key = `${typeId}_${idNetwork}`;
                        profileItemsObj[key] = { ...profileItem, typeId, idNetwork };
                    }
                }

                return profileItemsObj;
            })
        },

        _getItemAttributes: async function (item) {
            const node = SpinalGraphService.getRealNode(item.id);
            const attributes = await serviceDocumentation.getAttributesByCategory(node, "default");
            return attributes.reduce((obj, attr) => {
                obj[attr.label.get()] = attr.value.get();
                return obj;
            }, {})
        },

        _addAttributesToNode: function (endpointId, endpoint, childtype) {
            const node = SpinalGraphService.getRealNode(endpointId);

            // create name attribute first, to do not duplicate category
            return serviceDocumentation.addAttributeByCategoryName(node, "default", "name", endpoint.name).then((result) => {
                const attributes = [
                    { label: "type", value: childtype },
                    { label: "typeId", value: endpoint.typeId },
                    { label: "IDX", value: endpoint.idNetwork - 1 }, // IDX is 0 based in profile do we need -1
                    { label: "unit", value: endpoint.unit || "" },
                ];

                const promises = attributes.map(attr => {
                    return serviceDocumentation.addAttributeByCategoryName(node, "default", attr.label, attr.value);
                });

                return Promise.all(promises);
            })

        },

    }
}
</script>

<style scoped>
.dialogTitle {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mdDialogContainer {
    width: 900px;
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mdDialogContainer .content {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 10px;
}
</style>