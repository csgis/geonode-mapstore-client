/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import {toggleControl} from '@mapstore/framework/actions/controls';
import Message from '@mapstore/framework/components/I18N/Message';
import { Glyphicon } from 'react-bootstrap';
import { mapInfoSelector } from '@mapstore/framework/selectors/map';
import {
    saveContent,
    clearSave,
    updateResourceBeforeSave
} from '@js/actions/gnsave';
import { isLoggedIn } from '@mapstore/framework/selectors/security';
import controls from '@mapstore/framework/reducers/controls';
import gnresource from '@js/reducers/gnresource';
import gnsave from '@js/reducers/gnsave';
import gnsaveEpics from '@js/epics/gnsave';
import SaveModal from '@js/plugins/save/SaveModal';

function Save(props) {
    return (
        <SaveModal
            {...props}
            update
            labelId="save"
        />
    );
}

const SavePlugin = connect(
    createSelector([
        state => state?.controls?.save?.enabled,
        mapInfoSelector,
        state => state?.gnresource?.data,
        state => state?.gnresource?.loading,
        state => state?.gnsave?.saving,
        state => state?.gnsave?.error,
        state => state?.gnsave?.success,
        state => state?.gnresource?.id
    ], (enabled, mapInfo, resource, loading, saving, error, success, contentId) => ({
        enabled,
        contentId: contentId || mapInfo?.id,
        resource,
        loading,
        saving,
        error,
        success
    })),
    {
        onClose: toggleControl.bind(null, 'save', null),
        onInit: updateResourceBeforeSave,
        onSave: saveContent,
        onClear: clearSave
    }
)(Save);

export default createPlugin('Save', {
    component: SavePlugin,
    containers: {
        BurgerMenu: {
            name: 'save',
            position: 30,
            text: <Message msgId="save"/>,
            icon: <Glyphicon glyph="floppy-open"/>,
            action: toggleControl.bind(null, 'save', null),
            selector: createSelector(
                isLoggedIn,
                state => state?.gnresource?.isNew,
                state => state?.gnresource?.permissions?.canEdit,
                state => state?.gnresource?.permissions?.type,
                (loggedIn, isNew, canEdit, resourceType) => ({
                    // we should add permList to map pages too
                    // no resource type means map page
                    style: loggedIn && !isNew && (canEdit || !resourceType) ? {} : { display: 'none' }
                })
            )
        }
    },
    epics: {
        ...gnsaveEpics
    },
    reducers: {
        gnresource,
        gnsave,
        controls
    }
});
