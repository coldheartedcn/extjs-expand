Ext.define('Ext.clown.grid.feature.RemoteSummary', {
    extend: 'Ext.grid.feature.Summary',
    alias: 'feature.remotesummary',

    getSummary: function(store, type, field, group) {
        var reader = store.proxy.reader;

        if (this.remoteRoot && reader.rawData) {
            // reset reader root and rebuild extractors to extract summaries data
            root = reader.root;
            reader.root = this.remoteRoot;
            reader.buildExtractors(true);
            summaryRow = reader.getRoot(reader.rawData);

            // restore initial reader configuration
            reader.root = root;
            reader.buildExtractors(true);
            if (typeof summaryRow[field] != 'undefined') {
                return summaryRow[field];
            }

            return '';
        }

        return this.callParent(arguments);

    }
});