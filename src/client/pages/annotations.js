import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Card } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import Layout from '../components/layout.js'
import AnnotationsList from '../components/annotationsList.js'

const Annotations = ({ annotations }) => {
    return (
        <Layout active={'annotations'}>
            <Link href='/annotation/new'>
                <Button floated='right' color='green'>
                    <Icon name='plus' />
                    New annotations
                </Button>
            </Link>
            <Header as='h1'>
                Browse existing annotations
            </Header>
            <AnnotationsList annotations={annotations} />
        </Layout>
    );
}

export default Annotations

export async function getServerSideProps(context) {
    const res = await fetch(process.env.API_URL + '/v1/annotations/list')
    const annotations = await res.json()

    return {
        props: {
            annotations: annotations
        }
    }
}
