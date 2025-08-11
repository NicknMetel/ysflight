sap.ui.define([
    "ysflight/controller/BaseController",
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/m/MessageToast',
    'sap/ui/core/Element'
],
    function (Controller, MessagePopover, MessageItem, MessageToast, Element) {
        "use strict";

        return Controller.extend("ysflight.controller.Create", {
            onInit: function () {
                this.oView = this.getView();
                this.initFlagSetModel(true);
                this._oMessageManager = sap.ui.getCore().getMessageManager();

                this.getOwnerComponent().getRouter()
                    .getRoute("Create").attachPatternMatched(this._onObjectMatched, this);

                this._oMessageManager.registerObject(this.oView.byId("idObjectPageSection"), true);
                this.oView.setModel(this._oMessageManager.getMessageModel(), "message");

                this._attachValidationEvents();
                this._createMessagePopover();


                //Initialize Message Manager
                // this.oView = this.getView();
                // this._oMessageManager = sap.ui.getCore().getMessageManager();
                // this._oMessageManager.registerObject(this.oView.byId("idObjectPageSection"), true);
               
                // this.getView().setModel(this._oMessageManager.getMessageModel(), "message");
                // this.createMessagePopover();
            },
            _attachValidationEvents: function () {
                const aFieldIds = ["Carrid", "Connid", "Fldate"]; // 필수 필드 ID들
                aFieldIds.forEach(sId => {
                    const oField = this.oView.byId(sId);
                    if (oField) {
                        oField.attachChange(() => this._validateField(oField));
                    }
                });
            },
            _validateField: function (oCtrl) {
                const oMessageManager = this._oMessageManager;
                const sValue = oCtrl.getValue ? oCtrl.getValue() : "";
                const sMessage = "필수값을 입력해 주세요.";

                // 기존 메시지 제거
                const aMessages = oMessageManager.getMessageModel().getData().filter(
                    m => m.controlId === oCtrl.getId()
                );
                oMessageManager.removeMessages(aMessages);

                if (!sValue.trim()) {
                    oCtrl.setValueState(ValueState.Error);
                    oCtrl.setValueStateText(sMessage);
                    oMessageManager.addMessages(new Message({
                        message: sMessage,
                        type: MessageType.Error,
                        target: "/" + oCtrl.getId(),
                        processor: oCtrl,
                        controlId: oCtrl.getId()
                    }));
                } else {
                    oCtrl.setValueState(ValueState.None);
                }
            },

            _createMessagePopover: function(){
                var that = this;
                this.oMP = new MessagePopover({
                    activeTitlePress: function(oEvent){
                        var oItem = oEvent.getParameter("item"),
                            oPage = that.oView.byId("idObjectPageLayout"),
                            oMessage = oItem.getBindingContext("message").getObject(),
                            oControl = Element.registry.get(oMessage.getControlId());
                        if(oControl){
                            oPage.scrollToSection(oControl.sId, 200, [0, -100]);
                            setTimeout(function(){
                                oControl.focus();
                            }, 300);
                        }
                    },
                   items: {
                        path: "message>/",
                        template: new MessageItem({
                            title: "{message>message}",
                            subtitle: "{message>additionalText}",
                            groupName: {parts: [{path: 'message>controlIds'}], formatter: this.getGroupName},
                            activeTitle: {parts: [{path: 'message>controlIds'}], formatter: this.isPositionable},
                            type: "{message>type}",
                            counter: "{message>counter}"
                        })
                    }
                });
                
                // Add message popover as dependent to view
                this.oMP._oMessageView.setGroupItems(true);
                this.getView().byId("_IDGenButton0").addDependent(this.oMP);
            },
            handleMessagePopoverPress: function(oEvent) {
                if(!this.oMP){
                    this.createMessagePopover();
                }
                this.oMP.toggle(oEvent.getSource());
            },
            getGroupName: function(sControlIds) {
                if (!sControlIds || sControlIds.length === 0) {
                    return "(No control IDs)";
                }

                var sControlId = sControlIds[0];
                var oControl = Element.registry.get(sControlId);
                if (!oControl) {
                    return "(Control not found)";
                }

                var oCurrent = oControl;
                var sSubSectionTitle = null;
                var sSectionTitle = null;

                while (oCurrent) {
                    var sType = oCurrent.getMetadata().getName();

                    if (!sSubSectionTitle && sType === "sap.uxap.ObjectPageSubSection") {
                        sSubSectionTitle = oCurrent.getTitle();
                    }

                    if (!sSectionTitle && sType === "sap.uxap.ObjectPageSection") {
                        sSectionTitle = oCurrent.getTitle();
                    }

                    if (sSubSectionTitle && sSectionTitle) {
                        break;
                    }

                    oCurrent = oCurrent.getParent();
                }
                return (sSectionTitle || "(Section not found)") + ", " + (sSubSectionTitle || "(SubSection not found)");
            },

            isPositionable : function (sControlId){
                return sControlId ? true : true;
            },            

            _onObjectMatched: function(oEvent){
                var oModel = this.getView().getModel();
                oModel.metadataLoaded().then(function(){
                    var oContext = oModel.createEntry("SflightEntitySet", null);
                    this.getView().bindElement({
                        path: oContext.getPath()
                    });
                }.bind(this));

            },
        
            // handleSave: function(oEvent){
            //     // var oButton = this.byId("_IDGenButton0");
            //     // var oView = this.getView();
            //     // var oModel = oView.getModel();
            //     // var oMetaModel = oModel.getMetaModel();
            //     // var oMessageManager = this._oMessageManager;
            //     // var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //     // oMessageManager.removeAllMessages(); // 메시지 초기화

            //     // // 📍 1. 메타데이터 기준 필수 속성 추출
            //     // var sEntitySet = "SflightEntitySet"; // 모델에 맞게 수정
            //     // var sEntityTypeName = oMetaModel.getODataEntitySet(sEntitySet).entityType;
            //     // var oEntityType = oMetaModel.getODataEntityType(sEntityTypeName);

            //     // if (!oEntityType) {
            //     //     MessageToast.show("엔티티 정보를 찾을 수 없습니다.");
            //     //     return;
            //     // }

            //     // var aMandatoryProps = oEntityType.property
            //     //     .filter(function(prop){ return prop.nullable === "false"; })
            //     //     .map(function(prop){ return prop.name; });

            //     // // 📍 2. 필드 유효성 검사
            //     // var aInvalidFields = [];
            //     // aMandatoryProps.forEach(function(sProp) {
            //     // // SmartField ID는 "idSmartField" + index 또는 속성명과 매칭되도록 사전에 설정되어야 함
            //     //     const oCtrl = oView.byId(sProp); // 또는 "idSmartField_" + sProp

            //     //     if (!oCtrl || !oCtrl.getVisible || !oCtrl.getVisible()) return;

            //     //     const vValue = oCtrl.getValue ? oCtrl.getValue() : null;
            //     //     if (!vValue || String(vValue).trim() === "") {
            //     //         aInvalidFields.push(oCtrl);
            //     //         oCtrl.setValueState(sap.ui.core.ValueState.Error);
            //     //         oCtrl.setValueStateText(`${sProp} 값을 입력해 주세요.`);

            //     //         oMessageManager.addMessages(new sap.ui.core.message.Message({
            //     //             message: `${sProp} 값을 입력해 주세요.`,
            //     //             type: sap.ui.core.MessageType.Error,
            //     //             target: "/" + oCtrl.getId(),
            //     //             processor: oCtrl,
            //     //             controlId: oCtrl.getId()
            //     //         }));
            //     //     }else{
            //     //         oCtrl.setValueState(sap.ui.core.ValueState.None);
            //     //     }
                    
            //     //     // const aSmartFields = sap.ui.core.Element.registry.getAll().filter(function(ctrl) {
            //     //     //     return ctrl.getMetadata &&
            //     //     //         ctrl.getMetadata().getName() === "sap.ui.comp.smartfield.SmartField" &&
            //     //     //         ctrl.getBinding &&
            //     //     //         ctrl.getBinding("value") &&
            //     //     //         ctrl.getBinding("value").getPath().split("/").pop() === sProp;
            //     //     // });
            //     //     // var aSmartFields = that.byId("idSmartField1");

            //     //     // aSmartFields.forEach(function(oCtrl) {
            //     //     //     if (!oCtrl.getVisible || !oCtrl.getVisible()) return;

            //     //     //     const vValue = oCtrl.getValue ? oCtrl.getValue() : null;
            //     //     //     if (!vValue || String(vValue).trim() === "") {
            //     //     //         aInvalidFields.push(oCtrl);
            //     //     //         oMessageManager.addMessages(new sap.ui.core.message.Message({
            //     //     //             message: `${sProp} 값을 입력해 주세요.`,
            //     //     //             type: sap.ui.core.MessageType.Error,
            //     //     //             target: "/" + oCtrl.getId(),
            //     //     //             processor: oCtrl,
            //     //     //             controlId: oCtrl.getId()
            //     //     //         }));
            //     //     //     }
            //     //     // });
            //     // });

            //     // // 📍 3. 오류 있으면 메시지 팝오버 표시 + 저장 중단
            //     // if (aInvalidFields.length > 0){
            //     //     setTimeout(function(){
            //     //         this.oMP.openBy(oButton);
            //     //     }.bind(this), 100);
            //     //     return;
            //     // }

            //     const oButton = this.byId("_IDGenButton0");
            //     const oModel = this.getView().getModel();
            //     var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                
            //     if (this._oMessageManager.getMessageModel().getData().some(m => m.type === "Error")) {
            //         setTimeout(() => this.oMP.openBy(oButton), 100);
            //         return;
            //     }


            //     // 📍 4. 검증 통과 → 저장 처리
            //     oModel.submitChanges({
            //         success: function(oData, oResp) {
            //             MessageToast.show(oResourceBundle.getText("msgSaveSuccessfully"));
            //             this.getOwnerComponent().getRouter().navTo("List", null, false);
            //         }.bind(this),
            //         error: function(oError) {
            //             if (oError.statusCode === 500) {
            //                 MessageToast.show(oResourceBundle.getText("msgUpdateError"));
            //             } else {
            //                 MessageToast.show(JSON.parse(oError.responseText).error.message.value);
            //             }
            //         }
            //     });

            // },


            handleSave: function(oEvent){
                var oButton = this.getView().byId("_IDGenButton0");
                var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle(),
                    oView = this.getView(),
                    oModel = oView.getModel(),
                    oSmartForm = oView.byId("idForm");

                if(oSmartForm.check().length  > 0){
                    setTimeout(function(){
                        this.oMP.openBy(oButton);
                    }.bind(this), 100);

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

            handleCancel: function(oEvent){
                var oModel = this.getView().getModel();
                if (oModel.hasPendingChanges()){
                    oModel.resetChanges();
                }
                this.navTo("List", null, false);
            }
        });
    });
