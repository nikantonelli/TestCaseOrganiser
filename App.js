Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: 'hbox',
    align: 'stretch',
    margin: 10,
    items:[
        {
            xtype: 'container',
            id: 'folderbox'

        },
        {
            xtype: 'container',
            id: 'casebox',
            flex: 2

        }
    ],

    launch: function() {
        var tree =  Ext.create('Rally.ui.tree.TestTree', {
                        config: {
                            displayedFields: [ 'Name', 'Project'],
                            topLevelModel: Ext.identityFn('TestFolder')
                        },
                        topLevelStoreConfig: {

                            fetch: [ 'FormattedID', 'Name', 'Parent', 'Children' , 'TestCases', 'Project'],
                            sorters: [],
                            context: {
                                projectScopeUp: true,
                                projectScopeDown: true
                            }
                        },
                        childItemsStoreConfigForParentRecordFn: function(){
                            return {

                                fetch: [ 'FormattedID', 'Name', 'Parent', 'Children' , 'TestCases', 'Project', 'TestFolder'],
                                sorters: [],
                                context: {
                                    projectScopeUp: true,
                                    projectScopeDown: true
                                }

                                };
                        }

                     });
Ext.util.Observable.capture( tree, function(event) {
    console.log(event, arguments);
});

        Ext.getCmp('folderbox').add(tree);

        var cases =  Ext.create('Rally.ui.tree.TestTree', {
                        config: {
                            displayedFields: [ 'Name', 'Project'],
                            topLevelModel: Ext.identityFn('TestCase'),
                            topLevelParentAttribute: 'TestFolder'
                        }

                    });

        Ext.getCmp('casebox').add(cases);

    }
});

Ext.define( 'testTreeItem', {
    extend: 'Rally.ui.tree.TreeItem',
    alias: 'widget.testTreeItem',

    getContentTpl: function() {
        var me = this;
        return Ext.create('Ext.XTemplate',
            '<tpl if="this.canDrag()"><div class="icon drag"></div></tpl>',
            '{[this.getActionsGear()]}',
            '<div class="textContent ellipses">{[this.getFormattedId()]} {[this.getSeparator()]}{Name}  ({Project.Name})</div>',
            '<div class="rightSide">',
            '</div>',
            {
                canDrag: function() {
                    return me.getCanDrag();
                },
                getActionsGear: function() {
                    return me._buildActionsGearHtml();
                },
                getFormattedId: function() {
                    var record = me.getRecord();
                    return record.getField('FormattedID') ? Rally.ui.renderer.RendererFactory.renderRecordField(record, 'FormattedID') : '';
                },
                getSeparator: function() {
                    return this.getFormattedId() ? '- ' : '';
                }
            });
        }
});

Ext.define('Rally.ui.tree.TestTree', {
    extend:  Rally.ui.tree.Tree ,
    alias: 'widget.rallytesttree',
               
                                          
                                                       
      

    constructor: function(config){

        config = Ext.apply({
            childModelTypeForRecordFn: this.childModelTypeForRecordFn,
            givenAParentRecordWhatIsTheAttributeConnectingAChildToThisParentFn: this.givenAParentRecordWhatIsTheAttributeConnectingAChildToThisParent, //ok
            givenAChildRecordWhatIsTheAttributeConnectingItToTheParentFn: this.givenAChildRecordWhatIsTheAttributeConnectingItToTheParent,
            givenAChildAndParentRecordWhatAttributeShouldConnectTheChildToTheParentFn: this.givenAChildAndParentRecordWhatAttributeShouldConnectTheChildToTheParent, //ok
            canExpandFn: this.canExpandItem,
            enableRanking: true,
            enableDragAndDrop: true,
            dragDropGroupFn: this.dragDropGroup,
            dragThisGroupOnMeFn: this.dragThisGroupOnMe,
            scope: this,
            treeItemConfigForRecordFn: this.treeItemConfigForRecordFn,
            listeners: {
                beforerecordsaved: this.beforeRecordSaved,
                recordsaved: function(record, listeners) { }
            }
        }, config);

        this.callParent([config]);

    },

    treeItemConfigForRecordFn: function(record){
        var config = {
            selectable: true
        };

        if(this._isTestFolder(record)){
            config.xtype = 'testTreeItem';
        } else {
            config.xtype = 'rallytreeitem';
        }

        return config;
    },

    beforeRecordSaved: function(record, newParentRecord){
        if (this._isTestFolder(newParentRecord)){
            //Change the project of the source to the same as the drop target
            record.set('Project', newParentRecord.get('Project'));
        }
        else if (this._isTestCase(newParentRecord)){
            record.set('Project', newParentRecord.get('Project'));
            record.set('TestFolder', newParentRecord.get('TestFolder'));
        }


    },

    _isTestFolder: function(record) {
        return record.get('_type') === 'testfolder';
    },

    _isTestCase: function(record) {
        return record.get('_type') === 'testcase';
    },

    childModelTypeForRecordFn: function(record){

        if(this._testFolderHasChildren(record)){
            return 'testfolder';
        } else {
            return 'testcase';
        }

    },

    givenAChildAndParentRecordWhatAttributeShouldConnectTheChildToTheParent: function(childRecord, parentRecord){
        if(this._isTestCase(childRecord)){
            return 'TestFolder';
        }
        if (this._isTestFolder(childRecord)) {
            return 'Parent';
        }
    },

    givenAChildRecordWhatIsTheAttributeConnectingItToTheParent: function (childRecord) {
        if(this._isTestCase(childRecord)){
            return 'TestFolder';
        } else {
            return 'Parent';
        }
    },

    givenAParentRecordWhatIsTheAttributeConnectingAChildToThisParent: function (record) {
        if(this._testFolderHasChildren(record)){
            return 'Parent';
        } else {
            return 'TestFolder';
        }
    },

    canExpandItem: function(record){
        return (this._testFolderHasChildren(record) || this._testFolderHasTestCases(record));
    },

    dragDropGroup: function(record){
        return Rally.util.Ref.getOidFromRef(record.get('_type'));
    },

    dragThisGroupOnMe: function(record){
        var workspace = Rally.util.Ref.getOidFromRef(record.get('Workspace')._ref);

        if(this._isTestCase(record)){
            return 'testcase';
        }

        if(this._isTestFolder(record)){
            return [
                'testcase',
                'testfolder'
            ];
        }

    },

    _testFolderHasTestCases: function(record){
        return (record.get('TestCases') && record.get('TestCases').Count > 0);
    },

    _testFolderHasChildren: function(record){
        return (record.get('Children') && (record.get('Children').Count > 0));
    }


});

