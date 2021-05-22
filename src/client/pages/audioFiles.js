import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Card } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import Layout from '../components/layout.js'

const AudioFiles = ({ files }) => {
    console.log('AudioFiles', files)
    return (
        <Layout active={'audioFiles'}>
            <Link href='/upload'>
                <Button floated='right' color='green'>
                    <Icon name='plus' />
                    Upload audio file
                </Button>
            </Link>
            <Header as='h1'>
                Browse existing audio files
            </Header>
            Click on a file to see more details (annotations) and listen to it.
            <List selection>
                {files.map((file) => (
                    <Link href={'/audio/' + file.file_uuid } key={file.file_uuid}>
                    <List.Item>
                        <Icon name='file' />
                        {file.upload_filename}
                    </List.Item>
                    </Link>
                ))}
            </List>
        </Layout>
    );
}

export default AudioFiles

export async function getServerSideProps(context) {
    const res = await fetch(process.env.API_URL + '/v1/audio/list')
    const files = await res.json()

    return {
        props: {
            files: files
        }
    }
}
