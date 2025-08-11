sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel){
    "use strict";

    return Controller.extend("ysflight.controller.BaseController",{
        navTo: function(sName, oParameters, bReplace){
            this.getOwnerComponent().getRouter().navTo(sName, oParameters, bReplace);
        },
        initFlagSetModel: function(bFlag){
            var oFlagSet = new JSONModel({
                isEdit: bFlag
            });
            this.getView().setModel(oFlagSet,"flagSet");
        }

    });
});