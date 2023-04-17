/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"exed/com/quaotamanagerapproval/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});