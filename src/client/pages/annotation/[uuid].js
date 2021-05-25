import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table } from 'semantic-ui-react'
import Layout from '../../components/layout.js'
import Audio from '../../components/audio.js'
import BackButton from '../../components/backButton.js'
import { useAnnotation, useAnnotationResults } from '../../components/swr.js'
import ResultsList from '../../components/resultsList.js'

const Annotation = ({ file }) => {
    const router = useRouter()
    const { annotation, isLoading } = useAnnotation(router.query.uuid)
    const { results, isLoading: isLoading2 } = useAnnotationResults(router.query.uuid)
    console.log(annotation, file, results)

    return (
        <Layout active={'annotations'}>
            <BackButton />
            <Segment>
            <Header as='h3'>
                {annotation.annotation}
            </Header>
            <Audio
                detailed
                file={`/v1/audio/mp3?annot_uuid=${router.query.uuid}`}
            />
            </Segment>
            <Header as='h4'>
                Search results associated
            </Header>
            {!isLoading2 && <ResultsList results={results} />}
        </Layout>
    );
}

export default Annotation
