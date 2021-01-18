import React from 'react';
import './App.css';
import {PostList} from './components';

import {ApolloProvider} from '@apollo/react-hooks';
import {split} from 'apollo-link';
import {HttpLink} from 'apollo-link-http';
import {WebSocketLink} from 'apollo-link-ws';
import {getMainDefinition} from 'apollo-utilities';
import ApolloClient from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";

// Create an http link:
const httpLink = new HttpLink({
    uri: 'http://localhost:4000'
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
    uri: `ws://localhost:4000/graphql`,
    options: {
        reconnect: true
    }
});


// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
    // split based on operation type
    ({query}) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink,
);

const client = new ApolloClient({
    link,
    cache: new InMemoryCache()
});

function App() {
    return (
        <div className="App">
            <ApolloProvider client={client}>
                <PostList/>
            </ApolloProvider>
        </div>
    );
}

export default App;
