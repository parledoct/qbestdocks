import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table } from 'semantic-ui-react'

const SearchStatus = ({ results, status }) => {
    const router = useRouter()
    const { uuid } = router.query
    console.log(uuid, results, status)

    return (
        <Grid style={{ height: '100vh' }} verticalAlign='middle' centered>
            <Head>
              <title>QBE-STD</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <Grid.Column>
                <Container text>
                    <Header as='h2' dividing>
                        <Icon name='cogs' circular inverted color='teal'/>
                        <Header.Content>
                            Search #{uuid}
                            <Header.Subheader>Status: {status.status}</Header.Subheader>
                        </Header.Content>
                    </Header>


                    <p>When they are ready, query results will be displayed here. You can click on queries or files in the table to see more details and results.</p>

                    <Table celled striped>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    Query
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Audio
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Score
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {results.map((result) => (
                                <Table.Row key={result.result_uuid}>
                                    <Table.Cell>
                                        {result.annot_uuid}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {result.file_uuid}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {result.score}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>

                    <Link href='/searches'>
                        <Button color='blue' floated='left'>
                            <Icon name='left arrow' />
                            Back
                        </Button>
                    </Link>

                    <Link href='/upload'>
                        <Button floated='right'>New search</Button>
                    </Link>
                </Container>
            </Grid.Column>
        </Grid>
    );
}

export default SearchStatus


export async function getServerSideProps(context) {
    console.log(process.env.API_URL + '/v1/search/get/' + context.query.uuid)
    const res = await fetch(process.env.API_URL + '/v1/search/get/' + context.query.uuid)
    const search = await res.json()

    let results = []
    await Promise.all(search.annot_uuids.map(async (uuid) => {
        const res = await fetch(process.env.API_URL + '/v1/search/results?annot_uuid=' + uuid)
        const data = await res.json()
        // if (!data) {
        //     return { notFound: true }
        // }
        results.push(data)
    }))

    const res2 = await fetch(process.env.API_URL + '/v1/search/status/' + context.query.uuid)
    const status = await res2.json()

    return {
        props: {
            results: results,
            status: status
        }
    }
}
