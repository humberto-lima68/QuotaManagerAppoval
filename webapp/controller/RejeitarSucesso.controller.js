sap.ui.define([
	"exed/com/quaotamanagerapproval/controller/BaseController",
], function (BaseController) {
	"use strict";

	var zuserid;

	return BaseController.extend("exed.com.quaotamanagerapproval.controller.RejeitarSucesso", {

		onInit: function (oEvent) {

			this.getRouter().getRoute("RejeitarSucesso").attachPatternMatched(this._onObjectMatched, this);

			var sRootPath = jQuery.sap.getModulePath("exed.com.quaotamanagerapproval");
			var sImagePath = sRootPath + "/icone/reject.png";
			var sImagePathSeta = sRootPath + "/icone/reject.png";
	     	 this.getView().byId("idImgSucesso").setSrc(sImagePath);
			// this.getView().byId("idimgSetasucesso").setSrc(sImagePathSeta);

		},

		_onObjectMatched: function (oEvent) {
			// MATCH DE TELA, CARREGANDO INFO DE CAMPOS 
			var zchave = oEvent.getParameter("arguments").Zchave;
			var zsku = oEvent.getParameter("arguments").Sku;
	//		var zsku = JSON.parse(atob(oEvent.getParameter("arguments").Sku));
			
			var zkunn2 = oEvent.getParameter("arguments").Kunn2;
			zuserid = oEvent.getParameter("arguments").Zuserid;

			this.bindatela(zchave, zsku, zkunn2, zuserid);
		},

		bindatela: function (iZchave) {
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("aprova_solicitacaoSet", {
					Zchave: iZchave,
					Zuserid: zuserid
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel();

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {

			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Kunnr,
				sObjectName = oObject.KunnrName,
				oViewModel = this.getModel();

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		onVoltar: function() {
			this.getRouter().navTo("object", {
				objectId : zuserid,
				Zusersubst: "-"
			}, true);
		}

	});

});