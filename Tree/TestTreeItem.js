Ext.define('Rally.ui.tree.TestFolderTreeItem', {
        extend:  Rally.ui.tree.TreeItem ,
        alias: 'widget.testtreeitem',

        config: {
            displayedFields: ['Name', 'Project']
        },

        getContentTpl: function(){
            var me = this;

            return Ext.create('Ext.XTemplate',
                        '<tpl if="this.canDrag()"><div class="icon drag"></div></tpl>',
                        '{[this.getActionsGear()]}',
                        '<div class="textContent ellipses">{[this.getFormattedId()]} - {Name} ({[this.getProject()]})</div>',
                        '<div class="rightSide">',
                            '{[this.getScheduleState(values)]}',
                        '</div>',
                    {
                        canDrag: function(){
                            return me.getCanDrag();
                        },
                        getActionsGear: function(){
                            return me._buildActionsGearHtml();
                        },
                        getProject: function(){
                            return Rally.ui.renderer.RendererFactory.renderRecordField(me.getRecord(), 'Project');
                        },
                        getFormattedId: function(){
                            return Rally.ui.renderer.RendererFactory.renderRecordField(me.getRecord(), 'FormattedID');
                        }
                    }
            );
        }

    });

//        _buildActionsGearHtml: function() {
//            var hasPermissions = this.getRecord().get('creatable') || this.getRecord().get('updatable') || this.getRecord().get('deletable');
//            return hasPermissions ? '<div class="row-action icon"></div>' : '';
//        },
//
//Ext.define('Rally.ui.tree.TestCaseTreeItem', {
//        extend:  Rally.ui.tree.TreeItem ,
//        alias: 'widget.testcasetreeitem',
//
//        config: {
//            displayedFields: ['Name', 'TestFolder']
//        },
//
//        getContentTpl: function(){
//            var me = this;
//
//            return Ext.create('Ext.XTemplate',
//                        '<tpl if="this.canDrag()"><div class="icon drag"></div></tpl>',
//                        '{[this.getActionsGear()]}',
//                        '<div class="textContent ellipses">{[this.getFormattedId()]} - {Name} ({[this.getProject()]})</div>',
//                        '<div class="rightSide">',
//                            '{[this.getScheduleState(values)]}',
//                        '</div>',
//                    {
//                        canDrag: function(){
//                            return me.getCanDrag();
//                        },
//                        getActionsGear: function(){
//                            return me._buildActionsGearHtml();
//                        },
//                        getProject: function(){
//                            return Rally.ui.renderer.RendererFactory.renderRecordField(me.getRecord(), 'Project');
//                        },
//                        getFormattedId: function(){
//                            return Rally.ui.renderer.RendererFactory.renderRecordField(me.getRecord(), 'FormattedID');
//                        }
//                    }
//            );
//        }
//
//    });
//

