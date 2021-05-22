import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table } from 'semantic-ui-react'
import Layout from '../../components/layout.js'
import Audio from '../../components/audio.js'
import BackButton from '../../components/backButton.js'
import { useAnnotation } from '../../components/swr.js'

const Annotation = ({ file }) => {
    const router = useRouter()
    const { annotation, isLoading } = useAnnotation(router.query.uuid)
    console.log(annotation, file)

    return (
        <Layout active={'annotations'}>
            <Segment>
            <Header as='h3'>
                {annotation.annotation}
            </Header>
            <Audio
                file={`/v1/audio/mp3?annot_uuid=${router.query.uuid}`}
            />
            </Segment>
            <BackButton />
        </Layout>
    );
}

export default Annotation
