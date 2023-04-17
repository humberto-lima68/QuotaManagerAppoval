// 

sap.ui.define([
	"exed/com/quaotamanagerapproval/controller/BaseController",
], function (BaseController) {
	"use strict";

	var globalKunnr;
	var globalSkup;
	var zuserid;

	return BaseController.extend("exed.com.quaotamanagerapproval.controller.AprovaSucesso", {

		onInit: function () {

			this.montaModel();
			this.getRouter().getRoute("AprovaSucesso").attachPatternMatched(this._onObjectMatched, this);

		},

	_onObjectMatched: function (oEvent) {
		
			var kunn2 = oEvent.getParameter("arguments").Kunn2;
			var zchave = oEvent.getParameter("arguments").Zchave;
			var skup = JSON.parse(atob(oEvent.getParameter("arguments").Skup));
			zuserid = oEvent.getParameter("arguments").Zuserid;
			this.bindatela(kunn2, zchave, skup, zuserid);

		},

		montaModel: function () {

			var lista = this.retornaLista();
			var modelo = {};
			var sucesso = [];
			var total = 0;

			for (var i = 0; i < lista.length; i++) {
				sucesso.push({
					KunnrName: lista[i].KunnrName,
					Ort01: lista[i].Ort01,
					Regio: lista[i].Regio,
					Qtde: lista[i].Qtde,
					Kunnr: lista[i].Kunnr
				});
			}

			modelo = {
				sucesso: sucesso
			};

			var newModel = new sap.ui.model.json.JSONModel();
			newModel.setData(modelo);
			this.byId("listSucesso").setModel(newModel);

		},

		bindatela: function (iKunn2, izchave, iSkup, izuserid) {
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("aprova_solicitacaoSet", {
					Zchave: izchave,
					Zuserid: izuserid
				});
				this._bindView("/" + sObjectPath, iSkup);
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

			this.montaModel();
			var sRootPath = jQuery.sap.getModulePath("exed.com.quaotamanagerapproval");
			var sImagePath = sRootPath + "/icone/sucesso.png";
	//		var sImagePathSeta = sRootPath + "/icone/seta.png";
			this.getView().byId("idImgSucesso1").setSrc(sImagePath);
	//		this.getView().byId("idimgSetasucesso1").setSrc(sImagePathSeta);

			this.calculaTotal();

		},

		calculaTotal: function () {
			var tabelaResumo = this.getView().byId("listSucesso");
			var length = tabelaResumo.getItems().length;
			var total = 0;
			total = parseFloat(total, 2);
			var valor;
			var id;

			for (var i = 0; i < length; i++) {
				id = tabelaResumo.getItems()[i].getCells()[1].getId();
				valor = this.getView().byId(id).getValue();
				valor = parseFloat(valor, 2);
				if (valor) {
					total = total + valor;
				}

			}

			total = parseFloat(total).toFixed(3);
			total = total + " Tons";
			this.getView().byId("idTotal").setText(total);
			this.getView().byId("ObjectListItemSucessoZzbrAtpskp").setNumber(total);
		},

		onVoltar: function () {
			this.getRouter().navTo("object", {
				objectId: zuserid,
				Zusersubst: "-"
			}, true);
		}

	});

});

/*sap.ui.define([
	"as/controller/BaseController",
], function (BaseController) {
	"use strict";

	var zuserid;

	return BaseController.extend("as.controller.AprovarSucesso", {

		onInit: function () {

			this.getRouter().getRoute("AprovarSucesso").attachPatternMatched(this._onObjectMatched, this);

			var sRootPath = jQuery.sap.getModulePath("as");
			// var sImagePath = sRootPath + "/icone/check-circle2.png";
			// var sImagePathSeta = sRootPath + "/icone/arrow-down.png";

			var sImagePath     = sRootPath + "/icone/sucesso.png";
			var sImagePathSeta = sRootPath + "/icone/seta2.png";

			this.getView().byId("idImgSucesso1").setSrc(sImagePath);
			this.getView().byId("idimgSetasucesso1").setSrc(sImagePathSeta);

		},

		_onObjectMatched: function (oEvent) {
		
			var kunn2 = oEvent.getParameter("arguments").Kunn2;
			var zchave = oEvent.getParameter("arguments").Zchave;
			var skup = JSON.parse(atob(oEvent.getParameter("arguments").Skup));
			zuserid = oEvent.getParameter("arguments").Zuserid;
			this.bindatela(kunn2, zchave, skup, zuserid);

		},
		
			montaModel: function () {
			
			var lista = this.retornaLista();
			var modelo = {};
			var sucesso = [];
			var total = 0;
			
			for (var i = 0; i < lista.length; i++) {
				sucesso.push({
					KunnrName : lista[i].KunnrName,
					Ort01 : lista[i].Ort01,
					Regio : lista[i].Regio,
					Qtde : lista[i].Qtde,
					Kunnr : lista[i].Kunnr
				});
			}
			
			modelo = {
				sucesso: sucesso
			};

			var newModel = new sap.ui.model.json.JSONModel();
			newModel.setData(modelo);
			this.byId("listSucesso").setModel(newModel);

		},


		bindatela: function (iKunn2, izchave, iSkup, izuserid) {
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("aprova_solicitacaoSet", {
					Zchave: izchave,
					Zuserid: izuserid
				});
				this._bindView("/" + sObjectPath, iSkup);
			}.bind(this));
		},

		_bindView: function (sObjectPath, iSkup) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel();

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this, iSkup),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function (iSkup) {
			
			this.montaModel();

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

			this.executaFiltro(iSkup);

		},

		executaFiltro: function (iSkup) {
			var valor = iSkup;
			var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, valor);
			var filter1 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, zuserid);
			var list = this.getView().byId("listSucesso");
			list.getBinding("items").filter([filter, filter1]);
		},

		buscaInfoAprovar: function () {
			var tabelaResumo = this.getView().byId("listSucesso");
			var length = tabelaResumo.getItems().length;
			var nomeResumo;
			var valorResumo;
			var nomeTabelaResumo;
			var idVolume;
			var arrayVolume = this.buscarArrayVolume();
			var lengthArray = arrayVolume.length;

			for (var i = 0; i < lengthArray; i++) {
				nomeResumo = "";
				valorResumo = "";
				nomeResumo = arrayVolume[i].nome;
				valorResumo = arrayVolume[i].valor;
				valorResumo = parseFloat(valorResumo).toFixed(3);

				if (isNaN(valorResumo)) {
					valorResumo = "";
				}

				for (var j = 0; j < length; j++) {
					nomeTabelaResumo = "";
					nomeTabelaResumo = tabelaResumo.getItems()[j].getCells()[2].getProperty("text");
					if (nomeTabelaResumo === nomeResumo) {
						idVolume = "";
						idVolume = tabelaResumo.getItems()[j].getCells()[1].getId();
						this.getView().byId(idVolume).setValue(valorResumo);
					}
				}
			}
		},

		calculaTotal: function () {
			var tabelaResumo = this.getView().byId("listSucesso");
			var length = tabelaResumo.getItems().length;
			var total = 0;
			total = parseFloat(total, 2);
			var valor;
			var id;

			for (var i = 0; i < length; i++) {
				id = tabelaResumo.getItems()[i].getCells()[1].getId();
				valor = this.getView().byId(id).getValue();
				valor = parseFloat(valor, 2);
				if (valor > 0) {
					total = total + valor;
				}
			}

			total = parseFloat(total).toFixed(3);
			total = total + " Tons";
			this.getView().byId("idTotal").setText(total);
			this.getView().byId("ObjectListItemSucessoZzbrAtpskp").setNumber(total);
		},

		onModelContextChange: function () {
			this.buscaInfoAprovar();
			this.calculaTotal();
		},

		onVoltar: function () {
			this.getRouter().navTo("object", {
				objectId: zuserid,
				Zusersubst: "-"
			}, true);
		}

	});

});*/