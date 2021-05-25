import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Tab } from 'semantic-ui-react'
import Layout from '../../components/layout.js'
import Audio from '../../components/audio.js'
import BackButton from '../../components/backButton.js'
import AnnotationsList from '../../components/annotationsList.js'
import ResultsList from '../../components/resultsList.js'
import { useFile, useFileAnnotations, useFileResults } from '../../components/swr.js'
import React, { useRef, useEffect, Component, useState } from "react";

const AudioFile = () => {
    const router = useRouter()
    const { uuid } = router.query

    const { file, isLoading } = useFile(uuid)
    const { annotations, isLoading: isLoading2 } = useFileAnnotations(uuid)
    const { results, isLoading: isLoading3 } = useFileResults(uuid)
    console.log("results", results)
    return (
        <Layout active={'audioFiles'}>
            <BackButton />
            <Segment>
            <Header as='h3'>
                {!isLoading && file.upload_filename}
            </Header>
            <Audio
                detailed
                file={`/v1/audio/mp3?file_uuid=${uuid}`}
            />
            </Segment>
            <Tab menu={{ secondary: true, pointing: true }} panes={[
                {
                    menuItem: 'Annotations associated to this file',
                    render: () => (
                        <React.Fragment>
                            {!isLoading2 && <AnnotationsList annotations={annotations} />}
                        </React.Fragment>
                    )
                },
                {
                    menuItem: 'Search results in this file',
                    render: () => (
                        <React.Fragment>
                            {!isLoading3 && <ResultsList results={results} />}
                        </React.Fragment>
                    )
                }
            ]}/>
        </Layout>
    );
}

export default AudioFile
