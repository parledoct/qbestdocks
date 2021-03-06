import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Card, Search } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import { fuse } from './fuse.js'
import { useFileList } from './swr.js'
import SimpleAudio from './simpleAudio.js'

const annotationsList = ({ annotations, asList = true, selectedAnnotations = [], toggleAnnotation }) => {
    const [ displayAnnotations, setDisplayAnnotations ] = useState([])
    const { fileList, isLoading: isLoading4 } = useFileList()

    // Add file upload name to each result
    let refine = (rarray) => rarray.map(r => {return {...r, upload_filename: isLoading4 ? '' : fileList.filter((f) => f.file_uuid == r.file_uuid)[0].upload_filename}; })

    useEffect(() => {
        let newAnnotations = refine(annotations)
        fuse.setCollection(newAnnotations)
        setDisplayAnnotations(newAnnotations)
    }, [annotations]);

    console.log(displayAnnotations)
    return (
        <React.Fragment>
        <Search
            fluid
            onSearchChange={(e, { value }) => {
                if (value.length) {
                    let fuse_results = fuse.search(value).map(search_result => search_result.item)
                    if (fuse_results.length > 0) setDisplayAnnotations(fuse_results)
                }
                else {
                    setDisplayAnnotations(refine(annotations))
                }
            }}
            resultRenderer={null}
            showNoResults={false}
            minCharacters={2}
            placeholder={'Filter annotations'}
            style={{marginBottom: '1em'}}
        />
        {asList ?
        <List selection>
            {displayAnnotations.map((annotation) => (
                <Link href={'/annotation/' + annotation.annot_uuid } key={annotation.annot_uuid}>
                <List.Item key={annotation.annot_uuid}>
                    <SimpleAudio src={`/v1/audio/mp3?annot_uuid=${annotation.annot_uuid}`} />
                    <List.Content>
                        <List.Header>
                        {annotation.annotation}
                        </List.Header>
                        <List.Description>
                         in {annotation.upload_filename}
                        </List.Description>
                    </List.Content>
                </List.Item>
                </Link>
            ))}
            {annotations.length === 0 ? <p>No annotations yet.</p>: ''}
        </List>
        :
        <Card.Group style={{marginBottom: '1em'}}>
        {displayAnnotations.map((annotation) => (
            <Card link
                style={{padding: 10, backgroundColor: (selectedAnnotations.indexOf(annotation.annot_uuid) >= 0) ? '#21ba45' : ''}}
                key={annotation.annot_uuid}
                onClick={() => toggleAnnotation(annotation.annot_uuid)}
                color={(selectedAnnotations.indexOf(annotation.annot_uuid) >= 0) ? 'green' : ''}
            >
                <Card.Content>
                    <Card.Header>
                        <SimpleAudio src={`/v1/audio/mp3?annot_uuid=${annotation.annot_uuid}`} />
                        {annotation.annotation}
                    </Card.Header>
                    <Card.Meta>
                        From file {isLoading4 ? annotation.file_uuid : fileList.filter(f => f.file_uuid == annotation.file_uuid)[0].upload_filename}
                    </Card.Meta>
                </Card.Content>
            </Card>
        ))}
        </Card.Group>
        }
        </React.Fragment>
    );
}
export default annotationsList
