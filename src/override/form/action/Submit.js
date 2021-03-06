Ext.override(Ext.form.action.Submit, {

    onSuccess: function(response) {
        var form = this.form,
            formActive = form && !form.destroying && !form.destroyed,
            success = true,
            result = this.processResponse(response);

        if (result !== true && !result.success && Ext.isEmpty(result.result)) {
            if (result.errors && formActive) {
                form.markInvalid(result.errors);
            }
            this.failureType = Ext.form.action.Action.SERVER_INVALID;
            success = false;
        }

        if (formActive) {
            form.afterAction(this, success);
        }
    },

});