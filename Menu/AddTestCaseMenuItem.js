Ext.define('AddTestCaseMenuItem', {
        extend:  Rally.ui.menu.item.RecordMenuItem ,
        alias: 'widget.rallyrecordmenuitemaddtestcase',

        config: {
            text: 'Add testcase...',
            cls: 'icon-test-case'
            /**
             * @cfg handler
             */

            /**
             * @cfg predicate
             */
        },

        constructor: function (config) {
            config = config || {};
            config.predicate = config.predicate || Rally.predicate.RecordPredicates.mustPassAllPredicates([
                Rally.predicate.RecordPredicates.isUpdatable,
                Rally.predicate.RecordPredicates.canHaveChildren
            ]);
            config.handler = config.handler || this._onAddChildClicked;

            this.initConfig(config);
            this.callParent(arguments);
        },

        _getChildType: function () {
            var field = this.record.getField('TestCases');

            return field.attributeDefinition.AllowedValueType._refObjectName;
        },

        _getCpoid: function (record) {
            var project = record.get('Project') || {_ref: record.self.context.project};

            return Rally.util.Ref.getOidFromRef(project._ref);
        },

        _onAddChildClicked: function () {
            //This global check feels ALMy and probably shouldn't be here...
            if (window.detail) {
                window.detail.refreshContent = false;
            }

            var childType = this._getChildType(),
                record = this.record,
                params = this._buildParamsForEditor(record);

            Rally.data.wsapi.ModelFactory.getModel({
                type: childType,
                context: record.self.context
            }).then(function (ChildModel) {
                    params.typeDef = ChildModel.typeDefOid;
                    Rally.nav.Manager.create(childType, params);
                });
        },

        _buildParamsForEditor: function (parent) {
            var params = {
                parent: parent.get('ObjectID'),
                parentTypeDef: parent.self.typeDefOid,
                cpoid: this._getCpoid(parent),
                TestFolder: parent.get('_ref')
            };

            return params;
        }

    });

