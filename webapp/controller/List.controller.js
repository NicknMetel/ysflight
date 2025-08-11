sap.ui.define([
    // "sap/ui/core/mvc/Controller"
    "ysflight/controller/BaseController",
],
    function (Controller) {
        "use strict";

        return Controller.extend("ysflight.controller.List", {
            onInit: function () {

            },
            handleNew:function(){
                this.navTo("Create", null, false);
            },
            handleItemPress: function(oEvent){
                var oTable = oEvent.getSource();
                var oContext = oTable.getSelectedItem().getBindingContext();
                // this.getOwnerComponent().getRouter().navTo("Detail",{
                //     key: oContext.getPath().substr(1)
                // }, false);
                this.navTo("Detail",{
                    key: oContext.getPath().substr(1)
                }, false);
            }
 
        });
    });
