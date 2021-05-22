import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Table, Select } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import Audio from './audio.js'
import axios from 'axios'
import { API_URL } from './apiUrl.js'

function Edit(props) {
    console.log('Edit', props.files)
    const [files, setFiles] = useState(props.files)
    const [fileIndex, setFileIndex] = useState(-1)

    const router = useRouter()
    const [queries, setQueries] = useState([])
    //console.log(files)
    const [regions, setRegions] = useState(props.files.map((f) => []))
    //console.log('file current', fileIndex, files[fileIndex])
    console.log('region current', regions, fileIndex)

    return (
        <div>
            <Link href='/upload'>
                <Button floated='right' color='green'>
                    <Icon name='plus' />
                    Upload audio file
                </Button>
            </Link>
            <p>Click & drag to define new queries. Click on a text label to edit it.</p>
            <Form>
                <Form.Field>
                    <label>Audio files</label>
                    <Select
                        options={files.map((file) => { return {key: file.file_uuid, value: file.file_uuid, text: file.upload_filename}; } )}
                        value={ (files.length > 0) && (fileIndex > -1) ? files[fileIndex].file_uuid : ''}
                        onChange={(event, data) => setFileIndex(files.findIndex((f) => f.file_uuid == data.value))}
                    />
                </Form.Field>
            </Form>

            {(files !== undefined) && (files.length > 0) && (fileIndex > -1) && (
                        <Audio
                            file={'/v1/audio/mp3?file_uuid=' + files[fileIndex].file_uuid}
                            annotatedRegions={regions[fileIndex]}
                            updateAnnotatedRegions={(x) => {
                                console.log('updateAnnotatedRegions', x, fileIndex, regions)
                                if (x.attributes.new) {
                                    console.log('adding', regions)

                                    setRegions(prevRegions => [...prevRegions.slice(0, fileIndex), prevRegions[fileIndex].concat([{
                                                start: x.start,
                                                end: x.end,
                                                label: "New query",
                                                file_id: 'blabla'
                                            }]), ...prevRegions.slice(fileIndex+1)])
                                }
                                else {
                                    setRegions(prevRegions => [...prevRegions.slice(0, fileIndex), [...prevRegions[fileIndex].slice(0, x.id), { ...prevRegions[fileIndex][x.id], start: x.start, end: x.end }, ...prevRegions[fileIndex].slice(x.id+1)], ...prevRegions.slice(fileIndex+1)]);
                                }
                            }}
                            updateRegionLabel={(id, text) => {
                                console.log('update label', id , text)
                                setRegions(prevRegions => [...prevRegions.slice(0, fileIndex), [ ...prevRegions[fileIndex].slice(0, id), { ...prevRegions[fileIndex][id], label: text }, ...prevRegions[fileIndex].slice(id+1)], ...prevRegions.slice(fileIndex+1)])
                            }}
                        />
            )}

            <Table celled striped>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>
                            File ID
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Text label
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Audio
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                {regions[fileIndex] !== undefined && regions[fileIndex].map((query, queryIdx) => (
                    <Table.Row key={queryIdx}>
                        <Table.Cell>{query.file_id}</Table.Cell>
                        <Table.Cell>{query.label}</Table.Cell>
                        <Table.Cell>{query.start}-{query.end}</Table.Cell>
                    </Table.Row>
                ))}
                </Table.Body>

            </Table>

            <div style={{clear: 'both'}}/>
            <p>Once you have checked the query labels and associations, you can submit your search job.</p>

            <Button size='huge' primary onClick={ () => axios.post(API_URL + '/v1/annotations/update', [].concat.apply([], regions.map((fileRegions, regionIdx) => fileRegions.map((region) => {
                return {
                    file_uuid: props.files[regionIdx].file_uuid,
                    action: 'insert',
                    annotation: region.label,
                    start_sec: region.start,
                    end_sec: region.end,
                };
            })))).then((response) => console.log("Success", response), (err) => console.log("Error", err))  }>
                Submit
            </Button>
        </div>
    );
}

export default Edit
