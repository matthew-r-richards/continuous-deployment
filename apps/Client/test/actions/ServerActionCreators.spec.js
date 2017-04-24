import { expect } from 'chai';
import { stub } from 'sinon';

import reload from 'helpers/reload';

import { ActionTypes } from 'constants/ApiConstants';

describe('ServerActionCreators', () => {
    let EntryDispatcher;
    let ServerActionCreators;

    beforeEach(() => {
        EntryDispatcher = reload('../../src/dispatcher/EntryDispatcher');
        stub(EntryDispatcher, 'dispatch');
        ServerActionCreators = reload('../../src/actions/ServerActionCreators');
    })

    it('dispatches an event after an entry has been added', () => {
        const entry = { name: 'new name', description: 'new description' };
        ServerActionCreators.receiveAddedEntry(entry);
        const expectedAction = {
            type: ActionTypes.RECEIVE_ADD_ENTRY,
            data: entry
        };

        expect(EntryDispatcher.dispatch.calledWith(expectedAction)).to.be.true;
    });

    it('dispatches an event after all entries have been retrieved', () => {
        const entries = [
            { name: 'new name 1', description: 'new description 1' },
            { name: 'new name 2', description: 'new description 2' }
        ];
        ServerActionCreators.receiveAllEntries(entries);
        const expectedAction = {
            type: ActionTypes.RECEIVE_ALL_ENTRIES,
            data: entries
        };

        expect(EntryDispatcher.dispatch.calledWith(expectedAction)).to.be.true;
    })
});