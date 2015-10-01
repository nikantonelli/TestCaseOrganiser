 Ext.define('Rally.ui.tree.TestOrganiserTree', {
    extend:  Ext.Container ,

    alias: 'widget.testorganisertree',

    mixins: {
        messageable:  Rally.Messageable 
    },

    clientMetrics: [
        {
            beginMethod: '_beforeInitialLoad',
            endMethod: '_initialLoad',
            description: 'initial load'
        },
        {
            beginMethod: 'drawChildItems',
            endMethod: 'drawItems',
            description: 'loaded child records'
        },
        {
            event: 'drag',
            description: 'tree item picked up'
        },
        {
            event: 'drop',
            description: 'tree item dropped'
        }
    ],

    cls: 'rallytree',

    config: {
        /**
         * @cfg {String}
         * The type of model to load as the top level.
         * For example, you could have a tree of user stories and their tasks. The top level model type
         * would be 'userstory'.
         */
        topLevelModel: 'testfolder',

        /**
         * @cfg {String}
         * The attribute used to determine if a record is at the top level.
         * For example, to show user stories that do not have parent, use 'Parent'.
         */
        topLevelParentAttribute: 'Parent',

        /**
         * @cfg {Function}
         * Given a record, return the model types (String) of the child records.
         * For example, if given a user story record, you could return 'userstory' to create a US hierarchy, or
         * 'defect', if you want a tree of User Stories and their defects. Or even return 'userstory' for a user story
         * that has sub user stories, but 'defect' if it only has defects.
         */
        childModelTypesForRecordFn: function(record){
            return [ 'testcase', 'testfolder'];
        },

        /**
         * @cfg {Function}
         * Given a model type, what is the attribute connecting this child to its parent? E.g,
         * if connecting User Stories to the Defects on a User Story, this function would be given a Defect,
         * and this function should return 'Requirement'.
         * This function is used to determine how a child connects to its parent. The child record should have
         * the appropriate attribute set, e.g, a user story child record would have its Parent or its PortfolioItem attribute set.
         */

        givenAParentTypeWhatChildAttributeConnectsChildToThisParentFn: function (model){
            if (model === 'testfolder'){
                return 'Parent';
            }

            if (model === 'testcase'){
                return 'TestFolder';
            }
        },

        /**
         * @cfg {Function}
         * Given a child record, what is the attribute connecting this child to its parent? E.g,
         * if connecting User Stories to the Defects on a User Story, this function would be given a Defect,
         * and this function should return 'Requirement'.
         * This function is used to determine how a child connects to its parent. The child record should have
         * the appropriate attribute set, e.g, a user story child record would have its Parent or its PortfolioItem attribute set.
         */
        givenAChildRecordWhatIsTheAttributeConnectingItToTheParentFn: function(childRecord){
            if(record.get('_type') === 'testcase'){
                return 'TestFolder';
            } else {
                return 'Parent';
            }
        },

        /**
         * @cfg {Function}
         * Given a parent record, what is the attribute connecting a child to this parent? E.g,
         * if connecting User Stories to the Defects on a User Story, this function would be given a User Story,
         * and this function should return 'Requirement'.
         * This function is used to determine how to load child records when expanding. So, given a UserStory parent record,
         * and you want to display the Tasks under them, you should return 'WorkProduct'.
         * @param parentRecord
         * @return {String}
         */
        givenAParentRecordWhatIsTheAttributeConnectingAChildToThisParentFn: function (parentRecord) {
            if(record.get('_type') === 'testfolder'){
                return 'Parent';
            } else {
                return 'TestFolder';
            }
        },

        /**
         * @cfg {Function}
         * Given a child record and a parent record, what is the attribute connecting them, from the child to the parent? E.g,
         * if connecting User Stories to the Defects on a User Story, this function would be given a Defect and a UserStory,
         * and this function should return 'Requirement'.
         * This function is used to determine how to save a DnD action. As such, it won't have a connection between the parent and the child record yet, and
         * this function should return which attribute needs to be set to connect them.
         * @param childRecord
         * @param parentRecord
         * @return {String}
         */
        givenAChildAndParentRecordWhatAttributeShouldConnectTheChildToTheParentFn: function(childRecord, parentRecord){
            if(childRecord.get('_type') === 'testcase'){
                return 'TestFolder';
            }
            if (childRecord.get('_type') === 'testfolder') {
                return 'Parent';
            }
        },

        /**
         * @cfg {Function}
         * A function that returns true if the given record can be expanded
         */
        canExpandFn: function(record){
            return ((record.get('Children') && (record.get('Children').Count > 0)) || (record.get('TestCases') && record.get('TestCases').Count > 0));
        },

        /**
         * @cfg {Boolean}
         * Whether or not this tree supports drag and drop reparenting.
         * If true, must also provide a #dragThisGroupOnMe config function.
         */
        enableDragAndDrop: true,

        /**
         * @cfg {Function}
         * Required to support drag and drop.
         * A function that returns the group name that this record is a member of.
         *
         * By default, returns the type name of the record, like 'hierarchicalrequirement' for userstories, and 'defect' for defects.
         * You will want to change this if type is not specific. For example, you may wish to distinguish accepted user stories from in progress stories.
         * Use in conjunction with the #dragThisGroupOnMeFn config to define DnD rules.
         */
        dragDropGroupFn: function(record){
            return Rally.util.Ref.getOidFromRef(record.get('_type'));
        },

        /**
         * @cfg {Function}
         * Required to support drag and drop.
         * A function that returns the group name of records that are able to be dropped on the passed in record.
         *
         * For example, a tree of user stories would simply return 'hierarchicalrequirement', since
         * user stories can always be parented to other user stories. A tree of user stories and defects would need to have 'hierarchicalrequirement'
         * for the TreeItems representing user stories, but return undefined for defects so they can't be dropped on.
         * @param record the record you need to determine the group for.
         * @return a string representing the drag drop group that can be dragged onto the Rally.ui.tree.TreeItem represented by the passed in record.
         */
        dragThisGroupOnMeFn: function(record){
            if(record.get('_type') === 'testfolder'){
                return [
                    'testcase',
                    'testfolder'
                ];
            }
        },

        /**
         * @cfg {Object}
         * Scope that any passed in function (canExpandFn, etc) is called with.
         */
        scope: undefined,

        /**
         * @cfg {Object}
         * Config for the store used to fetch the top level items in the hierarchy
         */
        topLevelStoreConfig: {

                        fetch: [ 'FormattedID', 'Name', 'Parent', 'Children' , 'TestCases', 'Project'],
                        sorters: [],
                        context: {
                            projectScopeUp: true,
                            projectScopeDown: true
                        }
                    },

        /**
         * @cfg {Object}
         * Config for the store used to fetch the lower level items in the hierarchy
         * Can change depending on what type of children are being loaded.
         * E.g., to show portfolio items and only the associated user stories that are not
         * in an iteration, you would need to add an Iteration filter only for stories, not portfolio items.
         */
        childItemsStoreConfigForParentRecordFn: function(){
            return {};
        },


        /**
         * @cfg {Function}
         * Given a record, returns the configuration for a tree item to draw for the record.
         * Can be used to change how a tree item is rendered at any level.
         * @param record the record for the tree item
         */
        treeItemConfigForRecordFn: function(record){
            var config = {
                selectable: true,
                xtype: 'testtreeitem'
            };

            if(record.get('_type') === 'testfolder'){
                config.storeConfig = {
                    model: '',
                    models: ['testfolder', 'testcase']
                };
            } 

            return config;
        },


        /**
         * @cfg {Boolean}
         * Load the top level of the tree when rendered.
         * If false, call #loadTopLevel to load the top level.
         */
        autoLoadTopLevel: true,


        /**
         * @cfg {String}
         * Text that appears when nothing appears in the tree.
         */
        emptyText: '<p>No Items Found.</p>',

        /**
         * @cfg {Boolean}
         * Set stateful to true to enable the saving of the tree expansion state.
         * Must set a #stateId if you enable stateful.
         */
        stateful: true,
        /**
         * @cfg {String}
         * The ID you want to use for saving state of this tree.
         * State is not saved if stateId is undefined.
         */
        stateId: 'rally-test-tree',

        /**
         * @cfg {Function}
         * Returns a list of actions for the gear menu (a Rally.ui.menu.RecordMenu) for each record.
         * Each action is an Ext.menu.Item configuration.
         * @param record
         * @return {Array}
         */
//            actionsForRecordFn: null,
        actionsForRecordFn: function(record) {

            var items = [
                    {
                        xtype: 'rallyrecordmenuitemedit',
                        record: record
                    },
                    {
                        xtype: 'rallyrecordmenuitemcopy',
                        record: record
                    },
                    {
                        xtype: 'rallyrecordmenuitemaddtoTS',
                        text: 'Add to test set',
                        record: record
                    }
                ];

            if ( record.get('_type') === 'testfolder')
            {
                items.push(
                    {
                        xtype: 'rallyrecordmenuitemaddsubfolder',
                        text: 'Add folder', //I have left it so the user has to add the parent. This is so we can create new toplevel folders
                        record: record
                    });

                items.push(

                    {
                        xtype: 'rallyrecordmenuitemaddtestcase',
                        text: 'Add test case',
                        record: record
                    });

            }

            return items;
        },

        _addSubFolder: function(record){
        },

        listeners: {
            beforerecordsaved: function(source, target) { this.beforeRecordSaved(source, target); }
//                recordsaved: function(record, listeners) { }
        }
    },

    constructor: function(config){
        this.mergeConfig(config);

        if(this.config.stateful){
            if(this.config.stateId){
                this._treeState = Rally.state.SessionStorage.getInstance().get(this.getStateId()) || [];
            } else {
                Ext.Error.raise('A stateId is required if stateful is true.');
            }
        }

        if (!this._treeState){
            this._treeState = [];
            this.saveState();
        }

        this._drawingChildrenCount = 1;

        this.callParent([this.config]);
    },

    initComponent: function(){
        this.callParent(arguments);
        this.addEvents(
                /**
                 * @event
                 * Fired before a record is saved after a drag and drop event.
                 * @param record the record about to be updated
                 * @param newParentRecord the record about to be set as the new 'owner' of the record, based on the
                 * attribute returned by #givenAParentRecordWhatIsTheAttributeConnectingAChildToThisParentFn
                 */
                'beforerecordsaved',

                /**
                 * @event
                 * Fired after the record re-parent has persisted.
                 * @param record the saved record
                 */
                'recordsaved',

                /**
                 * @event
                 * Fired when a tree item is selected
                 * @param treeItem the selected treeItem
                 */
                'itemselected',

                /**
                 * @event
                 * Fired when the top level of the tree has loaded
                 */
                'toplevelload',

                /**
                 * @event
                 * Fired when the tree has finished expanding into it's saved expansion state,
                 * or when the top level has loaded if no state available.
                 */
                'initialload',

                /**
                 * @event
                 * Fired when a tree item is picked up for a DnD action
                 * @param treeItem
                 */
                'drag',

                /**
                 * @event
                 * Fired when a tree item is dropped, no matter if it's a valid drop target or not
                 * @param treeItem
                 */
                'drop',

                /**
                 * @event
                 * Fired when the tree has been updated with new data
                 */
                'refresh'
        );

        var storeConfig = Ext.applyIf(Ext.clone(this.getTopLevelStoreConfig()), {
            model: this.getTopLevelModel(),
            filters: [
                {
                    property: this.getTopLevelParentAttribute(),
                    value: 'null',
                    operator: '='
                }
            ],
            sorters: [
                {
                    property: 'Rank',
                    direction: 'ASC'
                }
            ],
            fetch: this._getDefaultTopLevelFetchFields()
        });

        var store = this.topLevelStore = Ext.create(storeConfig.xtype || 'store.rallywsapidatastore', storeConfig);

        store.on('beforeload', this._beforeInitialLoad, this);
        store.on('load', this.handleParentItemStoreLoad, this);

        if(this.getAutoLoadTopLevel()){
            store.load();
        }

        this.subscribe(this, Rally.Message.objectDestroy, this._onObjectDestroy, this);
        this.subscribe(this, Rally.Message.objectCreate, this._onObjectCreate, this);
        this.subscribe(this, Rally.Message.objectUpdate, this._onObjectUpdate, this);

        this.on('initialload', this._initialLoad, this);
    },
    handleParentItemStoreLoad: function(store, records) {
        this.renderParentRecords(records);
    },
    renderParentRecords: function(records) {
        if (records.length > 0) {
            this.drawItems(records);
        } else {
            this.fireEvent('initialload');
            this.drawEmptyMsg();
        }
        this.fireEvent('toplevelload');
    },
    _beforeInitialLoad: Ext.emptyFn,
    _initialLoad: function () {
        if (this.getStateful()) {
            this._saveTreeStateToSessionStorage();
        }
        this.publish(Rally.Message.treeLoaded);
        if (Rally.BrowserTest) {
            Rally.BrowserTest.publishComponentReady(this);
        }
        this._treeLoaded = true;
    },
    findTreeItemForRecord: function(record){

        var xtype;
        var treeItemConfig = this.getTreeItemConfigForRecordFn().call(this, record);
        if(treeItemConfig){
            xtype = treeItemConfig.xtype;
        }

        if(!xtype){
            return;
        }

        return Ext.Array.filter(this.query(xtype), function(treeItem){
            return treeItem.getRecord().get('_ref') === record.get('_ref');
        })[0];
    },

    findTreeItemForChildRecord: function(childRecord){
        var parentAttribute = this.getGivenAChildRecordWhatIsTheAttributeConnectingItToTheParentFn().call(this, childRecord);
        var parentRef = childRecord.get(parentAttribute) && childRecord.get(parentAttribute)._ref;

        if(parentRef){
            return Ext.Array.filter(this.query('rallytreeitem'), function(treeItem){
                return treeItem.getRecord().get('_ref') === parentRef;
            }, this)[0];
        }
    },

    _onObjectDestroy: function(record){
        //if we show the deleted record, remove it from the tree.
        var treeItem = this.findTreeItemForRecord(record);
        if(treeItem){
            this._removeTreeItem(treeItem);
        }
    },

    _onObjectCreate: function(record) {
        this._insertRecord(record, false);
    },

    _refresh: function(callback) {
        if (callback) {
            this.on('toplevelload', callback, this, {single: true});
        }
        this.removeAll();
        this.topLevelStore.load();
    },

    /**
     * Reload the data in the tree
     */
    refresh: function(callback) {
        this._refresh(callback);
    },

    _insertRecord: function(record, forceParent) {
        var parentTreeItem = this.findTreeItemForChildRecord(record);
        if (!forceParent || parentTreeItem) {
            var treeItem = this._createTreeItem(record);
            this.insertItem(treeItem, parentTreeItem);
        }
    },

    _onObjectUpdate: function(record) {
        var parentTreeItem = this.findTreeItemForChildRecord(record);
        if (parentTreeItem) {
            this._addTreeItemToSessionStorage(parentTreeItem);
        }

        var _afterOnObjectUpdate = Ext.bind(this._afterOnObjectUpdate, this);
        this.refresh(function() {
            _afterOnObjectUpdate(record);
        });
    },

    _afterOnObjectUpdate: function() {
        this._fireRefreshEvent();

    },

    _displayFlair:function (message) {
        Rally.ui.notify.Notifier.show({
            message:message
        });
    },

    beforeRecordSaved: function(record, newParentRecord){
        if (this._isTestFolder(record)){
            //Change the project of the source to the same as the drop target
            record.set('Project', newParentRecord.get('Project')._ref);
            record.set('Parent', newParentRecord._ref);
        }
        else if (this._isTestCase(record)){
            record.set('Project', newParentRecord.get('Project')._ref);
            record.set('TestFolder', newParentRecord.get('_ref'));
        }


    },

    /**
     * Loads the top level of the tree.
     * Should only be called once, and only if #autoLoad is false.
     */
    loadTopLevel: function(){
        this.topLevelStore.load();
    },

    drawEmptyMsg: function(){
        var emptyTextMessage = this.getEmptyText();
        this.add({
            xtype: 'component',
            html: Rally.ui.EmptyTextFactory.getEmptyTextFor(emptyTextMessage)
        });
    },

    /**
     *
     */
    insertItem: function(treeItem, parentTreeItem) {
        var removedFromParent = false,
            insertIndex = -1;

        // udpate where this treeItem used to be
        if (treeItem.parentTreeItem) {
            if (!parentTreeItem || parentTreeItem.getRecord().get('_ref') !== treeItem.parentTreeItem.getRecord().get('_ref')) {
                removedFromParent = true;
                treeItem.parentTreeItem.removeChildItem(treeItem);
                treeItem.parentTreeItem.reloadAndDraw();
            }
        } else {
            this.remove(treeItem, false);
            removedFromParent = true;
        }

        if(parentTreeItem){
            if (parentTreeItem.getExpanded()) {
                treeItem.setParentTreeItem(parentTreeItem);
                parentTreeItem.insertChildItemByRank(treeItem, this._fireRefreshEvent, this);
            } else {
                parentTreeItem.reloadAndDraw(parentTreeItem.expandOrCollapse, parentTreeItem);
                if (removedFromParent) {
                    treeItem.destroy();
                }
            }
        } else if (this.topLevelStore.model && this.topLevelStore.model.typePath === treeItem.getRecord().self.typePath.toLowerCase()) {
            this.topLevelStore.add(treeItem.getRecord());
            if (Rally.data.Ranker.isDnDRankable(this.topLevelStore)) {
                insertIndex = _.sortedIndex(this.items.getRange(), treeItem, treeItem.getRank);
            }
            this.insert(insertIndex, treeItem);
            this._fireRefreshEvent();
        }
    },

    /**
     * Adds an item in the tree for each record
     * @param records the records to create Rally.ui.tree.TreeItems for
     * @param parentTreeItem (Optional) add the items as a child to a different Rally.ui.tree.TreeItem
     */
    drawItems: function(records, parentTreeItem){
        Ext.suspendLayouts();
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            this._drawTreeItem(record, parentTreeItem);
        }

        this._drawingChildrenCount--;
        Ext.resumeLayouts(true);
        Ext.defer(function () {
            if (this._drawingChildrenCount === 0) {
                if (!this._treeLoaded) {
                    this.fireEvent('initialload');
                } else {
                    this._fireRefreshEvent();
                }
            }
            this.publish(Rally.Message.treeItemExpanded);
        },1, this);
    },

    _getShouldExpand: function(record) {
      return this.getStateful() && this._sessionStorageContainsTreeItem(record);
    },

    _createTreeItem: function(record) {
        var treeItemConfig = this.getTreeItemConfigForRecordFn().call(this.getScope(), record);
        treeItemConfig = treeItemConfig || {};

        treeItemConfig = Ext.applyIf(treeItemConfig, {
            xtype: 'rallytreeitem',
            record: record,
            canExpandFn: this.getCanExpandFn(),
            scope: this.getScope(),
            canDrag: this.getEnableDragAndDrop(),
            canDropOnMe: this.getEnableDragAndDrop(),
            actionsForRecordFn: Ext.isFunction(this.getActionsForRecordFn()) ? Ext.bind(this.getActionsForRecordFn(), this) : null,
            expanded: this._getShouldExpand(record),
            listeners: {
                expand: this.expandItem,
                collapse: this.collapseItem,
                select: this.selectTreeItem,
                scope: this
            }
        });

        var treeItem = Ext.ComponentManager.create(treeItemConfig);

        if(this.getEnableDragAndDrop()){
            treeItem.on('draw', function(){
                this.makeTreeItemDraggable(treeItem);
            }, this);
        }
        return treeItem;
    },

    _drawTreeItem: function(record, parentTreeItem){
        var treeItem = this._createTreeItem(record);

        if(parentTreeItem){
            treeItem.setParentTreeItem(parentTreeItem);
            parentTreeItem.addChildItem(treeItem);
        } else {
            this.add(treeItem);
        }
    },

    /**
     * Given a Rally.ui.tree.TreeItem, load its child items.
     * Assumes this TreeItem has children.
     * @param parentTreeItem tree item to load children for.
     */
    drawChildItems: function(parentTreeItem){
        this._drawingChildrenCount++;

        var self = this;

        var childModelTypes = this.getChildModelTypesForRecordFn().call(this.getScope(), parentTreeItem.getRecord());

        _.each( childModelTypes, function (model) {

            var parentAttribute = self.getGivenAParentTypeWhatChildAttributeConnectsChildToThisParentFn().call(self.getScope(), model);

            var storeConfig = self.getChildItemsStoreConfigForParentRecordFn().call(self.getScope(), model);

            storeConfig = storeConfig || {};

            storeConfig = Ext.applyIf(storeConfig, {
                model: model,
                filters: [
                    {
                        property: parentAttribute,
                        value: parentTreeItem.getRecord().get('_ref'),
                        operator: '='
                    }
                ],
                sorters: [],

                context: {
                    project: undefined
                },
                fetch: self._getChildTypeFetchFields(parentAttribute)
            });

            var childStore = Ext.create(storeConfig.xtype || 'store.rallywsapidatastore', storeConfig);

            childStore.on('load', function(store, records){
                self.handleChildItemStoreLoad(store, Ext.clone(records), parentTreeItem);
            });

            parentTreeItem.store = childStore;

            childStore.load();
        }, self);

    },

    handleChildItemStoreLoad: function(store, records, parentTreeItem) {
        this.renderChildRecords(records, parentTreeItem);
    },

    renderChildRecords: function(records, parentTreeItem) {
        this.drawItems(records, parentTreeItem);
    },

    makeTreeItemDraggable: function(treeItem){
        var tree = this;

        if(treeItem.getCanDrag()){
            var me = this;
            var dragSource = Ext.create('Ext.dd.DragSource', treeItem.getEl(), {
                treeItem: treeItem,
                ddGroup: this.getDragDropGroupFn().call(this.getScope(), treeItem.getRecord()),
                isTarget: false,
                proxy: Ext.create('Ext.dd.StatusProxy', {
                    animRepair: true,
                    shadow: false,
                    dropNotAllowed: 'rallytree-proxy'
                }),
                beforeDragDrop: function(){
                    me.fireEvent('drag', treeItem);
                    return true;
                },
                afterDragDrop: function(){
                    me.fireEvent('drop', treeItem);
                }
            });

            dragSource.setHandleElId(treeItem.getEl().down('.drag').id);
        }

        if(treeItem.getCanDropOnMe()){
            var dropTarget = Ext.create('Rally.ui.tree.TreeItemDropTarget', treeItem.down('#treeItemContent').getEl(), {
                tree: tree,
                treeItem: treeItem
            });

            if(treeItem.dropTarget){
                treeItem.dropTarget.unreg();
            }

            treeItem.dropTarget = dropTarget;

            var dropTargetGroups = this.getDragThisGroupOnMeFn().call(this.getScope(), treeItem.getRecord());
            if(!Ext.isArray(dropTargetGroups)){
                dropTargetGroups = [dropTargetGroups];
            }
            Ext.each(dropTargetGroups, function(dropTargetGroup){
                dropTarget.addToGroup(dropTargetGroup);
            });
        }

    },

    /**
     * This should never be called directly, it only responds to a record being destroyed
     * @param treeItem
     * @private
     */
    _removeTreeItem: function(treeItem){
        treeItem.destroy();
        if(treeItem.getParentTreeItem()){
            treeItem.getParentTreeItem().reloadAndDraw(function() {
                this._fireRefreshEvent();
            }, this);
        }
        if(this.query('rallytreeitem').length === 0){
            this.drawEmptyMsg();
        }
        this._fireRefreshEvent();
    },

    expandItem: function(treeItem){
        treeItem.removeChildItems();
        this.drawChildItems(treeItem);
        if(this.getStateful()) {
            this._addTreeItemToSessionStorage(treeItem);
        }
    },

    collapseItem: function(treeItem){
        if(this.getStateful()) {
            var treeItems = treeItem.query('rallytreeitem');

            Ext.Array.forEach(treeItems, function(item){
                this._removeTreeItemFromSessionStorage(item);
            }, this);

            this._removeTreeItemFromSessionStorage(treeItem);
        }
        treeItem.removeChildItems();
        this._fireRefreshEvent();
        this.publish(Rally.Message.treeItemCollapsed);
    },

    selectTreeItem: function(treeItem){
        Ext.Array.forEach(this.getEl().query('.treeItemSelected'), function(treeItemEl){
            Ext.get(treeItemEl).removeCls('treeItemSelected');
        });

        treeItem.getEl().down('.treeItemContent').addCls('treeItemSelected');

        this.fireEvent('itemselected', treeItem);
        this.publish(Rally.Message.objectFocus, treeItem.getRecord(), this);
    },

    destroy: function(){
        this.callParent(arguments);
    },

    _fireRefreshEvent: function() {
        this.fireEvent('refresh');
    },

    _saveTreeStateToSessionStorage: function(){
        this._treeState = Ext.Array.map(this.query('rallytreeitem[expanded=true]'), function(treeItem){
            return treeItem.getRecord().get('ObjectID');
        });
        this.saveState();
    },

    _addTreeItemToSessionStorage: function(treeItem) {
        var oids = this.getState();

        if(Ext.Array.contains(oids, treeItem.getRecord().get('ObjectID'))) {
            return;
        }

        oids.push(treeItem.getRecord().get('ObjectID'));

        this.saveState();
    },

    _removeTreeItemFromSessionStorage: function(treeItem) {
        Ext.Array.remove(this.getState(), treeItem.getRecord().get('ObjectID'));
        this.saveState();
    },

    _sessionStorageContainsTreeItem: function(record) {
        return Ext.Array.contains(this.getState(), record.get('ObjectID'));
    },

    _getDefaultTopLevelFetchFields: function() {
        return ['FormattedID', 'Name', 'ObjectID', 'Children', 'TestCases', 'Project'];
    },

    _getChildTypeFetchFields: function(parentFieldName) {
        return this._getDefaultTopLevelFetchFields().concat([parentFieldName, 'Name', 'ObjectID', 'FormattedID', 'Project']);
    },

    _isTestFolder: function(record) {
        return record.get('_type') === 'testfolder';
    },

    _isTestCase: function(record) {
        return record.get('_type') === 'testcase';
    },

    /**
     * Override Ext.state.Stateful's getState to keep track of it ourselves
     * @return {Array} list of oids for records that are expanded
     */
    getState: function(){
        return this._treeState;
    },

    /**
     * Override Ext.state.Stateful's saveState to explicitly set our storage mechanism
     * @private
     */
    saveState: function(){
        Rally.state.SessionStorage.getInstance().set(this.getStateId(), this.getState());
    },

    /**
     * Override Ext.state.Stateful's initState to do nothing, we handle initializing state in the constructor.
     * @private
     */
    initState: function(){}

});

