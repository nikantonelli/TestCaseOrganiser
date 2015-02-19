//App to create two trees with drag and drop capability
//Left is the real TestCase/TestFolder organisation and to the right is a list of TestCases not assigned to folders yet.

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: 'hbox',
    align: 'stretch',
    margin: 10,
    autoscroll: false,

    items:[
        {
            xtype: 'container',
            id: 'folderbox',
            items: [{
                xtype: 'label',
                html: '<b> Test Folder Hierarchy </b>'
            }]

        },
        {
            xtype: 'container',
            id: 'casebox',
            flex: 2,
            items: [{
                xtype: 'label',
                html: '<b>Test Cases not in a Folder</b>'
            }]

        }
    ],

    launch: function() {

        //I'm going to use State, so call the initialise....
        Rally.state.SessionStorage.initialize( 'testcaseorganiser');


        var tree =  Ext.create('Rally.ui.tree.TestOrganiserTree', {
                        id: 'folderTree',
                        height: 800,
                        autoScroll: true,
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
                        },
                        listeners: {
                            recordsaved: function(record) {
                                this.refresh();
                                Ext.getCmp('caseTree').refresh();
                            }
                        },
                        scope: tree
                     });

        Ext.getCmp('folderbox').add(tree);

//Ext.util.Observable.capture( tree, function(event) {
//    console.log(tree.id, event, arguments);
//});

        var cases =  Ext.create('Rally.ui.tree.TestOrganiserTree', {
                        id: 'caseTree',
                        height: 800,
                        autoScroll: true,
                        config: {
                            displayedFields: [ 'Name', 'Project'],
                            topLevelModel: Ext.identityFn('TestCase'),
                            topLevelParentAttribute: 'TestFolder'
                        },
                        topLevelStoreConfig: {

                            fetch: [ 'FormattedID', 'Name' , 'TestFolder', 'Project'],
                            sorters: [],
                            context: {
                                projectScopeUp: true,
                                projectScopeDown: true
                            }
                        }
                    });

        Ext.getCmp('casebox').add(cases);

//Ext.util.Observable.capture( cases, function(event) {
//    console.log(cases.id, event, arguments);
//});

    }

});

