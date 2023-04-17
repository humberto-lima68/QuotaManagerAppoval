sap.ui.define([
	"exed/com/quaotamanagerapproval/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"exed/com/quaotamanagerapproval/model/formatter",
	"sap/m/DialogType", "sap/ui/core/ValueState", "sap/m/Dialog", "sap/m/Button", "sap/m/ButtonType",
	"sap/m/Text"

], function (BaseController, JSONModel, formatter, DialogType, ValueState, Dialog, Button, ButtonType, Text) {
	"use strict";
	var zchave;
	var zuserid;
	var oBusyDialog = new sap.m.BusyDialog();

	return BaseController.extend("exed.com.quaotamanagerapproval.controller.DetailAs", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});

			this.getRouter().getRoute("DetailAs").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").Zchave;
			var Sku = JSON.parse(atob(oEvent.getParameter("arguments").sku));

			zuserid = oEvent.getParameter("arguments").Zuserid;

			//		this.getView().byId("page1").setTitle(" Avaliação " + "(" + zuserid + ")");

			if (sObjectId) {
				if (Sku) {
					this.getModel().metadataLoaded().then(function () {
						var sObjectPath = this.getModel().createKey("aprova_solicitacaoSet", {
							Zchave: sObjectId,
							sku: Sku,
							Zuserid: zuserid
						});
						this._bindView("/" + sObjectPath);
					}.bind(this));
				}
			}

			this.executaFiltro(Sku);

		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

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
				sObjectId = oObject.ZzbrAtpskp,
				sObjectName = oObject.Kunn2Name,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));

			/*         Limpar campo de Input    */
			var list = this.getView().byId("aslist");
			var length = list.getItems().length;
			for (var i = 0; i <= length; i++) {
				var field = list.getItems()[i].getCells()[2].sId;
				if (this.getView().byId(field)) {
					this.getView().byId(field).setValue("");
				}

			}

		},

		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),

				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);

		},

		validaConteudo: function () {
			var tabela = this.getView().byId("aslist");
			var length = tabela.getItems().length;
			var nome;
			var valor;
			var valida;

			for (var i = 0; i < length; i++) {
				nome = tabela.getItems()[i].getCells()[0].getProperty("title");
				valor = tabela.getItems()[i].getCells()[2].getProperty("value");
				valor = parseFloat(valor, 2);

				if (isNaN(valor) || valor == 0) {
					valida = 0;

				} else {
					valida = 1;
					return valida;
				}

			}

			return valida;

		},

		onLiveChange: function (oValue) {
			var newValue = oValue.mParameters.value;

			var id = oValue.mParameters.id;

			while (newValue.indexOf(",") !== -1) {
				newValue = newValue.replace(",", ".");
			}

			// var num = isNaN(newValue);
			// if (num === true) {
			// 	this.byId(id).setValueState("Error");
			// 	this.getView().byId("botaoConfirmar").setVisible(false);
			// 	this.getView().byId("botaoRejeicao").setVisible(false);
			// } else {
			// 	this.byId(id).setValueState("None");
			// 	this.byId(id).setValue(newValue);
			// 	this.getView().byId("botaoConfirmar").setVisible(true);
			// 	this.getView().byId("botaoRejeicao").setVisible(true);
			// }

		},

		onPressContinuar: function () {

			var tabela = this.getView().byId("aslist");
			var length = tabela.getItems().length;
			var nome;
			var valor;
			var arrayVolume = this.buscarArrayVolume(); /*base controller */
			var lengthArray = arrayVolume.length;
			var nomeArray;
			var valida;
			var sai = 0;
			var messagem = " Quantity field is empty !";
			var validaconteudo = this.validaConteudo();
			var saldo;
			var arraySaldo;

			if (validaconteudo == 0) {
				sap.m.MessageBox.error(messagem, {
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function (sAction) {}
				});
				return;
			}

			if (length == 0) {
				sap.m.MessageBox.error("Não há clientes para escolher", {
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function (sAction) {}
				});
				return;
			}

			for (var i = 0; i < length; i++) {
				nome = tabela.getItems()[i].getCells()[0].getProperty("title");
				valor = tabela.getItems()[i].getCells()[2].getProperty("value");

				saldo = tabela.getItems()[i].getCells()[1].getProperty("text");
				/*arraySaldo = saldo.split(":");
				saldo = arraySaldo[1];
				saldo = saldo.trim();*/
				saldo = parseFloat(saldo, 2);

				valor = parseFloat(valor).toFixed(3);

				if (valor === "0" || valor === "0.00" || valor === "0.000" || valor === "0.0" || valor === "0." || valor === ".0" || valor ===
					"-0" || valor < 0) {
					sap.m.MessageBox.error("Informe um valor maior que zero !", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});

					tabela.getItems()[i].getCells()[2].setProperty("valueState", "Error");

					return;
				} else {
					tabela.getItems()[i].getCells()[2].setProperty("valueState", "None");
				}

				if (valor > saldo) {
					sap.m.MessageBox.error("Saldo menor do que o valor remanejado.", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});

					tabela.getItems()[i].getCells()[2].setProperty("valueState", "Error");

					return;
				} else {
					tabela.getItems()[i].getCells()[2].setProperty("valueState", "None");
				}

				if (lengthArray !== 0) {

					for (var j = 0; j < lengthArray; j++) {
						nomeArray = arrayVolume[j].nome;
						valida = this.validaNome(nomeArray, nome);
						if (valida === 1) {
							sai = "1";
						}
					}
					if (sai === 0) {
						arrayVolume.push({
							nome: nome,
							valor: valor
						});
					} else {
						for (var K = 0; K < lengthArray; K++) {
							nomeArray = arrayVolume[K].nome;
							if (nomeArray === nome) {
								arrayVolume[K].valor = valor;
							}
						}
					}
				} else {
					arrayVolume.push({
						nome: nome,
						valor: valor
					});
				}
			}

			this.igualaArrayVolume(arrayVolume);

			/**
			 *  Carregar a tela Resumo Aprovação
			 */

			this.navToView("ResumoAprovacao");
			var skp = this.getView().byId("textskup").getText();
			var kunn2 = this.getView().byId("textkunn2").getText();
			var zchave = this.getView().byId("textzchave").getText();

			this.getRouter().navTo("ResumoAprovacao", {
				Skup: btoa(JSON.stringify(skp)),
				Kunn2: kunn2,
				Zchave: zchave,
				Zuserid: zuserid
			}, true);

		},

		validaNome: function (inomeArray, inome) {
			if (inomeArray === inome) {
				return 1;
			} else {
				return 0;
			}
		},

		onPressRejeicao: function () {
			if (!this.oInfoMessageDialog) {
				this.oInfoMessageDialog = new Dialog({
					type: DialogType.Message,
					id: "dialogConfirmaResumo1",
					class: "dialogConfirmaResumo1",
					title: "Confirm rejection",
					showTitle: "false",
					state: ValueState.Information,
					content: new Text({
						text: "Confirm quota rejection ? "
					}),

					beginButton: new Button({
						text: "Cancel",
						id: "botaoCancelarDialog1",
						class: "botaoCancelarDialog",
						press: function () {
							this.oInfoMessageDialog.close();
						}.bind(this)
					}),

					endButton: new Button({
						type: ButtonType.Emphasized,
						text: "Confirm",
						id: "botaoConfirmarDialog1",
						press: function () {
							this.oInfoMessageDialog.close();
							this.onAtualiza();
							oBusyDialog.open(0);
						}.bind(this)
					}),

					afterClose: function () {
						//this.oInfoMessageDialog.close();
					}
				});
			}

			this.oInfoMessageDialog.open();
		},

		onAtualiza: function (iStatus) {

			var zchave = this.getView().byId("textzchave").getText();
			var zstatus = this.getView().byId("textstatus").getText();
			var aslist = this.byId("aslist");
			var Zgcdoador = aslist.getBindingContext().getProperty("Zgcdoador");
			var that = this;
			var oModel = this.getView().getModel();
			var Key = "/rejeitar_solicitacaoSet(Zchave='" + zchave + "',Zgcdoador='" + Zgcdoador + "',Status='" + zstatus + "')";
			var oEntry = {};

			oEntry.Zchave = zchave;
			oEntry.Status = zstatus;

			oModel.update(Key, oEntry, {

				success: function (oData, oResponse) {
					/*sap.m.MessageBox.success("Reijeição realizado com sucesso.", {
						actions: ["OK", sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							that.getView().getModel().refresh(true);

						}
					});*/
					that.sucesso();

				},
				error: function (oError) {
					var erro = oError;
					erro = erro.responseText;
					var erro2 = JSON.parse(erro);
					var messagem = erro2.error.message.value;
					sap.m.MessageBox.error(messagem, {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});
					return;
				}
			});
		},

		sucesso: function () {

			oBusyDialog.close();
			this.navToView("RejeitarSucesso");

		},

		onSearch: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var skup = this.getView().byId("textskup").getText();

			if (valor) {
				var filter2 = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, skup);
				var filter = new sap.ui.model.Filter("Zsearch", sap.ui.model.FilterOperator.EQ, valor);
				var filter3 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, zuserid);
				var filter4 = new sap.ui.model.Filter("Zoperacao", sap.ui.model.FilterOperator.EQ, "9");
				var list = this.getView().byId("aslist");
				list.getBinding("items").filter([filter, filter2, filter3, filter4]);
			} else {
				this.executaFiltro(skup);
			}
		},

		executaFiltro: function (iSku) {
			var valor = iSku;
			var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, valor);
			var filter1 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, zuserid);
			var list = this.getView().byId("aslist");
			list.getBinding("items").filter([filter, filter1]);

		},
		
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item shld be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		onVoltar: function () {
			this.getRouter().navTo("object", {
				objectId: zuserid,
				Zusersubst: "-"
			}, true);
		},

		/**
		 *  Carregar a telas 
		 */
		navToView: function (iView) {
			var zchave = this.getView().byId("textzchave").getText();
			var kunn2 = this.getView().byId("textkunn2").getText();
			var skup = this.getView().byId("textskup").getText();
			this.getRouter().navTo(iView, {
				Kunn2: kunn2,
				Skup: btoa(JSON.stringify(skup)),
				Zchave: zchave,
				Zuserid: zuserid

			}, true);

		}

	});

});