Ext.define('AddToTestSetMenuItem', {
        extend:  Rally.ui.menu.item.RecordMenuItem ,
        alias: 'widget.rallyrecordmenuitemaddtoTS',

        config: {
            text: 'Add to testset...',
            cls: 'icon-test-set'
            /**
             * @cfg handler
             */

            /**
             * @cfg predicate
             */
        },

        foldersToScan: [],

        constructor: function (config) {
            config = config || {};
            config.predicate = config.predicate || Rally.predicate.RecordPredicates.mustPassAllPredicates([
                Rally.predicate.RecordPredicates.isUpdatable
            ]);
            config.handler = config.handler || this._onAddToTSClicked;

            this.initConfig(config);
            this.callParent(arguments);

            this.addEvents('syncTarget');

        },

        _addTestCasesForTestFolder: function(source, tcList)
        {
            var self = this;

            var sourceCollection = source.getCollection('TestCases');
            sourceCollection.load().then({
                success: function() {
                    tcList = tcList.concat(sourceCollection.getRecords());

                    //Remove this folder from the scanList
                    _.remove(self.foldersToScan, function(testfolder) {
                        return testfolder.get('FormattedID') === source.get('FormattedID');
                    });

                    //At the end of every Promise completion, we need to check to see if we are the last
                    if (self.foldersToScan) {
                        if (self.foldersToScan.length === 0) {
                            //We know all the promises are delivered, we can now notify the app to sync the targetCollection

                            //First get the store from the manager
                            var store = Ext.data.StoreManager.lookup('wsStore');

                            //And then ping it, so it saves the TC list
                            var ping = store && store.fireEvent('syncTarget', tcList);

                        } else {
                            //we have any more, if so, fire off another _scanFolder
                            self._scanFolder(_.first(self.foldersToScan), tcList);

                        }
                    }
                }
            });
        },

        _scanFolder: function( source, tcList) {

            var self = this;

            //See if there are any children folders and put them on the wait list
            var folderCollection = source.getCollection('Children');
            folderCollection.load().then( {
                success: function(error, result) {
                    _.each(folderCollection.data.items, function(record) {
                        self.foldersToScan.push(record);
                    });

                //Do this folder's direct TestCases
                self._addTestCasesForTestFolder(source, tcList);

                }
            });

        },


        _onAddToTSClicked: function () {

            var self = this;

            //This global check feels ALMy and probably shouldn't be here...
            if (window.detail) {
                window.detail.refreshContent = false;
            }

            var chooser = Ext.create('Rally.ui.dialog.SolrArtifactChooserDialog', {
                artifactTypes: ['testset'],
                autoShow: true,
                title: 'Choose Test Set',
                columns: ['FormattedID', 'Name', 'Iteration'],
                listeners: {
                    artifactchosen: function(dialog, selectedRecord){

                        //We have the test set (selectedRecord) and the testitem (self)
                        //Get the full TestSet item in a store so we can modify it:

                        var itemStore = Ext.create('Rally.data.wsapi.Store', {
                            model: 'testset',
                            limit: Infinity,
                            autoLoad: true,
                            storeId: 'wsStore', //Log the store with the store manager for later retrieval
                            batchAction: true,
                            targetCollection: null,
                            fetch: [ 'FormattedID', 'TestCases'],
                            filters: [
                                {
                                    property: 'FormattedID',
                                    value: selectedRecord.get('FormattedID')
                                }
                            ],
                            listeners: {
                                load: function(store, records, success) {
                                        var testcaseList = [];

                                        //Get the collection of current test cases
                                        this.targetCollection = records[0].getCollection('TestCases');

                                        if (self.record.get('_type') === 'testcase'){
                                            //Add the single test case to the test set
                                            testcaseList.add(self.record);
                                            this.targetCollection.load({
                                                callback: function(){
                                                    _.each(testcaseList, function(testcase) {
                                                        this.targetCollection.add(testcase);
                                                    });
                                                    this.targetCollection.sync({
                                                        success: function() {Rally.ui.notify.Notifier.show({ message: 'Test Case added to Test Set'});},
                                                        failure: function() {Rally.ui.notify.Notifier.showError({ message: 'Failed to add Test Case to Test Set'});}
                                                    });
                                                }
                                            });
                                        }
                                        else {
                                            //Add the contents of the folder recursively

                                        this.targetCollection.load( {
                                            callback: function() {
                                                self._scanFolder(self.record, testcaseList);
                                            }
                                        });
                                    }
                                },
                                //Our own synchronisation event from the testcase loading
                                syncTarget: function(testcaseList) {

                                    //Need to refetch the context of the store as we are part of 'window' as we come in
                                    var store = Ext.data.StoreManager.lookup('wsStore');

                                    //The sync is limited to 25 records at a time so use batchAction on wsStore
                                    var syncCount = 0;

                                    _.each(testcaseList, function(testcase) {
                                        store.targetCollection.add(testcase);
                                    });

                                    store.targetCollection.sync({
                                        success: function() {
                                            Rally.ui.notify.Notifier.show({ message: testcaseList.length + ' Test Cases added to Test Set'});
                                        },
                                        failure: function() {
                                            Rally.ui.notify.Notifier.showError({ message: 'Failed to add Test Cases to Test Set'});
                                        }
                                    });

                                        }
                                }
                        });

                    },
                    scope: this
                }
             });
        }

    });
