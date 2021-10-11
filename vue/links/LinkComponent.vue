<!--
Copyright 2021 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
	<div class="selection_container">
		<div :class="isAutomate ? 'section' : 'middle'">
			<link-template
				:title="context_title"
				:data="data"
				:itemSelected="contextSelected"
				@select="selectContext"
			></link-template>
		</div>

		<div :class="isAutomate ? 'section' : 'middle'">
			<link-template
				:title="category_title"
				:data="profils"
				:itemSelected="profilSelected"
				@select="selectProfil"
			></link-template>
		</div>

		<div class="section" v-if="isAutomate">
			<link-template
				:title="group_title"
				:data="devices"
				:itemSelected="deviceSelected"
				@select="selectDevice"
			></link-template>
		</div>
	</div>
</template>

<script>
	import LinkToGroupTemplate from "./linkToGroupTemplate.vue";

	export default {
		name: "selectionComponent",
		props: {
			context_title: {},
			category_title: {},
			group_title: {},
			data: {},
			profils: {},
			devices: {},
			contextSelected: {},
			profilSelected: {},
			deviceSelected: {},
			isAutomate: {
				type: Boolean,
				default: true,
			},
		},
		components: { "link-template": LinkToGroupTemplate },
		methods: {
			selectContext(res) {
				this.$emit("selectContext", res);
			},

			selectProfil(res) {
				this.$emit("selectProfil", res);
			},

			selectDevice(res) {
				this.$emit("selectDevice", res);
			},
		},
	};
</script>

<style scoped>
	.selection_container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: stretch;
	}

	.selection_container .section {
		width: 33%;
		border: 1px solid grey;
		border-radius: 4% 4% 0 0;
		padding: 15px;
	}

	.selection_container .middle {
		width: 49%;
		border: 1px solid grey;
		border-radius: 4% 4% 0 0;
		padding: 15px;
	}
</style>
