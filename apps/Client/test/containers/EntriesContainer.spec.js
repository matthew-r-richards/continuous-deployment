import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { stub } from 'sinon';

import reload from 'helpers/reload';

import EntryList from 'components/EntryList';
import Error from 'components/Error';
import Status from 'components/Status';
import { StoreEvents } from 'constants/ApiConstants';

describe('<EntriesContainer/>', () => {
  let EntriesContainer;
  let wrapper;
  let EntryStore, EntryActionCreators, EntryInput;
  let addEntryStub;
  let stubs;

  beforeEach(() => {
    EntryStore = reload('../../src/stores/EntryStore');
    EntryActionCreators = reload('../../src/actions/EntryActionCreators');
    EntryInput = reload('../../src/components/EntryInput');

    stubs = {
      EntryStore: {
        getAllEntries: stub(EntryStore, 'getAllEntries'),
        addChangeListener: stub(EntryStore, 'addChangeListener'),
        removeChangeListener: stub(EntryStore, 'removeChangeListener'),
        getHasApiError: stub(EntryStore, 'getHasApiError'),
        getTotalDuration: stub(EntryStore, 'getTotalDuration')
      },
      EntryActionCreators: {
        loadEntries: stub(EntryActionCreators, 'loadEntries'),
        addEntry: stub(EntryActionCreators, 'addEntry'),
        deleteEntry: stub(EntryActionCreators, 'deleteEntry'),
        stopEntry: stub(EntryActionCreators, 'stopEntry')
      }
    };

    // set the EntryStore stub to return a simple set of entries
    stubs.EntryStore.getAllEntries.returns(['entry 1', 'entry 2']);
    stubs.EntryStore.getHasApiError.returns(false);
    stubs.EntryStore.getTotalDuration.returns(90);

    EntriesContainer = reload('../../src/containers/EntriesContainer');
    wrapper = shallow(<EntriesContainer/>);
  });

  it('should render EntryInput, Status and EntryList components', () => {
    expect(wrapper.find(EntryInput)).to.have.length(1);
    expect(wrapper.find(Status)).to.have.length(1);
    expect(wrapper.find(EntryList)).to.have.length(1);
  });

  it('should dispatch an action to load all entries on mounting', () => {
    wrapper = mount(<EntriesContainer/>);
    expect(stubs.EntryActionCreators.loadEntries.called).to.be.true;
  });

  it('should pass duration total and target to the Status component', () => {
    // call onChange so that the container has an up-to-date value for total duration
    wrapper.instance().onChange();

    expect(wrapper.containsAllMatchingElements([
      <Status totalDuration={90} hoursTarget={8.5}/>
    ])).to.be.true
  });

 it('creates an action to add an entry', () => {
    wrapper.instance().addEntry('new name', 'new description');
    expect(stubs.EntryActionCreators.addEntry.calledWith('new name', 'new description')).to.be.true;
  });

  it('passes addEntry to EntryInput', () => {
    const entryInput = wrapper.find(EntryInput);
    const addEntry = wrapper.instance().addEntry;
    expect(entryInput.prop('onSubmit')).to.eql(addEntry);
  })

  it('passes a bound addEntry function to EntryInput', () => {
    const entryInput = wrapper.find(EntryInput);
    entryInput.prop('onSubmit')('new name', 'new description')

    expect(stubs.EntryActionCreators.addEntry.calledWith('new name', 'new description')).to.be.true;
  })

  it('passes deleteEntry to EntryList', () => {
    const entryList = wrapper.find(EntryList);
    const deleteEntry = wrapper.instance().deleteEntry;
    expect(entryList.prop('onDelete')).to.eql(deleteEntry);
  })

  it('passes a bound deleteEntry function to EntryList', () => {
    const entryList = wrapper.find(EntryList);
    entryList.prop('onDelete')(1);

    expect(stubs.EntryActionCreators.deleteEntry.calledWith(1)).to.be.true;
  })

  it('passes stopEntry to EntryList', () => {
    const entryList = wrapper.find(EntryList);
    const stopEntry = wrapper.instance().stopEntry;
    expect(entryList.prop('onStop')).to.eql(stopEntry);
  })

  it('passes a bound stopEntry function to EntryList', () => {
    const entryList = wrapper.find(EntryList);
    entryList.prop('onStop')(1);

    expect(stubs.EntryActionCreators.stopEntry.calledWith(1)).to.be.true;
  })

  it('should update entries when notified of a change and there is no error', () => {
    // set the EntryStore stub to return a changed (simple) set of entries
    stubs.EntryStore.getAllEntries.returns(['entry 1', 'entry 2', 'entry 3']);
    stubs.EntryStore.getTotalDuration.returns(120);

    wrapper.instance().onChange();

    expect(stubs.EntryStore.getAllEntries.called).to.be.true;
    expect(stubs.EntryStore.getHasApiError.called).to.be.true;
    expect(stubs.EntryStore.getTotalDuration.called).to.be.true;

    expect(wrapper.state().totalDuration).to.equal(120);

    expect(wrapper.state().showError).to.equal(false);

    expect(wrapper.state().entries.length).to.equal(3);
    expect(wrapper.state().entries[0]).to.equal('entry 1');
    expect(wrapper.state().entries[1]).to.equal('entry 2');
    expect(wrapper.state().entries[2]).to.equal('entry 3');
  });

  it('should not update entries when notified of a change if there is an error', () => {
    // set the EntryStore stub to return a changed (simple) set of entries
    stubs.EntryStore.getAllEntries.returns(['entry 1', 'entry 2', 'entry 3']);
    stubs.EntryStore.getTotalDuration.returns(120);
    stubs.EntryStore.getHasApiError.returns(true);

    wrapper.instance().onChange();

    expect(stubs.EntryStore.getHasApiError.called).to.be.true;
    expect(stubs.EntryStore.getAllEntries.called).to.be.false;
    expect(stubs.EntryStore.getTotalDuration.called).to.be.false;

    expect(wrapper.state().showError).to.equal(true);
  });

  it('should add a change listener on mounting', () => {
    wrapper = mount(<EntriesContainer/>);
    const onChange = wrapper.instance().onChange;
    expect(stubs.EntryStore.addChangeListener.calledWith(StoreEvents.ENTRIES_CHANGED, onChange)).to.be.true;
  });

  it('should remove the change listener on unmounting', () => {
    wrapper = mount(<EntriesContainer/>);
    const onChange = wrapper.instance().onChange;
    wrapper.unmount();
    expect(stubs.EntryStore.removeChangeListener.calledWith(StoreEvents.ENTRIES_CHANGED, onChange)).to.be.true;
  });

  it('should pass entries to EntryList for rendering', () => {
    // call onChange so that the EntryList has an up-to-date list of Entries
    wrapper.instance().onChange();

    expect(wrapper.find(EntryList).prop('entries')).to.exist;
    const entries = wrapper.find(EntryList).prop('entries');
    expect(entries.length).to.equal(2);
    expect(entries[0]).to.equal('entry 1');
    expect(entries[1]).to.equal('entry 2');
  });

  it('should render Error component if the store reports there was an error', () => {
    // set the EntryStore stub to return an error state
    stubs.EntryStore.getHasApiError.returns(true);

    wrapper.instance().onChange();

    expect(stubs.EntryStore.getHasApiError.called).to.be.true;
    expect(wrapper.state().showError).to.be.true;
    expect(wrapper.find(Error)).to.have.length(1);

    // now check it is not rendered if there is no error
    stubs.EntryStore.getHasApiError.returns(false);

    wrapper.instance().onChange();

    expect(stubs.EntryStore.getHasApiError.called).to.be.true;
    expect(wrapper.state().showError).to.be.false;
    expect(wrapper.find(Error)).to.have.length(0);
  });
});