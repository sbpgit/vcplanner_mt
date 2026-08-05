sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/MultiInput",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Token",
    "sap/m/Label",
    "sap/m/HBox",
    "sap/m/Button",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/DateRangeSelection",
    "sap/m/VBox",
    "sap/ui/core/HTML"
], function (Control, MultiInput, Fragment, JSONModel, MessageToast, Token, Label, HBox, Button, Select, Item, DateRangeSelection, VBox, HTML) {
    "use strict";
    window.aSelectedLocations = [];
    return Control.extend("custom.controller.FilterBars", {
        metadata: {
            properties: {
                locationLabel: { type: "string", defaultValue: "Demand Location:" },
                productLabel: { type: "string", defaultValue: "Products" },
                customerGroupLabel: { type: "string", defaultValue: "Customer Group:" },
                characteristicLabel: { type: "string", defaultValue: "Characteristic:" },
                characteristicValueLabel: { type: "string", defaultValue: "Characteristic Value:" },
                versionLabel: { type: "string", defaultValue: "Version Name" },
                scenarioLabel: { type: "string", defaultValue: "Scenario Name" },
                locationWidth: { type: "sap.ui.core.CSSSize", defaultValue: "10rem" },
                productWidth: { type: "sap.ui.core.CSSSize", defaultValue: "10rem" },
                customerGroupWidth: { type: "sap.ui.core.CSSSize", defaultValue: "10rem" },
                characteristicWidth: { type: "sap.ui.core.CSSSize", defaultValue: "10rem" },
                characteristicValueWidth: { type: "sap.ui.core.CSSSize", defaultValue: "10rem" },
                versionWidth: { type: "sap.ui.core.CSSSize", defaultValue: "10rem" },
                scenarioWidth: { type: "sap.ui.core.CSSSize", defaultValue: "10rem" },
            },
            aggregations: {
                _mainLayout: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" }
            },
            events: {
                locationChange: {
                    parameters: {
                        value: { type: "string" },
                        selectedObject: { type: "object" }
                    }
                },
                productChange: {
                    parameters: {
                        value: { type: "string" },
                        selectedObject: { type: "object" }
                    }
                },
                goPress: {}
            }
        },
        init: function () {
            var that = this;
            // Initialize data properties
            this._selectedLocations = [];
            this._selectedProducts = [];
            this._locationData = [];
            this._productData = [];
            this._productLocationMap = {};
            this._allLogData = [];
            // Create controls with custom label rendering for red asterisks
            this._oLocationLabel = this._createLabel(this.getProperty("locationLabel"), false);
            this._oLocationInput = new MultiInput({
                showValueHelp: true,
                valueHelpRequest: function () { that._onValueHelpRequest("location"); },
                width: this.getProperty("locationWidth"),
                tokens: [],
                tokenUpdate: function (oEvent) { that._onTokenUpdate(oEvent, "location"); },
            });
            this._oCustomerGroupLabel = this._createLabel(this.getProperty("customerGroupLabel"), false);
            this._oCustomerGroupInput = new MultiInput({
                showValueHelp: true,
                valueHelpRequest: () => that._onValueHelpRequest("customerGroup"),
                width: this.getProperty("customerGroupWidth"),
                tokens: [],
                tokenUpdate: (oEvent) => that._onTokenUpdate(oEvent, "customerGroup"),
            });
            this._oCharacteristicValueLabel = this._createLabel(this.getProperty("characteristicValueLabel"), false);
            this._oCharacteristicValueInput = new MultiInput({
                showValueHelp: true,
                valueHelpRequest: () => that._onValueHelpRequest("characteristicValue"),
                width: this.getProperty("characteristicValueWidth"),
                tokens: [],
                tokenUpdate: (oEvent) => that._onTokenUpdate(oEvent, "characteristicValue"),
            });
            this._oScenarioLabel = this._createLabel(this.getProperty("scenarioLabel"), true);
            this._oScenarioInput = new MultiInput({
                showValueHelp: true,
                valueHelpRequest: () => that._onValueHelpRequest("scenario"),
                width: this.getProperty("scenarioWidth"),
                tokens: [],
                tokenUpdate: (oEvent) => that._onTokenUpdate(oEvent, "scenario"),
            });
            this._oProductLabel = this._createLabel(this.getProperty("productLabel"), true);
            this._oProductInput = new MultiInput({
                showValueHelp: true,
                valueHelpRequest: function () { that._onValueHelpRequest("product"); },
                width: this.getProperty("productWidth"),
                tokens: [],
                tokenUpdate: function (oEvent) { that._onTokenUpdate(oEvent, "product"); },
            });
            this._oCharacteristicLabel = this._createLabel(this.getProperty("characteristicLabel"), false);
            this._oCharacteristicInput = new MultiInput({
                showValueHelp: true,
                valueHelpRequest: () => that._onValueHelpRequest("characteristic"),
                width: this.getProperty("characteristicWidth"),
                tokens: [],
                tokenUpdate: (oEvent) => that._onTokenUpdate(oEvent, "characteristic"),
            });
            this._oVersionLabel = this._createLabel(this.getProperty("versionLabel"), true);
            this._oVersionInput = new MultiInput({
                showValueHelp: true,
                valueHelpRequest: () => that._onValueHelpRequest("version"),
                width: this.getProperty("versionWidth"),
                tokens: [],
                tokenUpdate: (oEvent) => that._onTokenUpdate(oEvent, "version"),
            });
            this._oModelVersionLabel = this._createLabel("Model Version", true);
            this._oModelVersionSelect = new Select({
                width: "10rem",
                selectedKey: "Active",
                items: [
                    new Item({ key: "Active", text: "Active" }),
                    new Item({ key: "Simulation", text: "Simulation" })
                ]
            });
            // Valid Between Date Range 
            this._oValidBetweenLabel = this._createLabel("Valid Between", true);
            this._oValidDateRange = new DateRangeSelection({
                width: "14rem",
                delimiter: " - ",
                dateValue: new Date("2025-11-07"),
                secondDateValue: new Date("2027-11-07")
            });
            this._createExactLayout();
            this._bDataLoaded = false;
        },

        // Helper method to create labels with red asterisks
        _createLabel: function (sText, bHasAsterisk) {
            if (bHasAsterisk) {
                // Use HTML control for labels with red asterisks
                return new HTML({
                    content: '<div class="custom-label">' + sText + '<span class="required-asterisk">*</span></div>',
                    preferDOM: false
                });
            } else {
                return new Label({
                    text: sText,
                    wrapping: true
                });
            }
        },
        _createExactLayout: function () {
            var that = this;
            var oLeftColumn = new VBox({
                width: "50%",
                class: "sapUiSmallMarginEnd",
                items: [
                    // Demand Location 
                    new VBox({
                        class: "sapUiSmallMarginBottom",
                        items: [
                            this._oLocationLabel,
                            this._oLocationInput
                        ]
                    }),
                    // Customer Group 
                    new VBox({
                        class: "sapUiSmallMarginBottom",
                        items: [
                            this._oCustomerGroupLabel,
                            this._oCustomerGroupInput
                        ]
                    }),
                    // Characteristic Value 
                    new VBox({
                        class: "sapUiSmallMarginBottom",
                        items: [
                            this._oCharacteristicValueLabel,
                            this._oCharacteristicValueInput
                        ]
                    }),
                    // Scenario Name
                    new VBox({
                        class: "sapUiSmallMarginBottom",
                        items: [
                            this._oScenarioLabel,
                            this._oScenarioInput
                        ]
                    })
                ]
            });
            var oRightColumn = new VBox({
                width: "50%",
                class: "sapUiSmallMarginBegin",
                items: [
                    // Products 
                    new VBox({
                        class: "sapUiSmallMarginBottom",
                        items: [
                            this._oProductLabel,
                            this._oProductInput
                        ]
                    }),
                    // Characteristic 
                    new VBox({
                        class: "sapUiSmallMarginBottom",
                        items: [
                            this._oCharacteristicLabel,
                            this._oCharacteristicInput
                        ]
                    }),
                    // Version Name 
                    new VBox({
                        class: "sapUiSmallMarginBottom",
                        items: [
                            this._oVersionLabel,
                            this._oVersionInput
                        ]
                    }),
                    // Model Version 
                    new VBox({
                        class: "sapUiSmallMarginBottom",
                        items: [
                            this._oModelVersionLabel,
                            this._oModelVersionSelect
                        ]
                    }),
                    // Valid Between
                    new VBox({
                        items: [
                            this._oValidBetweenLabel,
                            this._oValidDateRange
                        ]
                    })
                ]
            });
            // Main container with two columns
            var oMainContainer = new HBox({
                width: "100%",
                items: [oLeftColumn, oRightColumn]
            });

            // Go button
            var oGoButtonContainer = new HBox({
                justifyContent: "End",
                width: "100%",
                class: "sapUiMediumMarginTop",
                items: [
                    new Button({
                        text: "Go",
                        type: "Emphasized",
                        press: function () {
                            that.fireGoPress();
                        }
                    })
                ]
            });

            // Final layout
            var oFinalLayout = new VBox({
                width: "100%",
                items: [
                    oMainContainer,
                    oGoButtonContainer
                ]
            });

            this.setAggregation("_mainLayout", oFinalLayout);
        },

        onAfterRendering: function () {
            if (!this._bDataLoaded) {
                this._readAlertsLogData();
                this._bDataLoaded = true;
            }

            // Add CSS for red asterisks after rendering
            this._addCustomCSS();
        },

        _addCustomCSS: function () {
            // custom CSS for red asterisks
            if (!document.getElementById('custom-filterbar-css')) {
                var oHead = document.getElementsByTagName('head')[0];
                var oStyle = document.createElement('style');
                oStyle.id = 'custom-filterbar-css';
                oStyle.type = 'text/css';
                oStyle.innerHTML = `
                    .custom-label {
                        font-family: "72", "72full", Arial, Helvetica, sans-serif;
                        font-size: 0.875rem;
                        color: #32363a;
                        display: inline-block;
                        margin-bottom: 0.25rem;
                    }
                    .required-asterisk {
                        color: #bb0000;
                        font-weight: bold;
                        margin-left: 2px;
                    }
                    .combined-custom-control .sapMDRPicker {
                        max-width: 14rem;
                    }
                    .combined-custom-control .sapMInputBase {
                        max-width: 100%;
                    }
                `;
                oHead.appendChild(oStyle);
            }
        },

        renderer: function (oRM, oControl) {
            oRM.openStart("div", oControl);
            oRM.class("combined-custom-control");
            oRM.style("width", "100%");
            oRM.style("display", "block");
            oRM.style("padding", "1rem");
            oRM.style("background", "#ffffff");
            oRM.style("border-radius", "0.75rem");
            oRM.style("box-shadow", "0 0 6px rgba(0,0,0,0.1)");
            oRM.style("overflow", "hidden"); // Prevent content from going out of box
            oRM.openEnd();

            var oMainLayout = oControl.getAggregation("_mainLayout");
            if (oMainLayout) {
                oRM.renderControl(oMainLayout);
            }

            oRM.close("div");
        },

        _onTokenUpdate: function (oEvent, sType) {
            var removedTokens = oEvent.getParameter("removedTokens");
            var addedTokens = oEvent.getParameter("addedTokens");
            var selectedArray = sType === "location" ? this._selectedLocations : this._selectedProducts;
            var inputControl = sType === "location" ? this._oLocationInput : this._oProductInput;

            if (removedTokens && removedTokens.length) {
                removedTokens.forEach(function (token) {
                    var key = token.getKey();
                    if (key === "*") {
                        selectedArray.length = 0;
                    } else {
                        var index = selectedArray.indexOf(key);
                        if (index > -1) {
                            selectedArray.splice(index, 1);
                        }
                    }
                }, this);
            }
            if (addedTokens && addedTokens.length) {
                addedTokens.forEach(function (token) {
                    var key = token.getKey();
                    if (key === "*") {
                        selectedArray.length = 0;
                        selectedArray.push("*");
                    } else if (selectedArray.indexOf(key) === -1) {
                        if (selectedArray[0] === "*") {
                            selectedArray.length = 0;
                        }
                        selectedArray.push(key);
                    }
                }, this);
            }

            this._updateTokens(sType);

            if (sType === "location") {
                window.aSelectedLocations = selectedArray;
                this.fireLocationChange({
                    value: selectedArray.join(", "),
                    selectedObject: selectedArray
                });
            } else {
                this.fireProductChange({
                    value: selectedArray.join(", "),
                    selectedObject: selectedArray
                });
            }
        },
        _updateTokens: function (sType) {
            var inputControl = sType === "location" ? this._oLocationInput : this._oProductInput;
            var selectedItems = sType === "location" ? this._selectedLocations : this._selectedProducts;
            inputControl.removeAllTokens();
            selectedItems.forEach(function (item) {
                if (item && item.trim() !== "") {
                    inputControl.addToken(new Token({ key: item, text: item }));
                }
            });
            inputControl.setValue("");
        },
        _updateTokensForNewField: function (sType, aSelected) {
            var oInput;
            switch (sType) {
                case "customerGroup": oInput = this._oCustomerGroupInput; break;
                case "characteristic": oInput = this._oCharacteristicInput; break;
                case "characteristicValue": oInput = this._oCharacteristicValueInput; break;
                case "version": oInput = this._oVersionInput; break;
                case "scenario": oInput = this._oScenarioInput; break;
            }
            if (oInput) {
                oInput.removeAllTokens();
                (aSelected || []).forEach(val => oInput.addToken(new sap.m.Token({ key: val, text: val })));
                oInput.setValue("");
            }
        },

        _onValueHelpRequest: function (sType) {
            if (this._bDataLoaded && this._locationData && this._locationData.length > 0) {
                this._openValueHelpDialog(sType);
            } else {
                MessageToast.show("Loading data...");
                this._readAlertsLogData();
            }
        },

        _openValueHelpDialog: function (sType) {
            switch (sType) {
                case "location": this._openLocationDialog(); break;
                case "product": this._openProductDialog(); break;
                case "customerGroup": this._openCustomerGroupDialog(); break;
                case "characteristic": this._openCharacteristicDialog(); break;
                case "characteristicValue": this._openCharacteristicValueDialog(); break;
                case "version": this._openVersionDialog(); break;
                case "scenario": this._openScenarioDialog(); break;
            }
        },
        //  Opens Location value help
        _openLocationDialog: async function () {
            var that = this;
            if (!that._oLocationDialog) {
                var oFragment = await sap.ui.core.Fragment.load({
                    name: "custom.valuehelps.Application",
                    controller: that
                });
                that._oLocationDialog = oFragment;
                var oModel = new sap.ui.model.json.JSONModel({
                    data: []
                });
                that._oLocationDialog.setModel(oModel, "locationModel");
            }
            var oDialog = that._oLocationDialog;
            var oModel = oDialog.getModel("locationModel");
            var selectedIds = that._selectedLocations || [];
            var allData = that._locationData || [];
            var finalList = [{
                LOCATION_ID: "*",
                LOCATION_DESC: "All Locations"
            }].concat(allData.filter(item =>
                item.LOCATION_ID && item.LOCATION_ID !== "*"
            ));
            selectedIds.forEach(id => {
                var found = finalList.some(item => item.LOCATION_ID === id);
                if (!found) {
                    finalList.push({
                        LOCATION_ID: id,
                        LOCATION_DESC: id
                    });
                }
            });
            oModel.setProperty("/data", finalList);
            oModel.refresh(true);
            var items = oDialog.getItems();
            if (items && items.length) {
                items.forEach(item => {
                    var context = item.getBindingContext("locationModel");
                    var locId = context ? context.getProperty("LOCATION_ID") : null;
                    item.setSelected(selectedIds.includes(locId));
                });
            }
            oDialog.open();
        },
        _openCharacteristicDialog: async function () {
            if (!this._oCharacteristicDialog) {
                this._oCharacteristicDialog = await sap.ui.core.Fragment.load({
                    name: "custom.valuehelps.Characteristic",
                    controller: this
                });
                this._oCharacteristicDialog.setModel(new JSONModel({ data: [] }), "characteristicModel");
            }
            this._oCharacteristicDialog.open();
        },

        _openCharacteristicValueDialog: async function () {
            if (!this._oCharacteristicValueDialog) {
                this._oCharacteristicValueDialog = await sap.ui.core.Fragment.load({
                    name: "custom.valuehelps.CharacteristicValue",
                    controller: this
                });
                this._oCharacteristicValueDialog.setModel(new JSONModel({ data: [] }), "characteristicValueModel");
            }
            this._oCharacteristicValueDialog.open();
        },

        //  Opens Product value help
        _openProductDialog: async function () {
            var that = this;
            var filteredProducts = that._filterProductsBySelectedLocations();
            if (!that._oProductDialog) {
                var oFragment = await sap.ui.core.Fragment.load({
                    name: "custom.valuehelps.Product",
                    controller: that
                });
                that._oProductDialog = oFragment;
                var oNewModel = new sap.ui.model.json.JSONModel({ data: [] });
                that._oProductDialog.setModel(oNewModel, "productModel");
            }
            var oDialog = that._oProductDialog;
            var oModel = oDialog.getModel("productModel");
            var selectedValues = that._selectedProducts || [];
            var data = filteredProducts || that._productData || [];
            var finalList = [{
                PRODUCT_ID: "*",
                PRODUCT_DESC: "All Products"
            }].concat(
                data.filter(item => item.PRODUCT_ID && item.PRODUCT_ID !== "*")
            );
            selectedValues.forEach(id => {
                var found = finalList.some(p => p.PRODUCT_ID === id);
                if (!found) {
                    finalList.push({
                        PRODUCT_ID: id,
                        PRODUCT_DESC: id
                    });
                }
            });
            oModel.setProperty("/data", finalList);
            oModel.refresh(true);
            var items = oDialog.getItems();
            if (items && items.length) {
                items.forEach(it => {
                    var context = it.getBindingContext("productModel");
                    var ProdID = context ? context.getProperty("PRODUCT_ID") : null;
                    it.setSelected(selectedValues.includes(ProdID));
                });
            }
            oDialog.open();
        },
        // Function to Filters product list based on selected locations.
        _filterProductsBySelectedLocations: function () {
            var that = this;
            var selectedLocs = window.aSelectedLocations || [];
            if (selectedLocs.includes("*")) {
                return that._allLogData
                    .filter(item => item.LOCATION_ID === "*" && item.PRODUCT_ID)
                    .map(item => ({
                        PRODUCT_ID: item.PRODUCT_ID,
                        PRODUCT_DESC: item.PRODUCT_DESC || item.PRODUCT_ID
                    }));
            } else if (selectedLocs.length > 0) {
                var productIds = [];
                selectedLocs.forEach(function (location) {
                    var ids = that._productLocationMap[location] || [];
                    productIds = productIds.concat(ids);
                });
                return that._productData.filter(prod => productIds.includes(prod.PRODUCT_ID));
            }
            return that._productData;
        },
        _readAlertsLogData: function () {
            var that = this;
            var oModel = this.getModel("logtablemodel");
            oModel.read("/getfactorylocdesc", { // Loads Factory location and product data 
                success: function (oData) {
                    var results = oData.results || [];
                    var locationMap = {};
                    var productMap = {};
                    results.forEach(function (item) { // Process location data and product data
                        if (item.DEMAND_LOC) locationMap[item.DEMAND_LOC] = {
                            LOCATION_ID: item.DEMAND_LOC,
                        };
                        if (item.PRODUCT_ID) {
                            var prodId = item.PRODUCT_ID;
                            productMap[prodId] = {
                                PRODUCT_ID: prodId,
                            };
                        }
                    });
                    var locationData = Object.values(locationMap); // stores location data
                    var productData = Object.values(productMap);  // stores Product data
                    locationData = [{
                        LOCATION_ID: "*",
                        LOCATION_DESC: "All Locations"
                    }].concat(locationData.filter(item => item.LOCATION_ID && item.LOCATION_ID !== "*"));
                    productData = [{
                        PRODUCT_ID: "*",
                        PRODUCT_DESC: "All Products"
                    }].concat(productData.filter(item => item.PRODUCT_ID && item.PRODUCT_ID !== "*"));
                    var productLocationMap = that._createLocationProductMap(results); // Creates location and product mapping
                    that._locationData = locationData;
                    that._productData = productData;
                    that._productLocationMap = productLocationMap;
                    that._allLogData = results;
                    that._bDataLoaded = true;
                },
                error: function () {
                    MessageToast.show("Failed to load data.");
                    that._bDataLoaded = false;
                }
            });
        },
        // function to create mapping between locations and their products
        _createLocationProductMap: function (data) {
            var map = {};
            data.forEach(function (item) {
                var locations = [];
                if (item.DEMAND_LOC) locations.push(item.DEMAND_LOC);
                if (item.LOCATION_ID) locations.push(item.LOCATION_ID);
                locations.forEach(function (loc) {
                    if (loc && item.PRODUCT_ID) {
                        if (!map[loc]) map[loc] = [];
                        if (!map[loc].includes(item.PRODUCT_ID)) map[loc].push(item.PRODUCT_ID);
                    }
                });
            });
            return map;
        },
        // function to select and store location id 
        onConfirmSelection: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("selectedItems") || [];
            var selectedLocations = aSelectedItems.map(function (item) {
                return item.getBindingContext("locationModel").getObject().LOCATION_ID;
            });
            if (selectedLocations.includes("*")) selectedLocations = ["*"];
            this._selectedLocations = selectedLocations;
            window.aSelectedLocations = selectedLocations;
            this._updateTokens("location");
            this.fireLocationChange({
                value: selectedLocations.join(", "),
                selectedObject: selectedLocations
            });
            if (this._oLocationDialog) this._oLocationDialog.close();
        },
        // function to select and store Product id 
        onConfirmProductSelection: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("selectedItems") || [];
            var aSelectedProducts = [];
            aSelectedItems.forEach(function (item) {
                var oContext = item.getBindingContext("productModel");
                if (oContext) {
                    var oProduct = oContext.getObject();
                    if (oProduct && oProduct.PRODUCT_ID) {
                        aSelectedProducts.push(oProduct.PRODUCT_ID);
                    }
                }
            });
            if (aSelectedProducts.includes("*")) {
                aSelectedProducts = ["*"];
            }
            this._selectedProducts = aSelectedProducts;
            this._updateTokens("product");
            this.fireProductChange({
                value: aSelectedProducts.join(", "),
                selectedObject: aSelectedProducts
            });
            if (this._oProductDialog) {
                this._oProductDialog.close();
            }
        },
        // Getters for external access
        getSelectedLocations: function () {
            return this._selectedLocations;
        },
        getSelectedProducts: function () {
            return this._selectedProducts;
        },
        //Opens Customer Group value help
        _openCustomerGroupDialog: async function () {
            var that = this;
            if (!that._oCustomerGroupDialog) {
                var oFragment = await sap.ui.core.Fragment.load({
                    name: "custom.valuehelps.CustomerGroup",
                    controller: that
                });
                that._oCustomerGroupDialog = oFragment;
                var oModel = new sap.ui.model.json.JSONModel({ data: [] });
                that._oCustomerGroupDialog.setModel(oModel, "customerGroupModel");
            }

            var oModel = this.getModel("logtablemodel");
            oModel.read("/getCustgroup", {
                success: function (oData) {
                    var results = oData.results;
                    that._oCustomerGroupDialog.getModel("customerGroupModel").setProperty("/data", results);
                    that._oCustomerGroupDialog.open();
                },
                error: function () {
                    MessageToast.show("Failed to load Customer Group data");
                }
            });
        },
        // function to select and store CustomerGroup data 
        onConfirmCustomerGroupSelection: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("selectedItems") || [];
            var selectedGroups = aSelectedItems.map(item =>
                item.getBindingContext("customerGroupModel").getObject().CUSTGROUP
            );
            if (selectedGroups.includes("*")) selectedGroups = ["*"];
            this._selectedCustomerGroups = selectedGroups;
            this._updateTokensForNewField("customerGroup", selectedGroups);
            if (this._oCustomerGroupDialog) this._oCustomerGroupDialog.close();
        },
        // function to load scenario and version name data 
        _loadIbpVerScnData: function (callback) {
            var that = this;
            // If already loaded, return cached data via callback
            if (that._ibpVerScnData) {
                if (callback) callback(that._ibpVerScnData);
                return;
            }

            // Read OData only once
            var oModel = that.getModel("logtablemodel");
            oModel.read("/getIbpVerScn", { // loads scenario and version names 
                success: function (oData) {
                    var results = oData.results || [];
                    that._ibpVerScnData = results; // Cache for reuse
                    if (callback) callback(results);
                },
                error: function () {
                    sap.m.MessageToast.show("Failed to load Version/Scenario data");
                }
            });
        },
        // //  Opens Version name value help
        _openVersionDialog: function () {
            var that = this;
            var openDialog = function () {
                that._loadIbpVerScnData(function (results) {
                    var seen = new Set();
                    var uniqueVersions = [];
                    for (var i = 0; i < results.length; i++) {
                        var item = results[i];
                        var key = item.VERSION_NAME;
                        if (!seen.has(key)) {
                            seen.add(key);
                            uniqueVersions.push(item);
                        }
                    }
                    that._oVersionDialog.getModel("versionModel").setProperty("/data", uniqueVersions);
                    that._oVersionDialog.open();
                });
            };
            if (!that._oVersionDialog) {
                sap.ui.core.Fragment.load({
                    name: "custom.valuehelps.Version",
                    controller: that
                }).then(function (oFragment) {
                    that._oVersionDialog = oFragment;
                    that._oVersionDialog.setModel(new sap.ui.model.json.JSONModel({ data: [] }), "versionModel");
                    openDialog();
                });
            } else {
                openDialog();
            }
        },
        // function to select and store Version names 
        onConfirmVersionSelection: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("selectedItems") || [];
            var selectedVersions = aSelectedItems.map(item =>
                item.getBindingContext("versionModel").getObject().VERSION_NAME
            );
            if (selectedVersions.includes("*")) selectedVersions = ["*"];
            this._selectedVersions = selectedVersions;
            this._updateTokensForNewField("version", selectedVersions);
            if (this._oVersionDialog) this._oVersionDialog.close();
        },
        // //  Opens Scenario name value help
        _openScenarioDialog: function () {
            var that = this;
            if (!that._oScenarioDialog) {
                sap.ui.core.Fragment.load({
                    name: "custom.valuehelps.Scenario",
                    controller: that
                }).then(function (oFragment) {
                    that._oScenarioDialog = oFragment;
                    that._oScenarioDialog.setModel(new sap.ui.model.json.JSONModel({ data: [] }), "scenarioModel");
                });
            }
            that._loadIbpVerScnData(function (results) {
                var seen = new Set();
                var uniqueScenarios = [];
                for (var i = 0; i < results.length; i++) {
                    var item = results[i];
                    var key = item.SCENARIO_NAME;
                    if (!seen.has(key)) {
                        seen.add(key);
                        uniqueScenarios.push(item);
                    }
                }
                that._oScenarioDialog.getModel("scenarioModel").setProperty("/data", uniqueScenarios);
                that._oScenarioDialog.open();
            });
        },
        // function to select and store Scenario names 
        onConfirmScenarioSelection: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("selectedItems") || [];
            var selectedScenarios = aSelectedItems.map(item =>
                item.getBindingContext("scenarioModel").getObject().SCENARIO_NAME
            );
            this._selectedScenarios = selectedScenarios;
            // Update tokens in the MultiInput
            this._updateTokensForNewField("scenario", selectedScenarios);
            // Close dialog
            if (this._oScenarioDialog) this._oScenarioDialog.close();
        }

    });
});
