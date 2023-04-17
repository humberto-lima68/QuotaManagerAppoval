sap.ui.define([
	"exed/com/quaotamanagerapproval/controller/BaseController",
	"sap/m/DialogType", "sap/ui/core/ValueState", "sap/m/Dialog", "sap/m/Button", "sap/m/ButtonType",
	"sap/m/Text", "sap/ui/model/json/JSONModel"

], function (BaseController, DialogType, ValueState, Dialog, Button, ButtonType, Text, JSONModel) {
	"use strict";

	var zuserid;
	var zchave;
	var sObjectId;
	var oBusyDialog = new sap.m.BusyDialog();

	return BaseController.extend("exed.com.quaotamanagerapproval.controller.ResumoAprovacao", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf as.view.ResumoAprovacao
		 */
		onInit: function () {
			this.getRouter().getRoute("ResumoAprovacao").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			// MATCH DE TELA, CARREGANDO INFO DE CAMPOS 
			zchave = oEvent.getParameter("arguments").Zchave;
			this.bindatela(zchave);

			// FILTRO PARA SERVICO DE MARTERIAS, CARREGANDO INFO PARA TABELA.

			//	var sObjectId = oEvent.getParameter("arguments").Skup;
			sObjectId = JSON.parse(atob(oEvent.getParameter("arguments").Skup));
			zuserid = oEvent.getParameter("arguments").Zuserid;

			//		this.getView().byId("idTitleDependentes5").setText(" Solicitações " + "(" + zuserid + ")");

			var valor = sObjectId;
			var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, valor);
			var filter1 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, zuserid);
			var table = this.getView().byId("tableResumoAprovacao");
			table.getBinding("items").filter([filter, filter1]);

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

		buscaInfoDetail: function () {
			var tabelaResumo = this.getView().byId("tableResumoAprovacao");
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
					nomeTabelaResumo = tabelaResumo.getItems()[j].getCells()[3].getProperty("title");
					if (nomeTabelaResumo === nomeResumo) {
						idVolume = "";
						idVolume = tabelaResumo.getItems()[j].getCells()[2].getId();
						this.getView().byId(idVolume).setValue(valorResumo);
					}
				}
			}

		},

		onEdit: function () {
			var tabelaResumo = this.getView().byId("tableResumoAprovacao");
			var length = tabelaResumo.getItems().length;
			var id;
			var idDisponivel;

			for (var i = 0; i < length; i++) {
				id = tabelaResumo.getItems()[i].getCells()[2].getId();
				idDisponivel = tabelaResumo.getItems()[i].getCells()[1].getId();
				this.getView().byId(id).setEditable(true);
				this.getView().byId(idDisponivel).setVisible(true);
			}

			this.getView().byId("buttonCancel").setVisible(true);
			this.getView().byId("buttonEdit").setVisible(false);
			this.getView().byId("buttonSave").setVisible(true);
			this.getView().byId("idColumnSaldo").setVisible(true);

			this.calculaTotal();
		},

		onCancela: function () {
			var tabelaResumo = this.getView().byId("tableResumoAprovacao");
			var length = tabelaResumo.getItems().length;
			var id;
			var idDisponivel;

			for (var i = 0; i < length; i++) {
				id = tabelaResumo.getItems()[i].getCells()[2].getId();
				idDisponivel = tabelaResumo.getItems()[i].getCells()[1].getId();
				this.getView().byId(id).setEditable(false);
				this.getView().byId(idDisponivel).setVisible(false);
			}

			this.getView().byId("buttonCancel").setVisible(false);
			this.getView().byId("buttonEdit").setVisible(true);
			this.getView().byId("buttonSave").setVisible(false);
			this.getView().byId("idColumnSaldo").setVisible(false);
		},

		calculaTotal: function () {
			var tabelaResumo = this.getView().byId("tableResumoAprovacao");
			var length = tabelaResumo.getItems().length;
			var total = 0;
			total = parseFloat(total, 2);
			var valor;
			var id;

			for (var i = 0; i < length; i++) {
				id = tabelaResumo.getItems()[i].getCells()[2].getId();
				valor = this.getView().byId(id).getValue();
				valor = parseFloat(valor, 2);
				if (valor > 0) {
					total = total + valor;
				}
			}

			total = parseFloat(total).toFixed(3);
			total = total + " Tons";
			this.getView().byId("idTotal").setText(total);
			this.getView().byId("ObjectListItemResumoKunn2Name1").setNumber(total);
		},

		onSave: function () {
			this.gravaArray();
			this.onCancela();
			this.calculaTotal();
		},

		validaConteudo: function () {
			var lista = this.getView().byId("tableResumoAprovacao");
			var length = lista.getItems().length;
			var nome;
			var valor;
			var valida;

			for (var i = 0; i < length; i++) {
				nome = lista.getItems()[i].getCells()[3].getProperty("title");
				valor = lista.getItems()[i].getCells()[2].getProperty("value");

				if (valor == 0) {
					valida = 0;
				} else {
					valida = 1;
					return valida;
				}

			}

			return valida;

		},

		gravaArray: function () {
			var tabela = this.getView().byId("tableResumoAprovacao");
			var length = tabela.getItems().length;
			var nome;
			var valor;
			var arrayVolume = this.buscarArrayVolume();
			var lengthArray = arrayVolume.length;
			var nomeArray;
			var valida;
			var sai = 0;
			/*Valida Valores inicio
			 */
			var messagem = " Campo quantidade está vázio !";
			var validaconteudo = this.validaConteudo();
			var saldo;
			var arraySaldo;

			if (validaconteudo == 0) {
				sap.m.MessageBox.error(messagem, {
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function (sAction) {}

				});

			}

			/*Valida Valores fim
			 */

			for (var i = 0; i < length; i++) {
				nome = tabela.getItems()[i].getCells()[3].getProperty("title");
				valor = tabela.getItems()[i].getCells()[2].getProperty("value");

				/*Inicio*/
				saldo = tabela.getItems()[i].getCells()[1].getProperty("text");

				arraySaldo = saldo.split(":");
				saldo = arraySaldo[1];
				saldo = saldo.trim();
				saldo = parseFloat(saldo, 2);

				if (valor > saldo) {
					sap.m.MessageBox.error("Saldo menor do que o valor aprovado.", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}

					});

					tabela.getItems()[i].getCells()[2].setProperty("valueState", "Error");

					return;
				} else {
					tabela.getItems()[i].getCells()[2].setProperty("valueState", "None");
				}

				/*Fim*/

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
		},

		validaNome: function (inomeArray, inome) {
			if (inomeArray === inome) {
				return 1;
			} else {
				return 0;
			}
		},

		onPressConfirma: function () {

			if (!this.oInfoMessageDialog) {
				this.oInfoMessageDialog = new Dialog({
					type: DialogType.Message,
					//		id: "dialogConfirmaResumo5",
					title: "Confirm",
					showTitle: "false",
					state: ValueState.Information,
					content: new Text({
						text: "Confirm cota approval? "
					}),
					beginButton: new Button({
						text: "Cancel",
						//			id: "botaoCancelarDialog5",
						class: "botaoCancelarDialog",
						press: function () {
							this.oInfoMessageDialog.close();
						}.bind(this)
					}),

					endButton: new Button({
						type: ButtonType.Emphasized,
						//			id: "botaoConfirmarDialog5",
						text: "Confirm",
						press: function () {
							this.oInfoMessageDialog.close();

						    this.enviar();
							// this.atualiza();
							// oBusyDialog.open(0);
							this.sucesso();

						}.bind(this)
					}),

					afterClose: function () {
						//this.oInfoMessageDialog.close();
					}
				});
			}

			this.oInfoMessageDialog.open();

		},

		sucesso: function () {
			var zchave = this.getView().byId("textzchave").getText();
			var zkunn2 = this.getView().byId("textkunn2").getText();
			var zskp = this.getView().byId("textskup").getText();
			var that = this;
			that.getRouter().navTo("AprovaSucesso", {
				Skup: btoa(JSON.stringify(zskp)),
				Kunn2: zkunn2,
				Zchave: zchave,
				Zuserid: zuserid
			}, true);
		},

		onModelChange: function () {
			this.buscaInfoDetail();
			this.calculaTotal();

		},

		atualizaEccApo: function () {
			var oModel = this.getView().getModel();
			var zchave = this.getView().byId("textzchave").getText();
			var zkunn2 = this.getView().byId("textkunn2").getText();

			var Key = "/ECCAPO_COTASet(Zchave='" + zchave + "',Zuserid='" + zuserid + "')";

			var oEntry = {};
			var that = this;
			var zskp = this.getView().byId("textskup").getText();

			oEntry.ZzbrAtpskp = zskp;

			oModel.update(Key, oEntry, {
				success: function (oData, oResponse) {
					if (oResponse.statusCode === 204) {
						oBusyDialog.close();
						that.getRouter().navTo("AprovarSucesso", {
							Skup: btoa(JSON.stringify(zskp)),
							Kunn2: zkunn2,
							Zchave: zchave,
							Zuserid: zuserid
						}, true);
					}
				},
				error: function (oError) {
					oBusyDialog.close();
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

		onTransfere: function () {

			var tabela = this.getView().byId("tableResumoAprovacao");
			var length = tabela.getItems().length;
			var aItems = tabela.getItems();
			var zkunn2;
			var zkunnr;
			var zkunnrName;
			var zskp;
			var zvbeln;
			var zqtde;
			var zpkt;
			var ort01;
			var uom;
			var regio;
			var sucessos = 0;
			var oEntry = {};
			var that = this;
			var oModel = this.getView().getModel();
			var zchave = this.getView().byId("textzchave").getText();
			var Key = "/transferenciaSet(Zchave='" + zchave + "',Zuserid='" + zuserid + "')";

			//Atualiza table para carregar tela de sucesso
			this.montaTabela();

			for (var i = 0; i < length; i++) {

				zqtde = tabela.getItems()[i].getCells()[2].getProperty("value");

				if (zqtde != "") {

					oEntry = {};
					zkunnrName = tabela.getItems()[i].getCells()[0].getProperty("title");
					zskp = oModel.getProperty("ZzbrAtpskp", aItems[i].getBindingContext());
					zkunn2 = oModel.getProperty("Kunn2", aItems[i].getBindingContext());
					zkunnr = oModel.getProperty("Kunnr", aItems[i].getBindingContext());
					zvbeln = oModel.getProperty("Vbeln", aItems[i].getBindingContext());
					zpkt = oModel.getProperty("BrAtppkt", aItems[i].getBindingContext());
					ort01 = oModel.getProperty("Ort01", aItems[i].getBindingContext());
					regio = oModel.getProperty("Regio", aItems[i].getBindingContext());
					uom = oModel.getProperty("Uom", aItems[i].getBindingContext());

					oEntry.Zchave = zchave;
					oEntry.Kunn2 = zkunn2;
					oEntry.Kunnr = zkunnr;
					oEntry.ZzbrAtpskp = zskp;
					oEntry.Vbeln = zvbeln;
					oEntry.BrQtdsolicitada = zqtde;
					oEntry.BrAtppkt = zpkt;
					oEntry.Ort01 = ort01;
					oEntry.Regio = regio;
					oEntry.Uom = uom;
					oEntry.Zuserid = zuserid;

					oModel.update(Key, oEntry, {

						success: function (oData, oResponse) {

							/*	sap.m.MessageBox.success("Reijeição realizado com sucesso.", {
									actions: ["OK", sap.m.MessageBox.Action.CLOSE],
									onClose: function (sAction) {
										that.getView().getModel().refresh(true);
									}
								});*/

							if (oResponse.statusCode === 204) {
								/*that.getRouter().navTo("AprovarSucesso", {
									Skup: zskp,
									Kunn2: zkunn2,
									Zchave: zchave
								}, true);*/
							}

						},

						error: function (oError) {
							var erro = oError;
							erro = erro.responseText;
							var erro2 = JSON.parse(erro);
							var messagem = erro2.error.message.value;
							sap.m.MessageBox.error(messagem, {
								actions: ["OK", sap.m.MessageBox.Action.CLOSE],
								onClose: function (sAction) {}
							});
							return;
						}
					});
				}

			}

		},

		montaTabela: function () {
			var lista = this.getView().byId("tableResumoAprovacao");
			var aItems = lista.getItems();
			var length = aItems.length;
			var table = [];
			var sucessoTable = {};
			var sPath;
			var modelo = lista.getModel();
			// KunnrName, Ort01, Regio, Kunnr, ===== id= qtde

			this.Tabela = [];

			for (var i = 0; i < length; i++) {
				sPath = lista.getItems()[i].getBindingContextPath();
				sPath = sPath.replace("/", "");

				sucessoTable = {
					KunnrName: modelo.oData[sPath].KunnrName,
					Ort01: modelo.oData[sPath].Ort01,
					Regio: modelo.oData[sPath].Regio,
					Kunnr: modelo.oData[sPath].Kunnr,
					Qtde: lista.getItems()[i].getCells()[2].getProperty("value")
				}

				table.push(sucessoTable);
			}

			this.Tabela = table;
			this.carregaLista(this.Tabela);
		},

		enviar: function () {
			var enviar = this.onTransfere();
		},

		atualiza: function () {
			var atualiza = this.atualizaEccApo();
		},

		/*sucesso: function () {
			this.getRouter().navTo("AprovarSucesso");

		},*/
		
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		onVoltar: function () {
			this.getRouter().navTo("DetailAS", {
				Zchave: zchave,
				sku: btoa(JSON.stringify(sObjectId)),
				Zuserid: zuserid
			}, true);
		}

	});

});