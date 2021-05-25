import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import Layout from '../components/layout.js'

function Searches ({ searches }) {
    console.log(searches)
    console.log(process.env.API_URL)
    const [ showDelete, setShowDelete ] = useState(false)

    return (
        <Layout active={'searches'}>
            <Link href='/searches/new'>
                <Button floated='right' color='green'>
                    <Icon name='plus' />
                    New search
                </Button>
            </Link>
            <Header as='h1'>
                Browse existing searches
            </Header>
            <p>Click on a search to see its details.</p>
            <List selection divided relaxed>
            {searches.map((search) => (
                <List.Item key={search.search_uuid} positive={search.status == 'SUCCESS'} warning={search.status == 'PENDING'} negative={search.status == 'FAILURE'}>
                    {(search.status == 'SUCCESS') ?
                    <List.Icon name='check' color='green' size='large' verticalAlign='middle' />
                    : ((search.status == 'PENDING') ?
                    <List.Icon name='circle' size='large' verticalAlign='middle' />
                    :
                    <List.Icon name='cross' color='red' size='large' verticalAlign='middle' />
                    )}
                    <List.Content verticalAlign='middle'>
                        <Link href={'/searches/' + search.search_uuid}>
                        <List.Header onMouseEnter={(e) => setShowDelete(true)} onMouseLeave={() => setShowDelete(false)}>
                            {search.search_uuid}
                            <Button
                                basic
                                style={{visibility: showDelete ? 'visible' : 'hidden', marginLeft: '3em'}}
                                onClick={(e) => {
                                    console.log('click');
                                    e.stopPropagation();
                                }}
                                color='red' size='tiny'>
                                Delete
                            </Button>
                        </List.Header>
                        </Link>
                        <List.Description>

                        </List.Description>
                    </List.Content>
                </List.Item>
            ))}
            </List>
        </Layout>
    );
}

export default Searches

export async function getServerSideProps(context) {
    const res = await fetch(process.env.API_URL + '/v1/search/list')
    const searches = await res.json()

    return {
        props: {
            searches: searches
        }
    }
}
