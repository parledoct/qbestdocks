import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";

//import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'

export default function Home()  {
    const router = useRouter()

    useEffect(() => router.push('/searches') );

    return (
        <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Head>
              <title>QBE-STD</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>
        </Grid>
    );
}
