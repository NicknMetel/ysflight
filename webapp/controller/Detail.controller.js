sap.ui.define([
    "ysflight/controller/BaseController",
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/m/MessageToast',
    'sap/ui/core/Element',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox'
],
    function (Controller, MessagePopover, MessageItem, MessageToast, Element, JSONModel,MessageBox) {
        "use strict";

        return Controller.extend("ysflight.controller.Detail", {
            onInit: function () {
                
                this.getOwnerComponent().getRouter()
                    .getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);

                // this.oView = this.getView();
                // this._oMessageManager = sap.ui.getCore().getMessageManager();

                // this._oMessageManager.registerObject(this.oView.byId("idObjectPageSectionD"), true);
                // this.oView.setModel(this._oMessageManager.getMessageModel(), "message");

                // this._attachValidationEvents();
                // this._createMessagePopover();                    
            },
            //  _attachValidationEvents: function () {
            //     const aFieldIds = ["Carrid", "Connid", "Fldate"]; // 필수 필드 ID들
            //     aFieldIds.forEach(sId => {
            //         const oField = this.oView.byId(sId);
            //         if (oField) {
            //             oField.attachChange(() => this._validateField(oField));
            //         }
            //     });
            // },
            // _validateField: function (oCtrl) {
            //     const oMessageManager = this._oMessageManager;
            //     const sValue = oCtrl.getValue ? oCtrl.getValue() : "";
            //     const sMessage = "필수값을 입력해 주세요.";

            //     // 기존 메시지 제거
            //     const aMessages = oMessageManager.getMessageModel().getData().filter(
            //         m => m.controlId === oCtrl.getId()
            //     );
            //     oMessageManager.removeMessages(aMessages);

            //     if (!sValue.trim()) {
            //         oCtrl.setValueState(ValueState.Error);
            //         oCtrl.setValueStateText(sMessage);
            //         oMessageManager.addMessages(new Message({
            //             message: sMessage,
            //             type: MessageType.Error,
            //             target: "/" + oCtrl.getId(),
            //             processor: oCtrl,
            //             controlId: oCtrl.getId()
            //         }));
            //     } else {
            //         oCtrl.setValueState(ValueState.None);
            //     }
            // },

            // _createMessagePopover: function(){
            //     var that = this;
            //     this.oMP = new MessagePopover({
            //         activeTitlePress: function(oEvent){
            //             var oItem = oEvent.getParameter("item"),
            //                 oPage = that.oView.byId("idObjectPageLayoutD"),
            //                 oMessage = oItem.getBindingContext("message").getObject(),
            //                 oControl = Element.registry.get(oMessage.getControlId());
            //             if(oControl){
            //                 oPage.scrollToSection(oControl.sId, 200, [0, -100]);
            //                 setTimeout(function(){
            //                     oControl.focus();
            //                 }, 300);
            //             }
            //         },
            //        items: {
            //             path: "message>/",
            //             template: new MessageItem({
            //                 title: "{message>message}",
            //                 subtitle: "{message>additionalText}",
            //                 groupName: {parts: [{path: 'message>controlIds'}], formatter: this.getGroupName},
            //                 activeTitle: {parts: [{path: 'message>controlIds'}], formatter: this.isPositionable},
            //                 type: "{message>type}",
            //                 counter: "{message>counter}"
            //             })
            //         }
            //     });
                
            //     // Add message popover as dependent to view
            //     this.oMP._oMessageView.setGroupItems(true);
            //     this.getView().byId("_IDGenButton0D").addDependent(this.oMP);
            // },
            // handleMessagePopoverPress: function(oEvent) {
            //     if(!this.oMP){
            //         this.createMessagePopover();
            //     }
            //     this.oMP.toggle(oEvent.getSource());
            // },
            // getGroupName: function(sControlIds) {
            //     if (!sControlIds || sControlIds.length === 0) {
            //         return "(No control IDs)";
            //     }

            //     var sControlId = sControlIds[0];
            //     var oControl = Element.registry.get(sControlId);
            //     if (!oControl) {
            //         return "(Control not found)";
            //     }

            //     var oCurrent = oControl;
            //     var sSubSectionTitle = null;
            //     var sSectionTitle = null;

            //     while (oCurrent) {
            //         var sType = oCurrent.getMetadata().getName();

            //         if (!sSubSectionTitle && sType === "sap.uxap.ObjectPageSubSection") {
            //             sSubSectionTitle = oCurrent.getTitle();
            //         }

            //         if (!sSectionTitle && sType === "sap.uxap.ObjectPageSection") {
            //             sSectionTitle = oCurrent.getTitle();
            //         }

            //         if (sSubSectionTitle && sSectionTitle) {
            //             break;
            //         }

            //         oCurrent = oCurrent.getParent();
            //     }
            //     return (sSectionTitle || "(Section not found)") + ", " + (sSubSectionTitle || "(SubSection not found)");
            // },

            // isPositionable : function (sControlId){
            //     return sControlId ? true : true;
            // },   

            _onObjectMatched: function(oEvent){
                this.initFlagSetModel(false);
                this._sKey = "/" + oEvent.getParameter("arguments").key;
                this.getView().bindElement({
                    path: this._sKey
                });
            },
            handleSave: function(oEvent){
                //var oButton = this.getView().byId("_IDGenButton0D");
                var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle(),
                    oView = this.getView(),
                    oModel = oView.getModel(),
                    oSmartForm = oView.byId("idForm");

                if(oSmartForm.check().length  > 0){
                    MessageBox.error(oResourceBundle.getText("msgCheckMandatory"));
                    // setTimeout(function(){
                    //     this.oMP.openBy(oButton);
                    // }.bind(this), 100);

                    return;
                };
                oModel.submitChanges({
                    success: function(oData, oResp) {
                        MessageToast.show(oResourceBundle.getText("msgSaveSuccessfully"));
                        this.navTo("List", null, false);
                    }.bind(this),
                    error: function(oError) {
                        if (oError.statusCode === 500) {
                            MessageToast.show(oResourceBundle.getText("msgUpdateError"));
                        } else {
                            MessageToast.show(JSON.parse(oError.responseText).error.message.value);
                        }
                    }
                });
            },
            handleEdit: function() {
                var oModel = this.getView().getModel();
                if (oModel.hasPendingChanges()){
                    oModel.resetChanges();
                }
                var oFlagSet = this.getView().getModel("flagSet");
                oFlagSet.setProperty("/isEdit", !oFlagSet.getProperty("/isEdit"));
            },
            handleDelete: function(oEvent){
                var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                var oDialog = new sap.m.Dialog({
                    title: oResourceBundle.getText("msgDeleteConfirmTitle"),
                    type: "Message",
                    content: new sap.m.Text({
                        text: oResourceBundle.getText("msgDeleteConfirmMsg")
                    }),
                    beginButton: new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        text: oResourceBundle.getText("btnDelete"),
                        press: function(){
                            this._deleteData();
                            oDialog.close();
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: oResourceBundle.getText("btnCancel"),
                        press: function(){
                            oDialog.close();
                        }
                    })
                });
                oDialog.open();
            },
            _deleteData: function(){
                var oModel = this.getView().getModel(),
                    sPath = this.getView().getBindingContext().getPath();
                oModel.remove(sPath, {
                    success: function(){
                        this.navTo("List", null, false);
                    }.bind(this),
                    error: function(oError) {
                        if (oError.statusCode === "400") {
                            var oMsg = JSON.parse(oError.responseText);
                            MessageBox.error(oMsg.error.message.value);
                        }
                    }
                });
            },
            handleCancel: function(oEvent){
                var oModel = this.getView().getModel();
                if (oModel.hasPendingChanges()){
                    oModel.resetChanges();
                }
                this.navTo("List", null, false);
            }
        });
    });
