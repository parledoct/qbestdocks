import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Card } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import Audio from '../../components/audio.js'
import axios from 'axios'
import { API_URL } from '../../components/apiUrl.js'

const NewSearch = ({ files, annotations }) => {
    const [selectedFiles, setSelectedFiles] = useState([])
    const [selectedAnnotations, setSelectedAnnotations] = useState([])
    const router = useRouter()

    console.log('NewSearch', annotations, selectedFiles)
    let toggleFile = (uuid) => {
        let idx = selectedFiles.indexOf(uuid)
        let newFiles = [...selectedFiles]
        if (idx >= 0) {
            newFiles.splice(idx, 1)
        }
        else {
            newFiles.push(uuid)
        }
        setSelectedFiles(newFiles)
    }
    let toggleAnnotation = (uuid) => {
        let idx = selectedAnnotations.indexOf(uuid)
        let newAnnotations = [...selectedAnnotations]
        if (idx >= 0) {
            newAnnotations.splice(idx, 1)
        }
        else {
            newAnnotations.push(uuid)
        }
        setSelectedAnnotations(newAnnotations)
    }
    return (
        <Grid style={{ height: '100vh' }} verticalAlign='middle' centered>
            <Head>
              <title>QBE-STD</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <Grid.Column>
                <Container text>
                    <Header as='h1'>
                        Configure new search
                    </Header>

                    <Link href='/upload'>
                        <Button floated='right' color='green'>
                            <Icon name='plus' />
                            Upload audio file
                        </Button>
                    </Link>
                    <Header as='h2'>
                        Select audio files to search in
                    </Header>
                    <List selection verticalAlign='middle'>
                        {files.map((file) => (
                            <List.Item key={file.file_uuid} onClick={() => toggleFile(file.file_uuid)}>
                                <Icon
                                    color={(selectedFiles.indexOf(file.file_uuid) >= 0) ? 'green' : ''}
                                    name={(selectedFiles.indexOf(file.file_uuid) >= 0) ? 'check' : 'circle'} />
                                <List.Content>
                                    <List.Header>{file.upload_filename}</List.Header>
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>

                    <Link href='/annotation/new'>
                        <Button floated='right' color='green'>
                            <Icon name='plus' />
                            New annotation
                        </Button>
                    </Link>
                    <Header as='h2'>
                        Select queries
                    </Header>
                    {annotations.map((annotation) => (
                        <Card fluid link
                            style={{padding: 10, backgroundColor: (selectedAnnotations.indexOf(annotation.annot_uuid) >= 0) ? '#21ba45' : ''}}
                            key={annotation.annot_uuid}
                            onClick={() => toggleAnnotation(annotation.annot_uuid)}
                            color={(selectedAnnotations.indexOf(annotation.annot_uuid) >= 0) ? 'green' : ''}
                        >
                            <Card.Content>
                                <Card.Header>
                                    {annotation.annotation}
                                </Card.Header>
                                <Card.Meta>
                                    From file #{annotation.file_uuid}
                                </Card.Meta>
                                <Card.Description>
                                    <Audio
                                        key={annotation.annot_uuid}
                                        file={'/v1/audio/mp3?file_uuid=' + annotation.file_uuid + '&start_sec=' + annotation.start_sec + '&end_sec=' + annotation.end_sec + '&annot_uuid=' + annotation.annot_uuid}
                                    />
                                </Card.Description>
                            </Card.Content>
                        </Card>
                    ))}

                    <Link href='/searches'>
                        <Button color='blue'>
                            <Icon name='left arrow' />
                            Back
                        </Button>
                    </Link>
                    <Button color='green' floated='right' onClick={() => axios.post(API_URL + '/v1/search/', {
                        file_uuids: selectedFiles,
                        annot_uuids: selectedAnnotations
                    }).then((response) => {
                        console.log('Success', response);
                        router.push('/searches')
                    }, (err) => console.log('Error', err))}>
                        <Icon name='cogs' />
                        Submit search
                    </Button>
                </Container>
            </Grid.Column>
        </Grid>
    );
}

export default NewSearch

export async function getServerSideProps(context) {

    const res = await fetch(process.env.API_URL + '/v1/audio/list')
    const files = await res.json()

    const res2 = await fetch(process.env.API_URL + '/v1/annotations/list')
    const annotations = await res2.json()
    // let annotations = []
    // await Promise.all(files.map(async ({ file_uuid }) => {
    //     const res = await fetch(process.env.API_URL + '/v1/annotations?file_uuid=' + file_uuid)
    //     const data = await res.json()
    //     console.log(file_uuid)
    //     // if (!data) {
    //     //     return { notFound: true }
    //     // }
    //     annotations.push(data)
    // }))

    return {
        props: {
            files: files,
            annotations: annotations
        }
    }
}
