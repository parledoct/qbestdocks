import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import Edit from '../components/edit.js'
import { useRouter } from 'next/router'
import { API_URL } from '../components/apiUrl.js'
import useWindowDimensions from '../components/window.js'

import Uppy from '@uppy/core'
import GoogleDrive from '@uppy/google-drive'
//import DashboardModule from '@uppy/dashboard'
import Url from '@uppy/url'
import { Dashboard, StatusBar, useUppy } from '@uppy/react'
import XHRUpload from '@uppy/xhr-upload'

function Upload() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [collection, setCollection] = useState("")
    const [searchFiles, setSearchFiles] = useState([])
    const { height, width } = useWindowDimensions()

    const searchUploader = useUppy(() => {
        return new Uppy({
            id: 'searchUploader',
            autoProceed: false,
            restrictions: {
                allowedFileTypes: ['.wav']
            }
        }).use(XHRUpload, {
            id: 'XHRUpload',
            metaFields: [],
            fieldName: 'files',
            //endpoint: 'https://29e819c1-68b3-4c5e-9b52-39f08345f759.mock.pstmn.io/upload'
            endpoint: API_URL + '/v1/audio/upload',
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        });
    });
    searchUploader.on('upload-success', (file, response) => {
        console.log('upload success', file, response);
        if (response.status === 200) {
            setCollection(response.body.collection_id)
        }
        else {
            console.log('Error while uploading', response)
        }
        router.back()
    });
    searchUploader.on('upload-error', (file, error, response) => console.log(error, response))
    // searchUploader.on('file-added', (file) => {
    //     searchUploader.setFileMetaData(file.id, {
    //         collection: collection
    //     })
    // })
    searchUploader.on('complete', (result) => {
        console.log('complete', result)
        if (result.failed.length === 0) {
            setSearchFiles(result.successful)
        }
    })

    return (
        <Grid style={{ height: '100vh' }} verticalAlign='middle' centered>
            <Head>
              <title>QBE-STD</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <Grid.Column>
                <Container text>
                <Header as='h1'>
                    Upload a new audio file
                </Header>

                <Segment>
                    <Dashboard id="step1" uppy={searchUploader} height={ height/2 } />
                </Segment>
                <Button color='blue' onClick={() => router.back()}>
                    <Icon name='left arrow' />
                    Back
                </Button>
                </Container>
            </Grid.Column>
        </Grid>
    );
}

export default Upload
