import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table } from 'semantic-ui-react'
import Layout from '../../components/layout.js'
import Audio from '../../components/audio.js'
import BackButton from '../../components/backButton.js'
import AnnotationsList from '../../components/annotationsList.js'
import { useFile, useFileAnnotations } from '../../components/swr.js'

const AudioFile = () => {
    const router = useRouter()
    const { uuid } = router.query

    const { file, isLoading } = useFile(uuid)
    const { annotations, isLoading: isLoading2 } = useFileAnnotations(uuid)
    console.log(uuid, file, annotations)

    return (
        <Layout active={'audioFiles'}>
            <Segment>
            <Header as='h3'>
                {!isLoading && file.upload_filename}
            </Header>
            <Audio
                file={`${process.env.API_URL}/v1/audio/mp3?file_uuid=${router.query.uuid}`}
            />
            </Segment>
            <Header as='h3'>
                Annotations associated to this file
            </Header>
            <AnnotationsList annotations={annotations} />
            <BackButton />
        </Layout>
    );
}

export default AudioFile
