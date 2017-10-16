Ext.override(Ext.app, {

    setupPaths: function (appName, appFolder, paths) {
        var manifestPaths = Ext.manifest, ns;

        if (appName && appFolder !== null) {
            manifestPaths = manifestPaths && manifestPaths.paths;
            if (!manifestPaths || appFolder !== undefined) {
                var folder = 'app';

                if(!Ext.isEmpty(g_v3.appFolder)) {
                    folder = g_v3.appFolder;
                }

                Ext.Loader.setPath(appName, appFolder === undefined ? folder : appFolder);
            }
        }

        if (paths) {
            for (ns in paths) {
                if (paths.hasOwnProperty(ns)) {
                    Ext.Loader.setPath(ns, paths[ns]);
                }
            }
        }
    }

});
