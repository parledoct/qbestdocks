import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table } from 'semantic-ui-react'
import Edit from '../../components/edit.js'

//let file_uuids = ["59f01612-6ff2-4593-8b4a-89881ea81aea", "ec18f3b2-d657-401b-a149-02f59fb627d2"]

const NewAnnotation = ({ files }) => {
    const router = useRouter()
    return (
        <Grid style={{ height: '100vh' }} verticalAlign='middle' centered>
            <Head>
              <title>QBE-STD</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <Grid.Column>
                <Container text>
                    <Header as='h1'>
                        Create new annotations
                    </Header>

                    <Edit files={files}/>

                    <Button color='blue' onClick={() => router.back()}>
                        <Icon name='left arrow' />
                        Back
                    </Button>
                </Container>
            </Grid.Column>
        </Grid>
    );
}

export default NewAnnotation

export async function getServerSideProps(context) {
    const res = await fetch(process.env.API_URL + '/v1/audio/list')
    const files = await res.json()

    let annotations = []
    await Promise.all(files.map(async ({ file_uuid }) => {
        const res = await fetch(process.env.API_URL + '/v1/annotations?file_uuid=' + file_uuid)
        const data = await res.json()
        console.log(file_uuid)
        // if (!data) {
        //     return { notFound: true }
        // }
        annotations.push(data)
    }))

    return {
        props: {
            files: files,
            annotations: annotations
        }
    }
}
