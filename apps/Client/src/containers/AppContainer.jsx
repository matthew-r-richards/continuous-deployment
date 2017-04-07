import React, { Component } from 'react';
import Header from '../components/Header';
import EntriesContainer from './EntriesContainer';

export default class AppContainer extends Component {
    render() {
        return (
            <div>
                <Header/>
                <EntriesContainer/>
            </div>
        );
    }
}