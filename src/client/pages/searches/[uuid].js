import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment,
        Button, Transition, Step, Table, Loader, Pagination, Dropdown, Search, Tab } from 'semantic-ui-react'
import { useSearch, useSearchStatus, useSearchResults, useFileList, useSearchAnnotations } from '../../components/swr.js'
import React, { useRef, useEffect, Component, useState } from "react";
import Fuse from 'fuse.js'
import { fuse } from '../../components/fuse.js'
import SimpleAudio from '../../components/simpleAudio.js'

const SearchStatus = () => {
    const router = useRouter()
    const { uuid } = router.query

    const { search, isLoading } = useSearch(uuid)
    const { searchAnnotations, isLoading: isLoading5 } = useSearchAnnotations(uuid)
    const { status, isLoading: isLoading2 } = useSearchStatus(uuid)
    const { results: rawResults, isLoading: isLoading3 } = useSearchResults(uuid)
    const { fileList, isLoading: isLoading4 } = useFileList()

    const [ page, setPage ] = useState(1)
    const [ resultsPerPage, setResultsPerPage ] = useState(2)
    const [ column, setColumn ] = useState('')
    const [ direction, setDirection ] = useState('descending')
    const [ results, setResults ] = useState(rawResults)

    //console.log(direction, column, results)
    //console.log(searchAnnotations)
    // Add file upload name to each result
    let refine = (rarray) => rarray.map(r => {return {...r, upload_filename: isLoading4 ? '' : fileList.filter((f) => f.file_uuid == r.file_uuid)[0].upload_filename}; })

    // Update state results when necessary
    useEffect(() => {
        if (!isLoading3) {
            let refined_results = refine(rawResults)
            //console.log(rawResults.map(r => {return {...r, upload_filename: fileList.filter((f) => f.file_uuid == r.file_uuid)[0].upload_filename}; }))
            setResults(refined_results)
            fuse.setCollection(refined_results)
        }
    }, [isLoading3])

    useEffect(() => {
        if (results !== undefined) {
            //console.log(results.sort((a, b) => console.log(column, a[column], b[column])))
            setResults(results.sort((a, b) => direction == 'ascending' ? (a[column] > b[column] ? 1 : (a[column] < b[column] ? -1 : 0) ) : (a[column] > b[column] ? -1 : (a[column] < b[column] ? 1 : 0) ) ))
        }
    }, [direction, column])
    console.log(search)
    return (
        <Grid style={{ height: '100vh' }} verticalAlign='middle' centered>
            <Head>
              <title>QBE-STD</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <Grid.Column>
                <Container text>
                    <Header as='h2' dividing>
                        <Icon name='flag checkered' color={(!isLoading2) ? (status.status == 'SUCCESS' ? 'green' : 'orange') : 'grey'}/>
                        <Header.Content>
                            Search #{uuid}
                            <Header.Subheader>
                                Status:
                                {isLoading2 ?
                                <Loader />
                                : status.status }
                            </Header.Subheader>
                        </Header.Content>
                    </Header>

                    <Header as='h3'>Details of the search</Header>
                    {(isLoading || isLoading5) ? <Loader / > :
                    <React.Fragment>
                    <Tab menu={{ secondary: true, pointing: true }} panes={[
                        {
                            menuItem: 'Selected annotations',
                            render: () => (
                                <React.Fragment>
                                    {searchAnnotations.map((annot) => <p key={annot.annot_uuid}><Link href={'/annotation/' + annot.annot_uuid}>{annot.annotation}</Link></p>)}
                                </React.Fragment>
                            )
                        },
                        {
                            menuItem: 'Selected audio files',
                            render: () => (
                                <React.Fragment>
                                    {search.file_uuids.map((uuid) => <p key={uuid}><Link href={'/audio/' + uuid}>{fileList.filter(f => f.file_uuid == uuid)[0].upload_filename}</Link></p>)}
                                </React.Fragment>
                            )
                        }
                    ]}/>
                    </React.Fragment>
                    }
                    <Header as='h3'>Results</Header>

                    {isLoading3 ? <p>When they are ready, query results will be displayed here.</p> : <p>You can sort by clicking on a column name, or click on queries and files in the table to see details.</p>}

                    {(isLoading3 || results === undefined) ? <Loader/> :
                    <React.Fragment>
                    <div style={{float: 'right'}}>
                    Results per page:
                    <Dropdown style={{marginLeft: '1em'}} inline closeOnChange placeholder="Results per page" value={resultsPerPage} options={[
                        { key: 2, value: 2, text: '2'},
                        { key: 10, value: 10, text: '10'}
                    ]} onChange={(event, data) => { setResultsPerPage(data.value); setPage(1); }} />
                    </div>
                    <Search
                        fluid
                        style={{width: '60%'}}
                        onSearchChange={(e, { value }) => {
                            if (value.length) {
                                let fuse_results = fuse.search(value).map(search_result => search_result.item)
                                if (fuse_results.length > 0) setResults(fuse_results)
                            }
                            else {
                                setResults(refine(rawResults))
                            }
                        }}
                        resultRenderer={null}
                        showNoResults={false}
                        minCharacters={2}
                        placeholder={'Filter results'}
                    />
                    <div style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', flexBasis: 'content'}}>


                    </div>
                    <Table sortable celled striped>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell
                                    sorted={column == 'annot_uuid' ? direction : null}
                                    onClick={() => { column == 'annot_uuid' ? setDirection(prevDirection => (prevDirection == 'ascending') ? 'descending' : 'ascending') : setColumn('annot_uuid') }}
                                >
                                    Query
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                    sorted={column == 'file_uuid' ? direction : null}
                                    onClick={() => { column == 'file_uuid' ? setDirection(prevDirection => (prevDirection == 'ascending') ? 'descending' : 'ascending') : setColumn('file_uuid') }}
                                >
                                    Matched Audio
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                    sorted={column == 'match_score' ? direction : null}
                                    onClick={() => { column == 'match_score' ? setDirection(prevDirection => (prevDirection == 'ascending') ? 'descending' : 'ascending') : setColumn('match_score') }}
                                >
                                    Score &#40;Time region in file&#41;
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {results.slice(resultsPerPage*(page - 1), resultsPerPage*page).map((result) => (
                                <Table.Row key={result.result_uuid} id={result.result_uuid}>

                                    <Table.Cell selectable style={{lineHeight: '1em'}}>
                                        <SimpleAudio src={`/v1/audio/mp3?annot_uuid=${result.annot_uuid}`} />
                                        <Link href={'/annotation/' + result.annot_uuid}>
                                            {result.annotation}
                                        </Link>
                                    </Table.Cell>

                                    <Table.Cell selectable style={{lineHeight: '1em'}}>
                                        <SimpleAudio src={`/v1/audio/mp3?file_uuid=${result.file_uuid}&start_sec=${result.match_start_sec}&end_sec=${result.match_end_sec}`} />
                                        <Link href={'/audio/' + result.file_uuid}>
                                        {isLoading4 ? result.file_uuid : fileList.filter((f) => f.file_uuid == result.file_uuid)[0].upload_filename}
                                        </Link>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {result.match_score.toFixed(2)} ({result.match_start_sec.toFixed(2)} &#8211; {result.match_end_sec.toFixed(2)} s)
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                        <Pagination
                            pointing
                            secondary
                            defaultActivePage={page}
                            totalPages={isLoading3 ? 1 : Math.ceil(results.length / resultsPerPage)}
                            style={{marginBottom: 10}}
                            onPageChange={(event, data) => setPage(data.activePage)}
                            firstItem={(isLoading3 || Math.ceil(results.length / resultsPerPage) < 5) ? null : undefined}
                            lastItem={(isLoading3 || Math.ceil(results.length / resultsPerPage) < 5) ? null : undefined}
                            ellipsisItem={(isLoading3 || Math.ceil(results.length / resultsPerPage) < 5) ? null : undefined}
                        />
                    </div>
                    </React.Fragment>}

                    <div style={{float: 'clear'}} />

                    <Link href='/searches'>
                        <Button color='blue' floated='left'>
                            <Icon name='left arrow' />
                            Back
                        </Button>
                    </Link>

                    <Link href='/searches/new'>
                        <Button floated='right'>New search</Button>
                    </Link>
                </Container>
            </Grid.Column>
        </Grid>
    );
}

export default SearchStatus

//
// export async function getServerSideProps(context) {
//     console.log(process.env.API_URL + '/v1/search/get/' + context.query.uuid)
//     const res = await fetch(process.env.API_URL + '/v1/search/get/' + context.query.uuid)
//     const search = await res.json()
//
//     let results = []
//     await Promise.all(search.annot_uuids.map(async (uuid) => {
//         const res = await fetch(process.env.API_URL + '/v1/search/results?annot_uuid=' + uuid)
//         const data = await res.json()
//         // if (!data) {
//         //     return { notFound: true }
//         // }
//         results.push(data)
//     }))
//
//     const res2 = await fetch(process.env.API_URL + '/v1/search/status/' + context.query.uuid)
//     const status = await res2.json()
//
//     return {
//         props: {
//             results: results,
//             status: status
//         }
//     }
// }
