import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import Layout from '../components/layout.js'

let uuids = ["44c82457-2388-48ec-890d-e6f71fa0a2f4"];

function Searches ({ searches }) {
    console.log(searches)

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

            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>UUID</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {searches.map((search) => (
                        <Table.Row key={search.search_uuid} positive={search.status == 'SUCCESS'} warning={search.status == 'PENDING'} negative={search.status == 'FAILURE'}>
                            <Table.Cell>
                                {search.search_uuid}
                            </Table.Cell>
                            <Table.Cell/>
                            <Table.Cell>
                                {search.status}
                            </Table.Cell>
                            <Table.Cell>
                                <Link href={'/searches/' + search.search_uuid}><Button color='blue' icon><Icon name='folder open outline'/></Button></Link>
                                <Button color='red' icon><Icon name='delete'/></Button>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </Layout>
    );
}

export default Searches

export async function getServerSideProps(context) {
    const res = await fetch(process.env.API_URL + '/v1/search/list')
    const searches = await res.json()
    // let searches = []
    // await Promise.all(uuids.map(async (uuid) => {
    //     const res = await fetch(process.env.API_URL + '/v1/search/status/' + uuid)
    //     const data = await res.json()
    //     if (!data) {
    //         return { notFound: true }
    //     }
    //     searches.push(data)
    // }))

    return {
        props: {
            searches: searches
        }
    }
}
