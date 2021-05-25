import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Loader } from 'semantic-ui-react'
import Layout from '../../components/layout.js'
import Audio from '../../components/audio.js'
import BackButton from '../../components/backButton.js'
import { useAnnotation, useAnnotationResults } from '../../components/swr.js'
import ResultsList from '../../components/resultsList.js'
import React, { useRef, useEffect, Component, useState } from "react";
import axios from 'axios'
import { API_URL } from '../../components/apiUrl.js'

const Annotation = () => {
    const router = useRouter()
    const { annotation, isLoading } = useAnnotation(router.query.uuid)
    const { results, isLoading: isLoading2 } = useAnnotationResults(router.query.uuid)
    console.log(annotation, results)
    const window = 0.5
    console.log(Math.min(window, annotation.start_sec), Math.max(annotation.start_sec-window, 0)+(annotation.end_sec - annotation.start_sec))

    const [ start, setStart ] = useState(0)
    const [ end, setEnd ] = useState(0)
    const [ label, setLabel ] = useState('')

    useEffect(() => {
        // update backend
        if (start && end) {
            console.log('start or end changed', [{
                ...annotation,
                start_sec: start + Math.min(annotation.start_sec-window),
                end_sec: end + Math.min(annotation.start_sec-window),
                action: 'update'
            }])
            axios.post(`${API_URL}/v1/annotations/update`, [{
                ...annotation,
                start_sec: start + Math.min(annotation.start_sec-window),
                end_sec: end + Math.min(annotation.start_sec-window),
                action: 'update'
            }])
        }
    }, [start, end])

    useEffect(() => {
        console.log('useEffect label')
        if (label) {
            console.log('updating')
            axios.post(`${API_URL}/v1/annotations/update`, [{
                ...annotation,
                annotation: label,
                action: 'update'
            }])
        }
    }, [label])

    useEffect(() => {
        setStart(Math.min(window, annotation.start_sec))
        setEnd(Math.min(window, annotation.start_sec)+(annotation.end_sec - annotation.start_sec))
        setLabel(annotation.annotation)
    }, [isLoading])

    return (
        <Layout active={'annotations'}>
            <BackButton />
            {isLoading ? <Loader /> :
            <Segment>
            <Header as='h3'>
                {label}
            </Header>
            <Audio
                detailed
                file={`/v1/audio/mp3?file_uuid=${annotation.file_uuid}&start_sec=${Math.max(annotation.start_sec-window, 0)}&end_sec=${annotation.end_sec+window}`}
                annotatedRegions={[{
                    start: start,
                    end: end,
                    label: label,
                    file_id: annotation.file_uuid
                }]}
                updateAnnotatedRegions={(x) => {
                    if (x.attributes.new) {
                        console.log('oh no')
                    }
                    else {
                        if (x.attributes.delete) {
                            axios.post(`${API_URL}/v1/annotations/update`, [{
                                ...annotation,
                                action: 'delete'
                            }])
                            router.back()
                        } else {
                            // simple update
                            setStart(x.start);
                            setEnd(x.end);
                        }
                    }
                }}
                updateRegionLabel={(id, text) => setLabel(text)}
            />
            </Segment>}
            <Header as='h4'>
                Search results associated
            </Header>
            {!isLoading2 && <ResultsList results={results} />}
        </Layout>
    );
}

export default Annotation
