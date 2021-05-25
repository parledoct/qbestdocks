import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Card, Search } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import { fuse } from './fuse.js'
import { useFileList } from './swr.js'
import SimpleAudio from './simpleAudio.js'

const filesList = ({ files }) => {
    const [ displayFiles, setDisplayFiles ] = useState([])
    //const { fileList, isLoading: isLoading4 } = useFileList()

    // Add file upload name to each result
    //let refine = (rarray) => rarray.map(r => {return {...r, upload_filename: fileList.filter((f) => f.file_uuid == r.file_uuid)[0].upload_filename}; })

    useEffect(() => {
        fuse.setCollection(files)
        setDisplayFiles(files)
    }, [files]);

    return (
        <React.Fragment>
        <Search
            fluid
            onSearchChange={(e, { value }) => {
                if (value.length) {
                    let fuse_results = fuse.search(value).map(search_result => search_result.item)
                    if (fuse_results.length > 0) setDisplayFiles(fuse_results)
                }
                else {
                    setDisplayFiles(files)
                }
            }}
            resultRenderer={null}
            showNoResults={false}
            minCharacters={2}
            placeholder={'Filter files'}
        />
        <List selection>
            {displayFiles.map((file) => (
                <Link href={'/audio/' + file.file_uuid } key={file.file_uuid}>
                <List.Item key={file.file_uuid}>
                    <SimpleAudio src={`/v1/audio/mp3?file_uuid=${file.file_uuid}`} />
                    <List.Content>
                        <List.Header>
                        {file.upload_filename}
                        </List.Header>
                        <List.Description>
                         # {file.file_uuid}
                        </List.Description>
                    </List.Content>
                </List.Item>
                </Link>
            ))}
            {files.length === 0 ? <p>No files yet.</p>: ''}
        </List>
        </React.Fragment>
    );
}
export default filesList
